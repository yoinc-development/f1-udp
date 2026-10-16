import {readFile, writeFile} from 'node:fs/promises'
import {basename} from 'node:path'
import type {GameVersion} from '@shared/settings'
import {decode} from '../protocol/decoder'
import {VERSIONS} from '../protocol/versions'
import {MAX_HEADER_SIZE, parseHeader, RecordParser} from '../replay/format'
import {isGameVersion, type ByteSource} from '../replay/player'
import {WorldState} from '../state/world'
import {checkFormat} from '../udp/version-guard'
import type {DirectorConfig} from './config'
import {DirectorRun, tickWorld} from './run'
import type {Decision} from './types'

const CHUNK_SIZE = 1024 * 1024

export const DECISIONS_EXTENSION = 'decisions.jsonl'

export function decisionsPath(recordingPath: string): string {
    return `${recordingPath.replace(/\.f1rec$/, '')}.${DECISIONS_EXTENSION}`
}

export class DecisionAnalyzer {
    private readonly world = new WorldState()
    private readonly run: DirectorRun

    constructor(
        config: DirectorConfig,
        private readonly gameVersion: GameVersion,
        private readonly decodePacket: typeof decode = decode
    ) {
        this.run = new DirectorRun(config)
    }

    push(buffer: Buffer): Decision | null {
        const expected = VERSIONS[this.gameVersion].packetFormat
        if (checkFormat(buffer, expected).result !== 'ok') return null
        try {
            const {header, packetId, data} = this.decodePacket(buffer, this.gameVersion)
            if (!data) return null
            this.world.apply(this.gameVersion, header, packetId, data)
        } catch {
            return null
        }
        return tickWorld(this.run, this.world, this.gameVersion)
    }
}

export interface AnalysisOptions {
    decode?: typeof decode
    onProgress?: (progress: number, decisions: number) => void
    signal?: AbortSignal
}

export interface AnalysisResult {
    file: string | null
    decisions: number
}

export async function readDecisions(file: string): Promise<Decision[]> {
    const text = await readFile(file, 'utf8')
    return text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
        .map((line) => JSON.parse(line) as Record<string, unknown>)
        .filter((entry) => !('meta' in entry)) as unknown as Decision[]
}

function nextTurn(): Promise<void> {
    return new Promise((resolve) => setImmediate(resolve))
}

export async function analyzeRecording(
    source: ByteSource,
    recordingPath: string,
    config: DirectorConfig,
    options: AnalysisOptions = {}
): Promise<AnalysisResult> {
    const head = await source.read(0, Math.min(MAX_HEADER_SIZE, source.size))
    const {info, size: headerSize} = parseHeader(head)
    if (!isGameVersion(info.gameVersion)) {
        throw new Error(`Unknown game version ${info.gameVersion} in the recording`)
    }

    const analyzer = new DecisionAnalyzer(config, info.gameVersion, options.decode)
    const parser = new RecordParser()
    const decisions: Decision[] = []
    for (let position = headerSize; position < source.size; position += CHUNK_SIZE) {
        if (options.signal?.aborted) return {file: null, decisions: decisions.length}
        const chunk = await source.read(position, Math.min(CHUNK_SIZE, source.size - position))
        for (const packet of parser.push(chunk)) {
            const decision = analyzer.push(packet.data)
            if (decision) decisions.push(decision)
        }
        options.onProgress?.(Math.min((position + CHUNK_SIZE) / source.size, 1), decisions.length)
        await nextTurn()
    }

    const meta = {
        meta: {
            recording: basename(recordingPath),
            gameVersion: info.gameVersion,
            recordedAt: new Date(info.startedAt).toISOString(),
            config
        }
    }
    const file = decisionsPath(recordingPath)
    const lines = [meta, ...decisions].map((line) => JSON.stringify(line))
    await writeFile(file, `${lines.join('\n')}\n`, 'utf8')
    return {file, decisions: decisions.length}
}

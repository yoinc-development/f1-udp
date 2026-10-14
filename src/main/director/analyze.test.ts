import {mkdtempSync, readFileSync, rmSync, existsSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import type {DecodedPacket} from '../protocol/decoder'
import type {StructValue} from '../protocol/reader'
import {encodeHeader, encodeRecord} from '../replay/format'
import type {ByteSource} from '../replay/player'
import {analyzeRecording, decisionsPath, readDecisions} from './analyze'
import {DEFAULT_CONFIG} from './config'

const FORMAT = 2025
const SESSION_PACKET = 1
const LAP_PACKET = 2

let directory: string

beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'f1-udp-analyze-'))
})

afterEach(() => {
    rmSync(directory, {recursive: true, force: true})
})

function memorySource(bytes: Buffer): ByteSource {
    return {
        size: bytes.length,
        read: (position, length) => Promise.resolve(bytes.subarray(position, position + length)),
        close: () => Promise.resolve()
    }
}

function lap(position: number, intervalMs: number): StructValue {
    return {
        resultStatus: 2,
        carPosition: position,
        currentLapNum: 3,
        lastLapTimeInMS: 0,
        deltaToRaceLeaderMSPart: 0,
        deltaToRaceLeaderMinutesPart: 0,
        deltaToCarInFrontMSPart: intervalMs,
        deltaToCarInFrontMinutesPart: 0,
        pitStatus: 0,
        numPitStops: 0,
        penalties: 0,
        totalWarnings: 0
    }
}

const frames: {packetId: number; time: number; data: StructValue}[] = []
frames.push({
    packetId: SESSION_PACKET,
    time: 0,
    data: {
        trackId: 5,
        sessionType: 15,
        totalLaps: 5,
        safetyCarStatus: 0,
        sessionTimeLeft: 0,
        isSpectating: 1,
        spectatorCarIndex: 255
    }
})
for (let time = 0; time <= 30; time += 0.5) {
    const idle = {resultStatus: 0}
    frames.push({
        packetId: LAP_PACKET,
        time,
        data: {lapData: [lap(1, 0), lap(2, 5000), lap(3, 300), ...Array(19).fill(idle)]}
    })
}

function decodeStub(buffer: Buffer): DecodedPacket {
    const frame = frames[buffer.readUInt8(2)]
    if (!frame) throw new Error('unknown frame')
    return {
        header: {
            sessionUID: 1n,
            sessionTime: frame.time,
            packetId: frame.packetId,
            playerCarIndex: 255
        },
        packetId: frame.packetId,
        data: frame.data
    }
}

function recording(gameVersion = 'f1-25'): Buffer {
    const header = encodeHeader({gameVersion, port: 20777, startedAt: Date.UTC(2026, 9, 14)})
    const records = frames.map((_, index) => {
        const packet = Buffer.alloc(3)
        packet.writeUInt16LE(FORMAT, 0)
        packet.writeUInt8(index, 2)
        return encodeRecord(index * 10, packet)
    })
    return Buffer.concat([header, ...records])
}

function readLines(file: string): unknown[] {
    return readFileSync(file, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line) as unknown)
}

describe('decisionsPath', () => {
    it('puts the decisions next to the recording', () => {
        expect(decisionsPath(join('a', 'race.f1rec'))).toBe(join('a', 'race') + '.decisions.jsonl')
    })
})

describe('analyzeRecording', () => {
    it('writes a meta line and one line per decision', async () => {
        const path = join(directory, 'race.f1rec')
        const result = await analyzeRecording(memorySource(recording()), path, DEFAULT_CONFIG, {
            decode: decodeStub
        })

        expect(result).toEqual({file: join(directory, 'race.decisions.jsonl'), decisions: 2})
        const [meta, first, second] = readLines(result.file ?? '') as Record<string, unknown>[]
        expect(meta).toMatchObject({
            meta: {
                recording: 'race.f1rec',
                gameVersion: 'f1-25',
                recordedAt: '2026-10-14T00:00:00.000Z'
            }
        })
        expect(first).toMatchObject({
            t: 0.5,
            target: {car: 0},
            kind: 'leader',
            rule: 'initial target'
        })
        expect(second).toMatchObject({t: 15.5, target: {car: 1}, kind: 'battle'})
    })

    it('writes the same file when run twice', async () => {
        const path = join(directory, 'race.f1rec')
        const first = await analyzeRecording(memorySource(recording()), path, DEFAULT_CONFIG, {
            decode: decodeStub
        })
        const firstText = readFileSync(first.file ?? '', 'utf8')
        const second = await analyzeRecording(memorySource(recording()), path, DEFAULT_CONFIG, {
            decode: decodeStub
        })

        expect(readFileSync(second.file ?? '', 'utf8')).toBe(firstText)
    })

    it('reports progress up to 100%', async () => {
        const progress: number[] = []
        await analyzeRecording(
            memorySource(recording()),
            join(directory, 'race.f1rec'),
            DEFAULT_CONFIG,
            {
                decode: decodeStub,
                onProgress: (value) => progress.push(value)
            }
        )

        expect(progress.at(-1)).toBe(1)
    })

    it('writes no file when cancelled', async () => {
        const abort = new AbortController()
        abort.abort()
        const path = join(directory, 'race.f1rec')
        const result = await analyzeRecording(memorySource(recording()), path, DEFAULT_CONFIG, {
            decode: decodeStub,
            signal: abort.signal
        })

        expect(result.file).toBeNull()
        expect(existsSync(decisionsPath(path))).toBe(false)
    })

    it('skips packets of another packet format and packets that cannot be decoded', async () => {
        const header = encodeHeader({gameVersion: 'f1-25', port: 20777, startedAt: 0})
        const other = Buffer.from([0xe5, 0x07, 0])
        const broken = Buffer.from([0xe9, 0x07, 250])
        const bytes = Buffer.concat([header, encodeRecord(0, other), encodeRecord(1, broken)])
        const result = await analyzeRecording(
            memorySource(bytes),
            join(directory, 'x.f1rec'),
            DEFAULT_CONFIG,
            {decode: decodeStub}
        )

        expect(result.decisions).toBe(0)
    })

    it('rejects a file that is not a recording or has an unknown game version', async () => {
        const path = join(directory, 'x.f1rec')

        await expect(
            analyzeRecording(memorySource(Buffer.from('not a recording')), path, DEFAULT_CONFIG)
        ).rejects.toThrow()
        await expect(
            analyzeRecording(memorySource(recording('f1-99')), path, DEFAULT_CONFIG)
        ).rejects.toThrow('f1-99')
    })
})

describe('readDecisions', () => {
    it('returns the decisions of a decisions file without the meta line', async () => {
        const path = join(directory, 'race.f1rec')
        const result = await analyzeRecording(memorySource(recording()), path, DEFAULT_CONFIG, {
            decode: decodeStub
        })
        const decisions = await readDecisions(result.file ?? '')

        expect(decisions.map((decision) => [decision.t, decision.target.car])).toEqual([
            [0.5, 0],
            [15.5, 1]
        ])
    })
})

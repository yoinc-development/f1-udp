import {open as openFile} from 'node:fs/promises'
import {GAME_VERSIONS, type GameVersion} from '@shared/settings'
import type {ReplaySpeed, ReplayStatus} from '@shared/udp'
import {MAX_HEADER_SIZE, parseHeader, RecordParser, type RecordedPacket} from './format'

const CHUNK_SIZE = 1024 * 1024
const TICK_MS = 10
const REFILL_BELOW = 2000

export interface ByteSource {
    size: number
    read: (position: number, length: number) => Promise<Buffer>
    close: () => Promise<void>
}

export async function openFileSource(path: string): Promise<ByteSource> {
    const handle = await openFile(path, 'r')
    const {size} = await handle.stat()
    return {
        size,
        read: async (position, length) => {
            const buffer = Buffer.alloc(length)
            const {bytesRead} = await handle.read(buffer, 0, length, position)
            return buffer.subarray(0, bytesRead)
        },
        close: () => handle.close()
    }
}

export type PacketHandler = (buffer: Buffer) => void

export function isGameVersion(value: string): value is GameVersion {
    return (GAME_VERSIONS as readonly string[]).includes(value)
}

const IDLE: ReplayStatus = {
    state: 'idle',
    file: null,
    gameVersion: null,
    positionMs: 0,
    durationMs: 0,
    speed: 1
}

export class Player {
    private source: ByteSource | null = null
    private parser = new RecordParser()
    private queue: RecordedPacket[] = []
    private head = 0
    private readOffset = 0
    private headerSize = 0
    private eof = false
    private reading = false
    private timer: NodeJS.Timeout | null = null
    private lastTickAt = 0
    private handler: PacketHandler | null = null
    private current: ReplayStatus = IDLE

    constructor(private readonly now: () => number = Date.now) {}

    get status(): ReplayStatus {
        return this.current
    }

    get active(): boolean {
        return this.current.state === 'playing' || this.current.state === 'paused'
    }

    async open(source: ByteSource, file: string): Promise<GameVersion> {
        this.stop()
        try {
            const head = await source.read(0, Math.min(MAX_HEADER_SIZE, source.size))
            const {info, size} = parseHeader(head)
            if (!isGameVersion(info.gameVersion)) {
                throw new Error(`Unknown game version ${info.gameVersion} in the recording`)
            }
            this.source = source
            this.headerSize = size
            const durationMs = await this.scanDuration(source, size)
            this.current = {...IDLE, file, gameVersion: info.gameVersion, durationMs}
            return info.gameVersion
        } catch (error) {
            await source.close().catch(() => undefined)
            this.source = null
            this.current = {...IDLE, file, state: 'error', error: messageOf(error)}
            throw error
        }
    }

    play(handler: PacketHandler, speed: ReplaySpeed): void {
        if (!this.source || this.current.state === 'error') return
        this.rewind()
        this.handler = handler
        this.current = {...this.current, state: 'playing', speed, positionMs: 0}
        this.lastTickAt = this.now()
        this.startTimer()
        this.refill()
    }

    pause(): void {
        if (this.current.state !== 'playing') return
        this.stopTimer()
        this.current = {...this.current, state: 'paused'}
    }

    resume(): void {
        if (this.current.state !== 'paused') return
        this.current = {...this.current, state: 'playing'}
        this.lastTickAt = this.now()
        this.startTimer()
    }

    setSpeed(speed: ReplaySpeed): void {
        this.current = {...this.current, speed}
    }

    fail(message: string): void {
        this.release()
        this.current = {...this.current, state: 'error', error: message}
    }

    stop(): void {
        this.release()
        this.current = IDLE
    }

    private release(): void {
        this.stopTimer()
        const source = this.source
        this.source = null
        this.handler = null
        this.queue = []
        this.head = 0
        if (source) void source.close().catch(() => undefined)
    }

    private rewind(): void {
        this.parser = new RecordParser()
        this.queue = []
        this.head = 0
        this.readOffset = this.headerSize
        this.eof = false
    }

    private async scanDuration(source: ByteSource, start: number): Promise<number> {
        const parser = new RecordParser()
        let last = 0
        for (let position = start; position < source.size; position += CHUNK_SIZE) {
            const chunk = await source.read(position, Math.min(CHUNK_SIZE, source.size - position))
            for (const packet of parser.push(chunk)) last = packet.offsetMs
        }
        return last
    }

    private refill(): void {
        const source = this.source
        if (!source || this.reading || this.eof) return
        if (this.queue.length - this.head >= REFILL_BELOW) return
        this.reading = true
        const length = Math.min(CHUNK_SIZE, source.size - this.readOffset)
        const request = length > 0 ? source.read(this.readOffset, length) : Promise.resolve(null)
        request
            .then((chunk) => {
                this.reading = false
                if (this.source !== source) return
                if (!chunk || chunk.length === 0) {
                    this.eof = true
                    return
                }
                this.readOffset += chunk.length
                if (this.head > 0) {
                    this.queue = this.queue.slice(this.head)
                    this.head = 0
                }
                for (const packet of this.parser.push(chunk)) this.queue.push(packet)
            })
            .catch((error: unknown) => {
                this.reading = false
                if (this.source === source) this.fail(messageOf(error))
            })
    }

    private startTimer(): void {
        this.stopTimer()
        this.timer = setInterval(() => this.tick(), TICK_MS)
    }

    private stopTimer(): void {
        if (this.timer) clearInterval(this.timer)
        this.timer = null
    }

    private tick(): void {
        const now = this.now()
        const elapsed = now - this.lastTickAt
        this.lastTickAt = now
        const waiting = this.head >= this.queue.length && !this.eof
        let positionMs = this.current.positionMs
        if (!waiting) positionMs += elapsed * this.current.speed
        const handler = this.handler
        while (handler && this.head < this.queue.length) {
            const packet = this.queue[this.head]
            if (!packet || packet.offsetMs > positionMs) break
            this.head++
            handler(packet.data)
            if (this.current.state !== 'playing') return
        }
        this.refill()
        if (this.head >= this.queue.length && this.eof) {
            this.stopTimer()
            this.current = {...this.current, state: 'ended', positionMs: this.current.durationMs}
            return
        }
        this.current = {...this.current, positionMs}
    }
}

function messageOf(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

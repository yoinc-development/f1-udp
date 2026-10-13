import {createWriteStream, mkdirSync, type WriteStream} from 'node:fs'
import {join} from 'node:path'
import type {RecordingStatus} from '@shared/udp'
import {encodeHeader, encodeRecord, MAX_OFFSET_MS, MAX_RECORD_SIZE} from './format'

export const RECORDING_EXTENSION = 'f1rec'

export interface RecorderOptions {
    gameVersion: string
    port: number
}

function pad(value: number): string {
    return String(value).padStart(2, '0')
}

export function recordingFileName(gameVersion: string, at: number): string {
    const date = new Date(at)
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const time = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
    return `${day}_${time}_${gameVersion}.${RECORDING_EXTENSION}`
}

const IDLE: RecordingStatus = {active: false, file: null, packets: 0, bytes: 0}

export class Recorder {
    private stream: WriteStream | null = null
    private startedAt = 0
    private current: RecordingStatus = IDLE

    get status(): RecordingStatus {
        return this.current
    }

    start(directory: string, options: RecorderOptions, now: number): string {
        if (this.stream) throw new Error('Already recording')
        mkdirSync(directory, {recursive: true})
        const file = join(directory, recordingFileName(options.gameVersion, now))
        const stream = createWriteStream(file)
        stream.on('error', (error) => {
            if (this.stream !== stream) return
            this.stream = null
            this.current = {...this.current, active: false, error: error.message}
            stream.destroy()
        })
        const header = encodeHeader({
            gameVersion: options.gameVersion,
            port: options.port,
            startedAt: now
        })
        stream.write(header)
        this.stream = stream
        this.startedAt = now
        this.current = {active: true, file, packets: 0, bytes: header.length}
        return file
    }

    write(buffer: Buffer, now: number): void {
        const stream = this.stream
        if (!stream || buffer.length > MAX_RECORD_SIZE) return
        const offset = Math.min(Math.max(now - this.startedAt, 0), MAX_OFFSET_MS)
        const record = encodeRecord(offset, buffer)
        stream.write(record)
        this.current = {
            ...this.current,
            packets: this.current.packets + 1,
            bytes: this.current.bytes + record.length
        }
    }

    fail(message: string): void {
        this.current = {...IDLE, error: message}
    }

    stop(): Promise<void> {
        const stream = this.stream
        if (!stream) return Promise.resolve()
        this.stream = null
        this.current = {...this.current, active: false}
        return new Promise((resolve) => {
            stream.once('close', () => resolve())
            stream.end()
        })
    }
}

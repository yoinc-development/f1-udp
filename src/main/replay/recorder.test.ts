import {mkdtempSync, readFileSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {parseHeader, RecordParser} from './format'
import {Recorder, recordingFileName} from './recorder'

let directory: string

beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'f1-udp-rec-'))
})

afterEach(() => {
    rmSync(directory, {recursive: true, force: true})
})

describe('Recorder', () => {
    it('writes the header and every datagram with its offset', async () => {
        const recorder = new Recorder()
        const file = recorder.start(directory, {gameVersion: 'f1-25', port: 20777}, 1000)
        recorder.write(Buffer.from([1, 2, 3]), 1000)
        recorder.write(Buffer.from([4, 5]), 1016)
        await recorder.stop()

        const bytes = readFileSync(file)
        const {info, size} = parseHeader(bytes)
        const packets = new RecordParser().push(bytes.subarray(size))

        expect(info).toEqual({gameVersion: 'f1-25', port: 20777, startedAt: 1000})
        expect(packets.map((packet) => packet.offsetMs)).toEqual([0, 16])
        expect(packets.map((packet) => [...packet.data])).toEqual([
            [1, 2, 3],
            [4, 5]
        ])
    })

    it('counts packets and bytes', async () => {
        const recorder = new Recorder()
        const file = recorder.start(directory, {gameVersion: 'f1-25', port: 20777}, 0)
        recorder.write(Buffer.alloc(10), 5)
        recorder.write(Buffer.alloc(20), 9)

        expect(recorder.status).toMatchObject({active: true, file, packets: 2})
        await recorder.stop()

        expect(recorder.status.active).toBe(false)
        expect(recorder.status.bytes).toBe(readFileSync(file).length)
    })

    it('ignores writes while not recording', () => {
        const recorder = new Recorder()
        recorder.write(Buffer.alloc(4), 10)

        expect(recorder.status.packets).toBe(0)
    })

    it('refuses to start twice', async () => {
        const recorder = new Recorder()
        recorder.start(directory, {gameVersion: 'f1-25', port: 20777}, 0)

        expect(() => recorder.start(directory, {gameVersion: 'f1-25', port: 20777}, 1)).toThrow(
            'Already recording'
        )
        await recorder.stop()
    })
})

describe('recordingFileName', () => {
    it('contains the local date, time and game version', () => {
        const at = new Date(2026, 9, 14, 8, 5, 3).getTime()

        expect(recordingFileName('f1-25', at)).toBe('2026-10-14_08-05-03_f1-25.f1rec')
    })
})

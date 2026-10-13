import {describe, expect, it} from 'vitest'
import {encodeHeader, encodeRecord, parseHeader, RecordParser} from './format'

const INFO = {gameVersion: 'f1-25', port: 20777, startedAt: 1_700_000_000_123}

function stream(...records: [number, number[]][]): Buffer {
    return Buffer.concat(records.map(([offset, bytes]) => encodeRecord(offset, Buffer.from(bytes))))
}

describe('header', () => {
    it('round trips the recording info', () => {
        const header = encodeHeader(INFO)

        expect(parseHeader(header)).toEqual({info: INFO, size: header.length})
    })

    it('reports the header size when records follow', () => {
        const header = encodeHeader(INFO)
        const buffer = Buffer.concat([header, stream([5, [1, 2]])])

        expect(parseHeader(buffer).size).toBe(header.length)
    })

    it('rejects a file with the wrong magic', () => {
        const buffer = Buffer.from(encodeHeader(INFO))
        buffer.write('NOTAREC!', 0, 'ascii')

        expect(() => parseHeader(buffer)).toThrow('Not an f1-udp recording')
    })

    it('rejects an unsupported format version', () => {
        const buffer = Buffer.from(encodeHeader(INFO))
        buffer.writeUInt16LE(2, 8)

        expect(() => parseHeader(buffer)).toThrow('Unsupported recording format version 2')
    })

    it('rejects an incomplete header', () => {
        const buffer = encodeHeader(INFO).subarray(0, 14)

        expect(() => parseHeader(buffer)).toThrow('incomplete')
    })
})

describe('RecordParser', () => {
    it('reads the offset and the bytes of each record', () => {
        const parser = new RecordParser()
        const packets = parser.push(stream([0, [1, 2, 3]], [16, [4]], [32, []]))

        expect(packets.map((packet) => packet.offsetMs)).toEqual([0, 16, 32])
        expect([...packets[0]!.data]).toEqual([1, 2, 3])
        expect([...packets[1]!.data]).toEqual([4])
        expect(packets[2]!.data.length).toBe(0)
    })

    it('handles records split across any chunk boundary', () => {
        const bytes = stream([0, [1, 2, 3]], [16, [4, 5]], [33, [6]])

        for (let size = 1; size <= bytes.length; size++) {
            const parser = new RecordParser()
            const packets = []
            for (let start = 0; start < bytes.length; start += size) {
                packets.push(...parser.push(bytes.subarray(start, start + size)))
            }

            expect(packets.map((packet) => packet.offsetMs)).toEqual([0, 16, 33])
            expect(packets.map((packet) => [...packet.data])).toEqual([[1, 2, 3], [4, 5], [6]])
        }
    })

    it('drops a truncated last record', () => {
        const bytes = stream([0, [1, 2]], [10, [3, 4, 5]])
        const parser = new RecordParser()
        const packets = parser.push(bytes.subarray(0, bytes.length - 1))

        expect(packets.map((packet) => packet.offsetMs)).toEqual([0])
    })
})

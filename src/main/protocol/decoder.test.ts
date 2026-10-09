import {describe, expect, it} from 'vitest'
import {decode} from './decoder'

function header2021(): Buffer {
    const buffer = Buffer.alloc(24)
    buffer.writeUInt16LE(2021, 0)
    buffer.writeUInt8(1, 2)
    buffer.writeUInt8(14, 3)
    buffer.writeUInt8(1, 4)
    buffer.writeUInt8(6, 5)
    buffer.writeBigUInt64LE(123456789012345n, 6)
    buffer.writeFloatLE(12.5, 14)
    buffer.writeUInt32LE(4321, 18)
    buffer.writeUInt8(3, 22)
    buffer.writeUInt8(255, 23)
    return buffer
}

function header2025Or2026(format: number, year: number): Buffer {
    const buffer = Buffer.alloc(29)
    buffer.writeUInt16LE(format, 0)
    buffer.writeUInt8(year, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(6, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    return buffer
}

describe('decode', () => {
    it('decodes the f1-2021 header', () => {
        const packet = decode(header2021(), 'f1-2021')

        expect(packet.packetId).toBe(6)
        expect(packet.data).toBeNull()
        expect(packet.header).toEqual({
            packetFormat: 2021,
            gameMajorVersion: 1,
            gameMinorVersion: 14,
            packetVersion: 1,
            packetId: 6,
            sessionUID: 123456789012345n,
            sessionTime: 12.5,
            frameIdentifier: 4321,
            playerCarIndex: 3,
            secondaryPlayerCarIndex: 255
        })
    })

    it.each([
        ['f1-25', 2025, 25],
        ['f1-26', 2026, 26]
    ] as const)('decodes the %s header', (version, format, year) => {
        const packet = decode(header2025Or2026(format, year), version)

        expect(packet.packetId).toBe(6)
        expect(packet.data).toBeNull()
        expect(packet.header).toEqual({
            packetFormat: format,
            gameYear: year,
            gameMajorVersion: 1,
            gameMinorVersion: 7,
            packetVersion: 1,
            packetId: 6,
            sessionUID: 987654321098765n,
            sessionTime: 34.25,
            frameIdentifier: 5000,
            overallFrameIdentifier: 5100,
            playerCarIndex: 4,
            secondaryPlayerCarIndex: 255
        })
    })

    it('throws when the datagram is shorter than the header', () => {
        expect(() => decode(Buffer.alloc(10), 'f1-25')).toThrow(/too short/)
    })
})

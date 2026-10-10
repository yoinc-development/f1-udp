import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {PacketTyreSetsData, TyreSetData} from './tyresets'

const SET_SIZE = 10

function tyreSetsPacket(): Buffer {
    const buffer = Buffer.alloc(231)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(12, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    buffer.writeUInt8(9, 29)
    writeSet(buffer, 30, [18, 16, 12, 1, 3, 20, 25], -350, 1)
    writeSet(buffer, 30 + 19 * SET_SIZE, [7, 7, 0, 0, 5, 12, 15], 1200, 0)
    buffer.writeUInt8(0, 230)
    return buffer
}

function writeSet(
    buffer: Buffer,
    offset: number,
    bytes: number[],
    lapDelta: number,
    fitted: number
): void {
    buffer.set(bytes, offset)
    buffer.writeInt16LE(lapDelta, offset + 7)
    buffer.writeUInt8(fitted, offset + 9)
}

describe('f1-25 PacketTyreSetsData', () => {
    it('is 231 bytes with the header as in the spec', () => {
        expect(sizeOf(TyreSetData)).toBe(SET_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketTyreSetsData)).toBe(231)
    })

    it('decodes a tyre sets packet', () => {
        const packet = decode(tyreSetsPacket(), 'f1-25')

        expect(packet.packetId).toBe(12)
        const data = packet.data as {carIdx: number; tyreSetData: unknown[]; fittedIdx: number}
        expect(data.carIdx).toBe(9)
        expect(data.fittedIdx).toBe(0)
        expect(data.tyreSetData).toHaveLength(20)
        expect(data.tyreSetData[0]).toEqual({
            actualTyreCompound: 18,
            visualTyreCompound: 16,
            wear: 12,
            available: 1,
            recommendedSession: 3,
            lifeSpan: 20,
            usableLife: 25,
            lapDeltaTime: -350,
            fitted: 1
        })
    })

    it('decodes the last set with a positive lap delta', () => {
        const data = decode(tyreSetsPacket(), 'f1-25').data as {
            tyreSetData: {actualTyreCompound: number; lapDeltaTime: number; fitted: number}[]
        }

        expect(data.tyreSetData[19]).toMatchObject({
            actualTyreCompound: 7,
            lapDeltaTime: 1200,
            fitted: 0
        })
    })
})

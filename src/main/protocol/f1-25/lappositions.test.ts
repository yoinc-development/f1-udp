import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {PacketLapPositionsData} from './lappositions'

const CARS = 22

function lapPositionsPacket(): Buffer {
    const buffer = Buffer.alloc(1131)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(15, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    buffer.set([3, 50], 29)
    for (let car = 0; car < 20; car++) {
        buffer.writeUInt8(car + 1, 31 + car)
        buffer.writeUInt8(20 - car, 31 + CARS + car)
    }
    buffer.writeUInt8(7, 31 + 49 * CARS + 21)
    return buffer
}

describe('f1-25 PacketLapPositionsData', () => {
    it('is 1131 bytes with the header as in the spec', () => {
        expect(sizeOf(PacketHeader) + sizeOf(PacketLapPositionsData)).toBe(1131)
    })

    it('decodes a lap positions packet', () => {
        const packet = decode(lapPositionsPacket(), 'f1-25')

        expect(packet.packetId).toBe(15)
        const data = packet.data as {
            numLaps: number
            lapStart: number
            positionForVehicleIdx: number[][]
        }
        expect(data.numLaps).toBe(3)
        expect(data.lapStart).toBe(50)
        expect(data.positionForVehicleIdx).toHaveLength(50)
        expect(data.positionForVehicleIdx.every((lap) => lap.length === CARS)).toBe(true)
        expect(data.positionForVehicleIdx[0]).toEqual([
            ...Array.from({length: 20}, (_, car) => car + 1),
            0,
            0
        ])
        expect(data.positionForVehicleIdx[1]).toEqual([
            ...Array.from({length: 20}, (_, car) => 20 - car),
            0,
            0
        ])
        expect(data.positionForVehicleIdx[2]!.every((position) => position === 0)).toBe(true)
        expect(data.positionForVehicleIdx[49]![21]).toBe(7)
    })
})

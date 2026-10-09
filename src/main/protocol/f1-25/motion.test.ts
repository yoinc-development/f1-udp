import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {CarMotionData, PacketMotionData} from './motion'

const CAR_SIZE = 60

function motionPacket(): Buffer {
    const buffer = Buffer.alloc(1349)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(0, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    writeCar(buffer, 29, 1)
    writeCar(buffer, 29 + 21 * CAR_SIZE, -1)
    return buffer
}

function writeCar(buffer: Buffer, offset: number, sign: number): void {
    const floats = [100.5, 200.25, -300.75, 10.5, -20.25, 30.125]
    floats.forEach((value, index) => buffer.writeFloatLE(value * sign, offset + index * 4))
    const directions = [32767, -32767, 0, 16384, -16384, 1]
    directions.forEach((value, index) => buffer.writeInt16LE(value * sign, offset + 24 + index * 2))
    const tail = [1.5, -2.5, 0.25, 3.0, -0.5, 0.125]
    tail.forEach((value, index) => buffer.writeFloatLE(value * sign, offset + 36 + index * 4))
}

function expectedCar(sign: number) {
    return {
        worldPositionX: 100.5 * sign,
        worldPositionY: 200.25 * sign,
        worldPositionZ: -300.75 * sign,
        worldVelocityX: 10.5 * sign,
        worldVelocityY: -20.25 * sign,
        worldVelocityZ: 30.125 * sign,
        worldForwardDirX: 32767 * sign,
        worldForwardDirY: -32767 * sign,
        worldForwardDirZ: 0,
        worldRightDirX: 16384 * sign,
        worldRightDirY: -16384 * sign,
        worldRightDirZ: 1 * sign,
        gForceLateral: 1.5 * sign,
        gForceLongitudinal: -2.5 * sign,
        gForceVertical: 0.25 * sign,
        yaw: 3.0 * sign,
        pitch: -0.5 * sign,
        roll: 0.125 * sign
    }
}

describe('f1-25 PacketMotionData', () => {
    it('is 1349 bytes with the header as in the spec', () => {
        expect(sizeOf(CarMotionData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketMotionData)).toBe(1349)
    })

    it('decodes a motion packet', () => {
        const packet = decode(motionPacket(), 'f1-25')

        expect(packet.packetId).toBe(0)
        const cars = packet.data?.carMotionData as unknown[]
        expect(cars).toHaveLength(22)
        expect(cars[0]).toEqual(expectedCar(1))
        expect(Object.values(cars[1] as Record<string, number>).every((value) => value === 0)).toBe(
            true
        )
        expect(cars[21]).toEqual(expectedCar(-1))
    })
})

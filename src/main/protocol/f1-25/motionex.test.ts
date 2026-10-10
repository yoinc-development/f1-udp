import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {PacketMotionExData} from './motionex'

const FLOAT_COUNT = 61

function motionExPacket(): Buffer {
    const buffer = Buffer.alloc(273)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(13, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    for (let index = 0; index < FLOAT_COUNT; index++) {
        buffer.writeFloatLE(index + 0.5, 29 + index * 4)
    }
    return buffer
}

describe('f1-25 PacketMotionExData', () => {
    it('is 273 bytes with the header as in the spec', () => {
        expect(sizeOf(PacketMotionExData)).toBe(FLOAT_COUNT * 4)
        expect(sizeOf(PacketHeader) + sizeOf(PacketMotionExData)).toBe(273)
    })

    it('decodes a motion ex packet', () => {
        const packet = decode(motionExPacket(), 'f1-25')

        expect(packet.packetId).toBe(13)
        expect(packet.data).toEqual({
            suspensionPosition: [0.5, 1.5, 2.5, 3.5],
            suspensionVelocity: [4.5, 5.5, 6.5, 7.5],
            suspensionAcceleration: [8.5, 9.5, 10.5, 11.5],
            wheelSpeed: [12.5, 13.5, 14.5, 15.5],
            wheelSlipRatio: [16.5, 17.5, 18.5, 19.5],
            wheelSlipAngle: [20.5, 21.5, 22.5, 23.5],
            wheelLatForce: [24.5, 25.5, 26.5, 27.5],
            wheelLongForce: [28.5, 29.5, 30.5, 31.5],
            heightOfCOGAboveGround: 32.5,
            localVelocityX: 33.5,
            localVelocityY: 34.5,
            localVelocityZ: 35.5,
            angularVelocityX: 36.5,
            angularVelocityY: 37.5,
            angularVelocityZ: 38.5,
            angularAccelerationX: 39.5,
            angularAccelerationY: 40.5,
            angularAccelerationZ: 41.5,
            frontWheelsAngle: 42.5,
            wheelVertForce: [43.5, 44.5, 45.5, 46.5],
            frontAeroHeight: 47.5,
            rearAeroHeight: 48.5,
            frontRollAngle: 49.5,
            rearRollAngle: 50.5,
            chassisYaw: 51.5,
            chassisPitch: 52.5,
            wheelCamber: [53.5, 54.5, 55.5, 56.5],
            wheelCamberGain: [57.5, 58.5, 59.5, 60.5]
        })
    })
})

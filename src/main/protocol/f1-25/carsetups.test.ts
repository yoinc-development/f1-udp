import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {CarSetupData, PacketCarSetupData} from './carsetups'
import {PacketHeader} from './header'

const CAR_SIZE = 50

function carSetupsPacket(): Buffer {
    const buffer = Buffer.alloc(1133)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(5, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    writeCar(buffer, 29)
    buffer.writeFloatLE(9, 29 + 22 * CAR_SIZE)
    return buffer
}

function writeCar(buffer: Buffer, offset: number): void {
    buffer.set([11, 12, 70, 55], offset)
    buffer.writeFloatLE(-3.5, offset + 4)
    buffer.writeFloatLE(-2.25, offset + 8)
    buffer.writeFloatLE(0.125, offset + 12)
    buffer.writeFloatLE(0.5, offset + 16)
    buffer.set([21, 22, 4, 5, 30, 35, 100, 58, 60], offset + 20)
    buffer.writeFloatLE(22.5, offset + 29)
    buffer.writeFloatLE(22.75, offset + 33)
    buffer.writeFloatLE(23.5, offset + 37)
    buffer.writeFloatLE(23.75, offset + 41)
    buffer.writeUInt8(6, offset + 45)
    buffer.writeFloatLE(42.5, offset + 46)
}

describe('f1-25 PacketCarSetupData', () => {
    it('is 1133 bytes with the header as in the spec', () => {
        expect(sizeOf(CarSetupData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketCarSetupData)).toBe(1133)
    })

    it('decodes a car setups packet', () => {
        const packet = decode(carSetupsPacket(), 'f1-25')

        expect(packet.packetId).toBe(5)
        const data = packet.data as {
            carSetups: unknown[]
            nextFrontWingValue: number
        }
        expect(data.carSetups).toHaveLength(22)
        expect(data.nextFrontWingValue).toBe(9)
        expect(data.carSetups[0]).toEqual({
            frontWing: 11,
            rearWing: 12,
            onThrottle: 70,
            offThrottle: 55,
            frontCamber: -3.5,
            rearCamber: -2.25,
            frontToe: 0.125,
            rearToe: 0.5,
            frontSuspension: 21,
            rearSuspension: 22,
            frontAntiRollBar: 4,
            rearAntiRollBar: 5,
            frontSuspensionHeight: 30,
            rearSuspensionHeight: 35,
            brakePressure: 100,
            brakeBias: 58,
            engineBraking: 60,
            rearLeftTyrePressure: 22.5,
            rearRightTyrePressure: 22.75,
            frontLeftTyrePressure: 23.5,
            frontRightTyrePressure: 23.75,
            ballast: 6,
            fuelLoad: 42.5
        })
        expect(data.carSetups[21]).toMatchObject({frontWing: 0, fuelLoad: 0})
    })
})

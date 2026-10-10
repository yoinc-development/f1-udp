import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {CarTelemetryData, PacketCarTelemetryData} from './cartelemetry'
import {PacketHeader} from './header'

const CAR_SIZE = 60

function carTelemetryPacket(): Buffer {
    const buffer = Buffer.alloc(1352)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
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
    writeCar(buffer, 29, 6)
    writeCar(buffer, 29 + 21 * CAR_SIZE, -1)
    const tail = 29 + 22 * CAR_SIZE
    buffer.writeUInt8(255, tail)
    buffer.writeUInt8(2, tail + 1)
    buffer.writeInt8(-1, tail + 2)
    return buffer
}

function writeCar(buffer: Buffer, offset: number, gear: number): void {
    buffer.writeUInt16LE(312, offset)
    buffer.writeFloatLE(0.75, offset + 2)
    buffer.writeFloatLE(-0.5, offset + 6)
    buffer.writeFloatLE(0.25, offset + 10)
    buffer.writeUInt8(40, offset + 14)
    buffer.writeInt8(gear, offset + 15)
    buffer.writeUInt16LE(11500, offset + 16)
    buffer.writeUInt8(1, offset + 18)
    buffer.writeUInt8(80, offset + 19)
    buffer.writeUInt16LE(0x7fff, offset + 20)
    for (const [index, temperature] of [400, 410, 900, 1020].entries()) {
        buffer.writeUInt16LE(temperature, offset + 22 + index * 2)
    }
    buffer.set([90, 91, 92, 93], offset + 30)
    buffer.set([100, 101, 102, 103], offset + 34)
    buffer.writeUInt16LE(105, offset + 38)
    for (const [index, pressure] of [22.5, 22.75, 23.5, 23.75].entries()) {
        buffer.writeFloatLE(pressure, offset + 40 + index * 4)
    }
    buffer.set([0, 1, 2, 3], offset + 56)
}

describe('f1-25 PacketCarTelemetryData', () => {
    it('is 1352 bytes with the header as in the spec', () => {
        expect(sizeOf(CarTelemetryData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketCarTelemetryData)).toBe(1352)
    })

    it('decodes a car telemetry packet', () => {
        const packet = decode(carTelemetryPacket(), 'f1-25')

        expect(packet.packetId).toBe(6)
        const data = packet.data as {
            carTelemetryData: unknown[]
            mfdPanelIndex: number
            mfdPanelIndexSecondaryPlayer: number
            suggestedGear: number
        }
        expect(data.carTelemetryData).toHaveLength(22)
        expect(data.mfdPanelIndex).toBe(255)
        expect(data.mfdPanelIndexSecondaryPlayer).toBe(2)
        expect(data.suggestedGear).toBe(-1)
        expect(data.carTelemetryData[0]).toEqual({
            speed: 312,
            throttle: 0.75,
            steer: -0.5,
            brake: 0.25,
            clutch: 40,
            gear: 6,
            engineRPM: 11500,
            drs: 1,
            revLightsPercent: 80,
            revLightsBitValue: 0x7fff,
            brakesTemperature: [400, 410, 900, 1020],
            tyresSurfaceTemperature: [90, 91, 92, 93],
            tyresInnerTemperature: [100, 101, 102, 103],
            engineTemperature: 105,
            tyresPressure: [22.5, 22.75, 23.5, 23.75],
            surfaceType: [0, 1, 2, 3]
        })
    })

    it('decodes the reverse gear as a signed value', () => {
        const data = decode(carTelemetryPacket(), 'f1-25').data as {
            carTelemetryData: {gear: number}[]
        }

        expect(data.carTelemetryData[21]!.gear).toBe(-1)
    })
})

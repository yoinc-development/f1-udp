import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {CarStatusData, PacketCarStatusData} from './carstatus'
import {PacketHeader} from './header'

const CAR_SIZE = 55

function carStatusPacket(): Buffer {
    const buffer = Buffer.alloc(1239)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(7, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    writeCar(buffer, 29, 2)
    writeCar(buffer, 29 + 21 * CAR_SIZE, -1)
    return buffer
}

function writeCar(buffer: Buffer, offset: number, flag: number): void {
    buffer.set([2, 1, 3, 58, 1], offset)
    buffer.writeFloatLE(50.5, offset + 5)
    buffer.writeFloatLE(110, offset + 9)
    buffer.writeFloatLE(12.25, offset + 13)
    buffer.writeUInt16LE(13000, offset + 17)
    buffer.writeUInt16LE(4000, offset + 19)
    buffer.set([8, 1], offset + 21)
    buffer.writeUInt16LE(150, offset + 23)
    buffer.set([18, 17, 6], offset + 25)
    buffer.writeInt8(flag, offset + 28)
    buffer.writeFloatLE(550000, offset + 29)
    buffer.writeFloatLE(120000, offset + 33)
    buffer.writeFloatLE(4000000, offset + 37)
    buffer.writeUInt8(3, offset + 41)
    buffer.writeFloatLE(1500000, offset + 42)
    buffer.writeFloatLE(2500000, offset + 46)
    buffer.writeFloatLE(3500000, offset + 50)
    buffer.writeUInt8(1, offset + 54)
}

describe('f1-25 PacketCarStatusData', () => {
    it('is 1239 bytes with the header as in the spec', () => {
        expect(sizeOf(CarStatusData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketCarStatusData)).toBe(1239)
    })

    it('decodes a car status packet', () => {
        const packet = decode(carStatusPacket(), 'f1-25')

        expect(packet.packetId).toBe(7)
        const data = packet.data as {carStatusData: unknown[]}
        expect(data.carStatusData).toHaveLength(22)
        expect(data.carStatusData[0]).toEqual({
            tractionControl: 2,
            antiLockBrakes: 1,
            fuelMix: 3,
            frontBrakeBias: 58,
            pitLimiterStatus: 1,
            fuelInTank: 50.5,
            fuelCapacity: 110,
            fuelRemainingLaps: 12.25,
            maxRPM: 13000,
            idleRPM: 4000,
            maxGears: 8,
            drsAllowed: 1,
            drsActivationDistance: 150,
            actualTyreCompound: 18,
            visualTyreCompound: 17,
            tyresAgeLaps: 6,
            vehicleFiaFlags: 2,
            enginePowerICE: 550000,
            enginePowerMGUK: 120000,
            ersStoreEnergy: 4000000,
            ersDeployMode: 3,
            ersHarvestedThisLapMGUK: 1500000,
            ersHarvestedThisLapMGUH: 2500000,
            ersDeployedThisLap: 3500000,
            networkPaused: 1
        })
    })

    it('decodes the unknown flag as a signed value', () => {
        const data = decode(carStatusPacket(), 'f1-25').data as {
            carStatusData: {vehicleFiaFlags: number}[]
        }

        expect(data.carStatusData[21]!.vehicleFiaFlags).toBe(-1)
    })
})

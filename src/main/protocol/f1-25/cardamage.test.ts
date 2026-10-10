import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {CarDamageData, PacketCarDamageData} from './cardamage'
import {PacketHeader} from './header'

const CAR_SIZE = 46

function carDamagePacket(): Buffer {
    const buffer = Buffer.alloc(1041)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(10, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    writeCar(buffer, 29, 0)
    writeCar(buffer, 29 + 21 * CAR_SIZE, 1)
    return buffer
}

function writeCar(buffer: Buffer, offset: number, fault: number): void {
    for (const [index, wear] of [12.5, 13.5, 20.25, 21.75].entries()) {
        buffer.writeFloatLE(wear, offset + index * 4)
    }
    buffer.set([1, 2, 3, 4], offset + 16)
    buffer.set([5, 6, 7, 8], offset + 20)
    buffer.set([9, 10, 11, 12], offset + 24)
    buffer.set([13, 14, 15, 16, 17, 18], offset + 28)
    buffer.set([fault, fault], offset + 34)
    buffer.set([19, 20, 21, 22, 23, 24, 25, 26, 27, 28], offset + 36)
}

describe('f1-25 PacketCarDamageData', () => {
    it('is 1041 bytes with the header as in the spec', () => {
        expect(sizeOf(CarDamageData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketCarDamageData)).toBe(1041)
    })

    it('decodes a car damage packet', () => {
        const packet = decode(carDamagePacket(), 'f1-25')

        expect(packet.packetId).toBe(10)
        const data = packet.data as {carDamageData: unknown[]}
        expect(data.carDamageData).toHaveLength(22)
        expect(data.carDamageData[0]).toEqual({
            tyresWear: [12.5, 13.5, 20.25, 21.75],
            tyresDamage: [1, 2, 3, 4],
            brakesDamage: [5, 6, 7, 8],
            tyreBlisters: [9, 10, 11, 12],
            frontLeftWingDamage: 13,
            frontRightWingDamage: 14,
            rearWingDamage: 15,
            floorDamage: 16,
            diffuserDamage: 17,
            sidepodDamage: 18,
            drsFault: 0,
            ersFault: 0,
            gearBoxDamage: 19,
            engineDamage: 20,
            engineMGUHWear: 21,
            engineESWear: 22,
            engineCEWear: 23,
            engineICEWear: 24,
            engineMGUKWear: 25,
            engineTCWear: 26,
            engineBlown: 27,
            engineSeized: 28
        })
    })

    it('decodes the fault flags of the last car', () => {
        const data = decode(carDamagePacket(), 'f1-25').data as {
            carDamageData: {drsFault: number; ersFault: number; engineBlown: number}[]
        }

        expect(data.carDamageData[21]).toMatchObject({drsFault: 1, ersFault: 1, engineBlown: 27})
    })
})

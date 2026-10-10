import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {FinalClassificationData, PacketFinalClassificationData} from './finalclassification'
import {PacketHeader} from './header'

const CAR_SIZE = 46

function finalClassificationPacket(): Buffer {
    const buffer = Buffer.alloc(1042)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(8, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    buffer.writeUInt8(20, 29)
    writeCar(buffer, 30, 1, 3, 2)
    writeCar(buffer, 30 + 21 * CAR_SIZE, 20, 4, 7)
    return buffer
}

function writeCar(
    buffer: Buffer,
    offset: number,
    position: number,
    status: number,
    reason: number
): void {
    buffer.set([position, 57, 3, 25, 2, status, reason], offset)
    buffer.writeUInt32LE(83456, offset + 7)
    buffer.writeDoubleLE(5432.123456789, offset + 11)
    buffer.set([5, 1, 3], offset + 19)
    buffer.set([18, 17, 16, 0, 0, 0, 0, 0], offset + 22)
    buffer.set([16, 17, 18, 0, 0, 0, 0, 0], offset + 30)
    buffer.set([20, 40, 57, 0, 0, 0, 0, 0], offset + 38)
}

describe('f1-25 PacketFinalClassificationData', () => {
    it('is 1042 bytes with the header as in the spec', () => {
        expect(sizeOf(FinalClassificationData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketFinalClassificationData)).toBe(1042)
    })

    it('decodes a final classification packet', () => {
        const packet = decode(finalClassificationPacket(), 'f1-25')

        expect(packet.packetId).toBe(8)
        const data = packet.data as {numCars: number; classificationData: unknown[]}
        expect(data.numCars).toBe(20)
        expect(data.classificationData).toHaveLength(22)
        expect(data.classificationData[0]).toEqual({
            position: 1,
            numLaps: 57,
            gridPosition: 3,
            points: 25,
            numPitStops: 2,
            resultStatus: 3,
            resultReason: 2,
            bestLapTimeInMS: 83456,
            totalRaceTime: 5432.123456789,
            penaltiesTime: 5,
            numPenalties: 1,
            numTyreStints: 3,
            tyreStintsActual: [18, 17, 16, 0, 0, 0, 0, 0],
            tyreStintsVisual: [16, 17, 18, 0, 0, 0, 0, 0],
            tyreStintsEndLaps: [20, 40, 57, 0, 0, 0, 0, 0]
        })
    })

    it('decodes the last car', () => {
        const data = decode(finalClassificationPacket(), 'f1-25').data as {
            classificationData: {position: number; resultStatus: number; resultReason: number}[]
        }

        expect(data.classificationData[21]).toMatchObject({
            position: 20,
            resultStatus: 4,
            resultReason: 7
        })
    })
})

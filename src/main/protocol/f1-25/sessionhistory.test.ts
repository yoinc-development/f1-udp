import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {LapHistoryData, PacketSessionHistoryData, TyreStintHistoryData} from './sessionhistory'

const LAP_SIZE = 14
const STINT_SIZE = 3
const LAPS_OFFSET = 29 + 7
const STINTS_OFFSET = LAPS_OFFSET + 100 * LAP_SIZE

function sessionHistoryPacket(): Buffer {
    const buffer = Buffer.alloc(1460)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(11, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    buffer.set([6, 3, 2, 2, 1, 3, 2], 29)
    writeLap(buffer, LAPS_OFFSET, 83456, 0x0f)
    writeLap(buffer, LAPS_OFFSET + 99 * LAP_SIZE, 91234, 0x09)
    buffer.set([20, 18, 16], STINTS_OFFSET)
    buffer.set([255, 17, 17], STINTS_OFFSET + STINT_SIZE)
    return buffer
}

function writeLap(buffer: Buffer, offset: number, lapTime: number, flags: number): void {
    buffer.writeUInt32LE(lapTime, offset)
    buffer.writeUInt16LE(27500, offset + 4)
    buffer.writeUInt8(0, offset + 6)
    buffer.writeUInt16LE(31250, offset + 7)
    buffer.writeUInt8(0, offset + 9)
    buffer.writeUInt16LE(24706, offset + 10)
    buffer.writeUInt8(1, offset + 12)
    buffer.writeUInt8(flags, offset + 13)
}

describe('f1-25 PacketSessionHistoryData', () => {
    it('is 1460 bytes with the header as in the spec', () => {
        expect(sizeOf(LapHistoryData)).toBe(LAP_SIZE)
        expect(sizeOf(TyreStintHistoryData)).toBe(STINT_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketSessionHistoryData)).toBe(1460)
    })

    it('decodes a session history packet', () => {
        const packet = decode(sessionHistoryPacket(), 'f1-25')

        expect(packet.packetId).toBe(11)
        const data = packet.data as {
            lapHistoryData: unknown[]
            tyreStintsHistoryData: unknown[]
        }
        expect(data).toMatchObject({
            carIdx: 6,
            numLaps: 3,
            numTyreStints: 2,
            bestLapTimeLapNum: 2,
            bestSector1LapNum: 1,
            bestSector2LapNum: 3,
            bestSector3LapNum: 2
        })
        expect(data.lapHistoryData).toHaveLength(100)
        expect(data.tyreStintsHistoryData).toHaveLength(8)
        expect(data.lapHistoryData[0]).toEqual({
            lapTimeInMS: 83456,
            sector1TimeMSPart: 27500,
            sector1TimeMinutesPart: 0,
            sector2TimeMSPart: 31250,
            sector2TimeMinutesPart: 0,
            sector3TimeMSPart: 24706,
            sector3TimeMinutesPart: 1,
            lapValidBitFlags: 0x0f
        })
        expect(data.lapHistoryData[99]).toMatchObject({lapTimeInMS: 91234, lapValidBitFlags: 0x09})
    })

    it('decodes the tyre stints with the current stint ending on 255', () => {
        const data = decode(sessionHistoryPacket(), 'f1-25').data as {
            tyreStintsHistoryData: unknown[]
        }

        expect(data.tyreStintsHistoryData[0]).toEqual({
            endLap: 20,
            tyreActualCompound: 18,
            tyreVisualCompound: 16
        })
        expect(data.tyreStintsHistoryData[1]).toEqual({
            endLap: 255,
            tyreActualCompound: 17,
            tyreVisualCompound: 17
        })
        expect(data.tyreStintsHistoryData[7]).toEqual({
            endLap: 0,
            tyreActualCompound: 0,
            tyreVisualCompound: 0
        })
    })
})

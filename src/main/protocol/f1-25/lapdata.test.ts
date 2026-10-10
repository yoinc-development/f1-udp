import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {LapData, PacketLapData} from './lapdata'

const CAR_SIZE = 57

function lapPacket(): Buffer {
    const buffer = Buffer.alloc(1285)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(2, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    writeCar(buffer, 29, 1)
    writeCar(buffer, 29 + 21 * CAR_SIZE, 2)
    buffer.writeUInt8(3, 29 + 22 * CAR_SIZE)
    buffer.writeUInt8(255, 29 + 22 * CAR_SIZE + 1)
    return buffer
}

function writeCar(buffer: Buffer, offset: number, factor: number): void {
    buffer.writeUInt32LE(91000 * factor, offset)
    buffer.writeUInt32LE(45000 * factor, offset + 4)
    buffer.writeUInt16LE(28123, offset + 8)
    buffer.writeUInt8(1, offset + 10)
    buffer.writeUInt16LE(31456, offset + 11)
    buffer.writeUInt8(2, offset + 13)
    buffer.writeUInt16LE(850, offset + 14)
    buffer.writeUInt8(0, offset + 16)
    buffer.writeUInt16LE(12345, offset + 17)
    buffer.writeUInt8(1, offset + 19)
    buffer.writeFloatLE(1234.5, offset + 20)
    buffer.writeFloatLE(-50.25, offset + 24)
    buffer.writeFloatLE(0.75, offset + 28)
    const bytes = [4, 12, 1, 2, 1, 1, 5, 3, 2, 1, 1, 6, 3, 2, 1]
    buffer.set(bytes, offset + 32)
    buffer.writeUInt16LE(15000, offset + 47)
    buffer.writeUInt16LE(2300, offset + 49)
    buffer.writeUInt8(1, offset + 51)
    buffer.writeFloatLE(325.5, offset + 52)
    buffer.writeUInt8(255, offset + 56)
}

describe('f1-25 PacketLapData', () => {
    it('is 1285 bytes with the header as in the spec', () => {
        expect(sizeOf(LapData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketLapData)).toBe(1285)
    })

    it('decodes a lap data packet', () => {
        const packet = decode(lapPacket(), 'f1-25')

        expect(packet.packetId).toBe(2)
        expect(packet.data).toMatchObject({timeTrialPBCarIdx: 3, timeTrialRivalCarIdx: 255})
        const cars = (packet.data as {lapData: unknown[]}).lapData
        expect(cars).toHaveLength(22)
        expect(cars[0]).toEqual({
            lastLapTimeInMS: 91000,
            currentLapTimeInMS: 45000,
            sector1TimeMSPart: 28123,
            sector1TimeMinutesPart: 1,
            sector2TimeMSPart: 31456,
            sector2TimeMinutesPart: 2,
            deltaToCarInFrontMSPart: 850,
            deltaToCarInFrontMinutesPart: 0,
            deltaToRaceLeaderMSPart: 12345,
            deltaToRaceLeaderMinutesPart: 1,
            lapDistance: 1234.5,
            totalDistance: -50.25,
            safetyCarDelta: 0.75,
            carPosition: 4,
            currentLapNum: 12,
            pitStatus: 1,
            numPitStops: 2,
            sector: 1,
            currentLapInvalid: 1,
            penalties: 5,
            totalWarnings: 3,
            cornerCuttingWarnings: 2,
            numUnservedDriveThroughPens: 1,
            numUnservedStopGoPens: 1,
            gridPosition: 6,
            driverStatus: 3,
            resultStatus: 2,
            pitLaneTimerActive: 1,
            pitLaneTimeInLaneInMS: 15000,
            pitStopTimerInMS: 2300,
            pitStopShouldServePen: 1,
            speedTrapFastestSpeed: 325.5,
            speedTrapFastestLap: 255
        })
        expect(cars[21]).toMatchObject({lastLapTimeInMS: 182000, currentLapTimeInMS: 90000})
    })
})

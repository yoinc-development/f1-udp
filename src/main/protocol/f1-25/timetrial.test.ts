import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {PacketTimeTrialData, TimeTrialDataSet} from './timetrial'

const SET_SIZE = 24

function timeTrialPacket(): Buffer {
    const buffer = Buffer.alloc(101)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(14, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    writeSet(buffer, 29, 4, 7, 83456, [1, 1, 0, 1, 0, 1])
    writeSet(buffer, 29 + SET_SIZE, 4, 7, 82111, [0, 1, 1, 0, 1, 1])
    writeSet(buffer, 29 + 2 * SET_SIZE, 11, 3, 81999, [1, 0, 0, 1, 0, 0])
    return buffer
}

function writeSet(
    buffer: Buffer,
    offset: number,
    car: number,
    team: number,
    lapTime: number,
    flags: number[]
): void {
    buffer.set([car, team], offset)
    buffer.writeUInt32LE(lapTime, offset + 2)
    buffer.writeUInt32LE(27500, offset + 6)
    buffer.writeUInt32LE(31250, offset + 10)
    buffer.writeUInt32LE(lapTime - 58750, offset + 14)
    buffer.set(flags, offset + 18)
}

describe('f1-25 PacketTimeTrialData', () => {
    it('is 101 bytes with the header as in the spec', () => {
        expect(sizeOf(TimeTrialDataSet)).toBe(SET_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketTimeTrialData)).toBe(101)
    })

    it('decodes a time trial packet', () => {
        const packet = decode(timeTrialPacket(), 'f1-25')

        expect(packet.packetId).toBe(14)
        expect(packet.data).toEqual({
            playerSessionBestDataSet: {
                carIdx: 4,
                teamId: 7,
                lapTimeInMS: 83456,
                sector1TimeInMS: 27500,
                sector2TimeInMS: 31250,
                sector3TimeInMS: 24706,
                tractionControl: 1,
                gearboxAssist: 1,
                antiLockBrakes: 0,
                equalCarPerformance: 1,
                customSetup: 0,
                valid: 1
            },
            personalBestDataSet: {
                carIdx: 4,
                teamId: 7,
                lapTimeInMS: 82111,
                sector1TimeInMS: 27500,
                sector2TimeInMS: 31250,
                sector3TimeInMS: 23361,
                tractionControl: 0,
                gearboxAssist: 1,
                antiLockBrakes: 1,
                equalCarPerformance: 0,
                customSetup: 1,
                valid: 1
            },
            rivalDataSet: {
                carIdx: 11,
                teamId: 3,
                lapTimeInMS: 81999,
                sector1TimeInMS: 27500,
                sector2TimeInMS: 31250,
                sector3TimeInMS: 23249,
                tractionControl: 1,
                gearboxAssist: 0,
                antiLockBrakes: 0,
                equalCarPerformance: 1,
                customSetup: 0,
                valid: 0
            }
        })
    })
})

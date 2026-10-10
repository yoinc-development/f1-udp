import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {PacketEventData} from './event'

function eventPacket(
    code: string,
    write: (buffer: Buffer, offset: number) => void = () => {}
): Buffer {
    const buffer = Buffer.alloc(45)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(3, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    buffer.write(code, 29, 'ascii')
    write(buffer, 33)
    return buffer
}

function details(packet: Buffer): unknown {
    return (decode(packet, 'f1-25').data as {eventDetails: unknown}).eventDetails
}

describe('f1-25 PacketEventData', () => {
    it('is 45 bytes with the header as in the spec', () => {
        expect(sizeOf(PacketHeader) + sizeOf(PacketEventData)).toBe(45)
    })

    it('decodes the event code', () => {
        const packet = decode(eventPacket('SSTA'), 'f1-25')

        expect(packet.packetId).toBe(3)
        expect(packet.data).toEqual({eventStringCode: 'SSTA', eventDetails: {}})
    })

    it('decodes a fastest lap event', () => {
        const packet = eventPacket('FTLP', (buffer, offset) => {
            buffer.writeUInt8(7, offset)
            buffer.writeFloatLE(83.5, offset + 1)
        })

        expect(details(packet)).toEqual({vehicleIdx: 7, lapTime: 83.5})
    })

    it('decodes a penalty event', () => {
        const packet = eventPacket('PENA', (buffer, offset) => {
            buffer.set([1, 2, 3, 4, 5, 6, 7], offset)
        })

        expect(details(packet)).toEqual({
            penaltyType: 1,
            infringementType: 2,
            vehicleIdx: 3,
            otherVehicleIdx: 4,
            time: 5,
            lapNum: 6,
            placesGained: 7
        })
    })

    it('decodes the largest variant, the speed trap', () => {
        const packet = eventPacket('SPTP', (buffer, offset) => {
            buffer.writeUInt8(9, offset)
            buffer.writeFloatLE(331.5, offset + 1)
            buffer.writeUInt8(1, offset + 5)
            buffer.writeUInt8(0, offset + 6)
            buffer.writeUInt8(12, offset + 7)
            buffer.writeFloatLE(340.25, offset + 8)
        })

        expect(details(packet)).toEqual({
            vehicleIdx: 9,
            speed: 331.5,
            isOverallFastestInSession: 1,
            isDriverFastestInSession: 0,
            fastestVehicleIdxInSession: 12,
            fastestSpeedInSession: 340.25
        })
    })

    it('decodes flashback, buttons, overtake, safety car and collision', () => {
        expect(
            details(
                eventPacket('FLBK', (buffer, offset) => {
                    buffer.writeUInt32LE(4321, offset)
                    buffer.writeFloatLE(12.5, offset + 4)
                })
            )
        ).toEqual({flashbackFrameIdentifier: 4321, flashbackSessionTime: 12.5})
        expect(
            details(
                eventPacket('BUTN', (buffer, offset) => buffer.writeUInt32LE(0x80000001, offset))
            )
        ).toEqual({buttonStatus: 0x80000001})
        expect(
            details(eventPacket('OVTK', (buffer, offset) => buffer.set([3, 8], offset)))
        ).toEqual({
            overtakingVehicleIdx: 3,
            beingOvertakenVehicleIdx: 8
        })
        expect(
            details(eventPacket('SCAR', (buffer, offset) => buffer.set([2, 1], offset)))
        ).toEqual({
            safetyCarType: 2,
            eventType: 1
        })
        expect(
            details(eventPacket('COLL', (buffer, offset) => buffer.set([5, 6], offset)))
        ).toEqual({
            vehicle1Idx: 5,
            vehicle2Idx: 6
        })
    })

    it('decodes stop go served and retirement', () => {
        expect(
            details(
                eventPacket('SGSV', (buffer, offset) => {
                    buffer.writeUInt8(4, offset)
                    buffer.writeFloatLE(10.5, offset + 1)
                })
            )
        ).toEqual({vehicleIdx: 4, stopTime: 10.5})
        expect(
            details(eventPacket('RTMT', (buffer, offset) => buffer.set([2, 8], offset)))
        ).toEqual({
            vehicleIdx: 2,
            reason: 8
        })
    })
})

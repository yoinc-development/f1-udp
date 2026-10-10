import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {LiveryColour, PacketParticipantsData, ParticipantData} from './participants'

const CAR_SIZE = 57

function participantsPacket(): Buffer {
    const buffer = Buffer.alloc(1284)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(4, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    buffer.writeUInt8(20, 29)
    writeCar(buffer, 30, 'Max Verstappen', 1)
    writeCar(buffer, 30 + 21 * CAR_SIZE, 'Zoë Müller-Ötztürk-Hamilton-Smith', 0)
    return buffer
}

function writeCar(buffer: Buffer, offset: number, name: string, human: number): void {
    buffer.set([human ? 1 : 0, human ? 3 : 255, 12, 7, human, 33, 18], offset)
    buffer.write(name, offset + 7, 32, 'utf8')
    buffer.set([1, 1], offset + 39)
    buffer.writeUInt16LE(5, offset + 41)
    buffer.set([3, 4], offset + 43)
    buffer.set([255, 0, 0, 0, 255, 0, 0, 0, 255, 10, 20, 30], offset + 45)
}

describe('f1-25 PacketParticipantsData', () => {
    it('is 1284 bytes with the header as in the spec', () => {
        expect(sizeOf(LiveryColour)).toBe(3)
        expect(sizeOf(ParticipantData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketParticipantsData)).toBe(1284)
    })

    it('decodes a participants packet', () => {
        const packet = decode(participantsPacket(), 'f1-25')

        expect(packet.packetId).toBe(4)
        const data = packet.data as {numActiveCars: number; participants: unknown[]}
        expect(data.numActiveCars).toBe(20)
        expect(data.participants).toHaveLength(22)
        expect(data.participants[0]).toEqual({
            aiControlled: 1,
            driverId: 3,
            networkId: 12,
            teamId: 7,
            myTeam: 1,
            raceNumber: 33,
            nationality: 18,
            name: 'Max Verstappen',
            yourTelemetry: 1,
            showOnlineNames: 1,
            techLevel: 5,
            platform: 3,
            numColours: 4,
            liveryColours: [
                {red: 255, green: 0, blue: 0},
                {red: 0, green: 255, blue: 0},
                {red: 0, green: 0, blue: 255},
                {red: 10, green: 20, blue: 30}
            ]
        })
    })

    it('decodes a human player and a name that fills the field', () => {
        const data = decode(participantsPacket(), 'f1-25').data as {
            participants: {aiControlled: number; driverId: number; name: string}[]
        }
        const last = data.participants[21]!

        expect(last).toMatchObject({aiControlled: 0, driverId: 255})
        expect(last.name.startsWith('Zoë Müller')).toBe(true)
    })
})

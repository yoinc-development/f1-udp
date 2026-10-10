import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {LobbyInfoData, PacketLobbyInfoData} from './lobbyinfo'

const CAR_SIZE = 42

function lobbyInfoPacket(): Buffer {
    const buffer = Buffer.alloc(954)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(9, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)
    buffer.writeUInt8(2, 29)
    writePlayer(buffer, 30, 'Max Verstappen', 0, 7, 1)
    writePlayer(buffer, 30 + 21 * CAR_SIZE, `${'x'.repeat(29)}…`, 1, 255, 2)
    return buffer
}

function writePlayer(
    buffer: Buffer,
    offset: number,
    name: string,
    ai: number,
    team: number,
    ready: number
): void {
    buffer.set([ai, team, 18, 3], offset)
    buffer.write(name, offset + 4, 32, 'utf8')
    buffer.set([33, 1, 1], offset + 36)
    buffer.writeUInt16LE(5, offset + 39)
    buffer.writeUInt8(ready, offset + 41)
}

describe('f1-25 PacketLobbyInfoData', () => {
    it('is 954 bytes with the header as in the spec', () => {
        expect(sizeOf(LobbyInfoData)).toBe(CAR_SIZE)
        expect(sizeOf(PacketHeader) + sizeOf(PacketLobbyInfoData)).toBe(954)
    })

    it('decodes a lobby info packet', () => {
        const packet = decode(lobbyInfoPacket(), 'f1-25')

        expect(packet.packetId).toBe(9)
        const data = packet.data as {numPlayers: number; lobbyPlayers: unknown[]}
        expect(data.numPlayers).toBe(2)
        expect(data.lobbyPlayers).toHaveLength(22)
        expect(data.lobbyPlayers[0]).toEqual({
            aiControlled: 0,
            teamId: 7,
            nationality: 18,
            platform: 3,
            name: 'Max Verstappen',
            carNumber: 33,
            yourTelemetry: 1,
            showOnlineNames: 1,
            techLevel: 5,
            readyStatus: 1
        })
    })

    it('decodes a truncated name and a player without a team', () => {
        const data = decode(lobbyInfoPacket(), 'f1-25').data as {
            lobbyPlayers: {
                aiControlled: number
                teamId: number
                name: string
                readyStatus: number
            }[]
        }

        expect(data.lobbyPlayers[21]).toMatchObject({
            aiControlled: 1,
            teamId: 255,
            name: `${'x'.repeat(29)}…`,
            readyStatus: 2
        })
    })
})

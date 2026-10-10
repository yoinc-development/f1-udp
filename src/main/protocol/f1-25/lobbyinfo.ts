import type {StructSchema} from '../schema'

export const LobbyInfoData = [
    {name: 'aiControlled', type: 'uint8'},
    {name: 'teamId', type: 'uint8'},
    {name: 'nationality', type: 'uint8'},
    {name: 'platform', type: 'uint8'},
    {name: 'name', type: 'string', length: 32},
    {name: 'carNumber', type: 'uint8'},
    {name: 'yourTelemetry', type: 'uint8'},
    {name: 'showOnlineNames', type: 'uint8'},
    {name: 'techLevel', type: 'uint16'},
    {name: 'readyStatus', type: 'uint8'}
] as const satisfies StructSchema

export const PacketLobbyInfoData = [
    {name: 'numPlayers', type: 'uint8'},
    {name: 'lobbyPlayers', type: 'array', length: 22, of: LobbyInfoData}
] as const satisfies StructSchema

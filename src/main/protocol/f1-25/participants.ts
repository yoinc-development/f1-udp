import type {StructSchema} from '../schema'

export const LiveryColour = [
    {name: 'red', type: 'uint8'},
    {name: 'green', type: 'uint8'},
    {name: 'blue', type: 'uint8'}
] as const satisfies StructSchema

export const ParticipantData = [
    {name: 'aiControlled', type: 'uint8'},
    {name: 'driverId', type: 'uint8'},
    {name: 'networkId', type: 'uint8'},
    {name: 'teamId', type: 'uint8'},
    {name: 'myTeam', type: 'uint8'},
    {name: 'raceNumber', type: 'uint8'},
    {name: 'nationality', type: 'uint8'},
    {name: 'name', type: 'string', length: 32},
    {name: 'yourTelemetry', type: 'uint8'},
    {name: 'showOnlineNames', type: 'uint8'},
    {name: 'techLevel', type: 'uint16'},
    {name: 'platform', type: 'uint8'},
    {name: 'numColours', type: 'uint8'},
    {name: 'liveryColours', type: 'array', length: 4, of: LiveryColour}
] as const satisfies StructSchema

export const PacketParticipantsData = [
    {name: 'numActiveCars', type: 'uint8'},
    {name: 'participants', type: 'array', length: 22, of: ParticipantData}
] as const satisfies StructSchema

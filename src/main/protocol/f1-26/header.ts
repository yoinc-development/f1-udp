import type {StructSchema} from '../schema'

export const PacketHeader = [
    {name: 'packetFormat', type: 'uint16'},
    {name: 'gameYear', type: 'uint8'},
    {name: 'gameMajorVersion', type: 'uint8'},
    {name: 'gameMinorVersion', type: 'uint8'},
    {name: 'packetVersion', type: 'uint8'},
    {name: 'packetId', type: 'uint8'},
    {name: 'sessionUID', type: 'uint64'},
    {name: 'sessionTime', type: 'float'},
    {name: 'frameIdentifier', type: 'uint32'},
    {name: 'overallFrameIdentifier', type: 'uint32'},
    {name: 'playerCarIndex', type: 'uint8'},
    {name: 'secondaryPlayerCarIndex', type: 'uint8'}
] as const satisfies StructSchema

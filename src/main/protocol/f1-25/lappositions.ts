import type {StructSchema} from '../schema'

export const PacketLapPositionsData = [
    {name: 'numLaps', type: 'uint8'},
    {name: 'lapStart', type: 'uint8'},
    {
        name: 'positionForVehicleIdx',
        type: 'array',
        length: 50,
        of: {type: 'array', length: 22, of: 'uint8'}
    }
] as const satisfies StructSchema

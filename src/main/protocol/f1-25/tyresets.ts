import type {StructSchema} from '../schema'

export const TyreSetData = [
    {name: 'actualTyreCompound', type: 'uint8'},
    {name: 'visualTyreCompound', type: 'uint8'},
    {name: 'wear', type: 'uint8'},
    {name: 'available', type: 'uint8'},
    {name: 'recommendedSession', type: 'uint8'},
    {name: 'lifeSpan', type: 'uint8'},
    {name: 'usableLife', type: 'uint8'},
    {name: 'lapDeltaTime', type: 'int16'},
    {name: 'fitted', type: 'uint8'}
] as const satisfies StructSchema

export const PacketTyreSetsData = [
    {name: 'carIdx', type: 'uint8'},
    {name: 'tyreSetData', type: 'array', length: 20, of: TyreSetData},
    {name: 'fittedIdx', type: 'uint8'}
] as const satisfies StructSchema

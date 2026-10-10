import type {StructSchema} from '../schema'

export const FinalClassificationData = [
    {name: 'position', type: 'uint8'},
    {name: 'numLaps', type: 'uint8'},
    {name: 'gridPosition', type: 'uint8'},
    {name: 'points', type: 'uint8'},
    {name: 'numPitStops', type: 'uint8'},
    {name: 'resultStatus', type: 'uint8'},
    {name: 'resultReason', type: 'uint8'},
    {name: 'bestLapTimeInMS', type: 'uint32'},
    {name: 'totalRaceTime', type: 'double'},
    {name: 'penaltiesTime', type: 'uint8'},
    {name: 'numPenalties', type: 'uint8'},
    {name: 'numTyreStints', type: 'uint8'},
    {name: 'tyreStintsActual', type: 'array', length: 8, of: 'uint8'},
    {name: 'tyreStintsVisual', type: 'array', length: 8, of: 'uint8'},
    {name: 'tyreStintsEndLaps', type: 'array', length: 8, of: 'uint8'}
] as const satisfies StructSchema

export const PacketFinalClassificationData = [
    {name: 'numCars', type: 'uint8'},
    {name: 'classificationData', type: 'array', length: 22, of: FinalClassificationData}
] as const satisfies StructSchema

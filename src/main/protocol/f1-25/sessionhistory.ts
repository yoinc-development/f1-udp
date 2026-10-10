import type {StructSchema} from '../schema'

export const LapHistoryData = [
    {name: 'lapTimeInMS', type: 'uint32'},
    {name: 'sector1TimeMSPart', type: 'uint16'},
    {name: 'sector1TimeMinutesPart', type: 'uint8'},
    {name: 'sector2TimeMSPart', type: 'uint16'},
    {name: 'sector2TimeMinutesPart', type: 'uint8'},
    {name: 'sector3TimeMSPart', type: 'uint16'},
    {name: 'sector3TimeMinutesPart', type: 'uint8'},
    {name: 'lapValidBitFlags', type: 'uint8'}
] as const satisfies StructSchema

export const TyreStintHistoryData = [
    {name: 'endLap', type: 'uint8'},
    {name: 'tyreActualCompound', type: 'uint8'},
    {name: 'tyreVisualCompound', type: 'uint8'}
] as const satisfies StructSchema

export const PacketSessionHistoryData = [
    {name: 'carIdx', type: 'uint8'},
    {name: 'numLaps', type: 'uint8'},
    {name: 'numTyreStints', type: 'uint8'},
    {name: 'bestLapTimeLapNum', type: 'uint8'},
    {name: 'bestSector1LapNum', type: 'uint8'},
    {name: 'bestSector2LapNum', type: 'uint8'},
    {name: 'bestSector3LapNum', type: 'uint8'},
    {name: 'lapHistoryData', type: 'array', length: 100, of: LapHistoryData},
    {name: 'tyreStintsHistoryData', type: 'array', length: 8, of: TyreStintHistoryData}
] as const satisfies StructSchema

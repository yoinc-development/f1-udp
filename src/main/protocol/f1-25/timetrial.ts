import type {StructSchema} from '../schema'

export const TimeTrialDataSet = [
    {name: 'carIdx', type: 'uint8'},
    {name: 'teamId', type: 'uint8'},
    {name: 'lapTimeInMS', type: 'uint32'},
    {name: 'sector1TimeInMS', type: 'uint32'},
    {name: 'sector2TimeInMS', type: 'uint32'},
    {name: 'sector3TimeInMS', type: 'uint32'},
    {name: 'tractionControl', type: 'uint8'},
    {name: 'gearboxAssist', type: 'uint8'},
    {name: 'antiLockBrakes', type: 'uint8'},
    {name: 'equalCarPerformance', type: 'uint8'},
    {name: 'customSetup', type: 'uint8'},
    {name: 'valid', type: 'uint8'}
] as const satisfies StructSchema

export const PacketTimeTrialData = [
    {name: 'playerSessionBestDataSet', type: 'struct', schema: TimeTrialDataSet},
    {name: 'personalBestDataSet', type: 'struct', schema: TimeTrialDataSet},
    {name: 'rivalDataSet', type: 'struct', schema: TimeTrialDataSet}
] as const satisfies StructSchema

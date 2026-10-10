import type {StructSchema} from '../schema'

export const CarStatusData = [
    {name: 'tractionControl', type: 'uint8'},
    {name: 'antiLockBrakes', type: 'uint8'},
    {name: 'fuelMix', type: 'uint8'},
    {name: 'frontBrakeBias', type: 'uint8'},
    {name: 'pitLimiterStatus', type: 'uint8'},
    {name: 'fuelInTank', type: 'float'},
    {name: 'fuelCapacity', type: 'float'},
    {name: 'fuelRemainingLaps', type: 'float'},
    {name: 'maxRPM', type: 'uint16'},
    {name: 'idleRPM', type: 'uint16'},
    {name: 'maxGears', type: 'uint8'},
    {name: 'drsAllowed', type: 'uint8'},
    {name: 'drsActivationDistance', type: 'uint16'},
    {name: 'actualTyreCompound', type: 'uint8'},
    {name: 'visualTyreCompound', type: 'uint8'},
    {name: 'tyresAgeLaps', type: 'uint8'},
    {name: 'vehicleFiaFlags', type: 'int8'},
    {name: 'enginePowerICE', type: 'float'},
    {name: 'enginePowerMGUK', type: 'float'},
    {name: 'ersStoreEnergy', type: 'float'},
    {name: 'ersDeployMode', type: 'uint8'},
    {name: 'ersHarvestedThisLapMGUK', type: 'float'},
    {name: 'ersHarvestedThisLapMGUH', type: 'float'},
    {name: 'ersDeployedThisLap', type: 'float'},
    {name: 'networkPaused', type: 'uint8'}
] as const satisfies StructSchema

export const PacketCarStatusData = [
    {name: 'carStatusData', type: 'array', length: 22, of: CarStatusData}
] as const satisfies StructSchema

import type {StructSchema} from '../schema'

export const CarSetupData = [
    {name: 'frontWing', type: 'uint8'},
    {name: 'rearWing', type: 'uint8'},
    {name: 'onThrottle', type: 'uint8'},
    {name: 'offThrottle', type: 'uint8'},
    {name: 'frontCamber', type: 'float'},
    {name: 'rearCamber', type: 'float'},
    {name: 'frontToe', type: 'float'},
    {name: 'rearToe', type: 'float'},
    {name: 'frontSuspension', type: 'uint8'},
    {name: 'rearSuspension', type: 'uint8'},
    {name: 'frontAntiRollBar', type: 'uint8'},
    {name: 'rearAntiRollBar', type: 'uint8'},
    {name: 'frontSuspensionHeight', type: 'uint8'},
    {name: 'rearSuspensionHeight', type: 'uint8'},
    {name: 'brakePressure', type: 'uint8'},
    {name: 'brakeBias', type: 'uint8'},
    {name: 'engineBraking', type: 'uint8'},
    {name: 'rearLeftTyrePressure', type: 'float'},
    {name: 'rearRightTyrePressure', type: 'float'},
    {name: 'frontLeftTyrePressure', type: 'float'},
    {name: 'frontRightTyrePressure', type: 'float'},
    {name: 'ballast', type: 'uint8'},
    {name: 'fuelLoad', type: 'float'}
] as const satisfies StructSchema

export const PacketCarSetupData = [
    {name: 'carSetups', type: 'array', length: 22, of: CarSetupData},
    {name: 'nextFrontWingValue', type: 'float'}
] as const satisfies StructSchema

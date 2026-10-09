import type {StructSchema} from '../schema'

export const CarMotionData = [
    {name: 'worldPositionX', type: 'float'},
    {name: 'worldPositionY', type: 'float'},
    {name: 'worldPositionZ', type: 'float'},
    {name: 'worldVelocityX', type: 'float'},
    {name: 'worldVelocityY', type: 'float'},
    {name: 'worldVelocityZ', type: 'float'},
    {name: 'worldForwardDirX', type: 'int16'},
    {name: 'worldForwardDirY', type: 'int16'},
    {name: 'worldForwardDirZ', type: 'int16'},
    {name: 'worldRightDirX', type: 'int16'},
    {name: 'worldRightDirY', type: 'int16'},
    {name: 'worldRightDirZ', type: 'int16'},
    {name: 'gForceLateral', type: 'float'},
    {name: 'gForceLongitudinal', type: 'float'},
    {name: 'gForceVertical', type: 'float'},
    {name: 'yaw', type: 'float'},
    {name: 'pitch', type: 'float'},
    {name: 'roll', type: 'float'}
] as const satisfies StructSchema

export const PacketMotionData = [
    {name: 'carMotionData', type: 'array', length: 22, of: CarMotionData}
] as const satisfies StructSchema

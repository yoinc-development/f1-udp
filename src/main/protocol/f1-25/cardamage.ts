import type {StructSchema} from '../schema'

export const CarDamageData = [
    {name: 'tyresWear', type: 'array', length: 4, of: 'float'},
    {name: 'tyresDamage', type: 'array', length: 4, of: 'uint8'},
    {name: 'brakesDamage', type: 'array', length: 4, of: 'uint8'},
    {name: 'tyreBlisters', type: 'array', length: 4, of: 'uint8'},
    {name: 'frontLeftWingDamage', type: 'uint8'},
    {name: 'frontRightWingDamage', type: 'uint8'},
    {name: 'rearWingDamage', type: 'uint8'},
    {name: 'floorDamage', type: 'uint8'},
    {name: 'diffuserDamage', type: 'uint8'},
    {name: 'sidepodDamage', type: 'uint8'},
    {name: 'drsFault', type: 'uint8'},
    {name: 'ersFault', type: 'uint8'},
    {name: 'gearBoxDamage', type: 'uint8'},
    {name: 'engineDamage', type: 'uint8'},
    {name: 'engineMGUHWear', type: 'uint8'},
    {name: 'engineESWear', type: 'uint8'},
    {name: 'engineCEWear', type: 'uint8'},
    {name: 'engineICEWear', type: 'uint8'},
    {name: 'engineMGUKWear', type: 'uint8'},
    {name: 'engineTCWear', type: 'uint8'},
    {name: 'engineBlown', type: 'uint8'},
    {name: 'engineSeized', type: 'uint8'}
] as const satisfies StructSchema

export const PacketCarDamageData = [
    {name: 'carDamageData', type: 'array', length: 22, of: CarDamageData}
] as const satisfies StructSchema

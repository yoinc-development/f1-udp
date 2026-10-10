import type {StructSchema} from '../schema'

export const CarTelemetryData = [
    {name: 'speed', type: 'uint16'},
    {name: 'throttle', type: 'float'},
    {name: 'steer', type: 'float'},
    {name: 'brake', type: 'float'},
    {name: 'clutch', type: 'uint8'},
    {name: 'gear', type: 'int8'},
    {name: 'engineRPM', type: 'uint16'},
    {name: 'drs', type: 'uint8'},
    {name: 'revLightsPercent', type: 'uint8'},
    {name: 'revLightsBitValue', type: 'uint16'},
    {name: 'brakesTemperature', type: 'array', length: 4, of: 'uint16'},
    {name: 'tyresSurfaceTemperature', type: 'array', length: 4, of: 'uint8'},
    {name: 'tyresInnerTemperature', type: 'array', length: 4, of: 'uint8'},
    {name: 'engineTemperature', type: 'uint16'},
    {name: 'tyresPressure', type: 'array', length: 4, of: 'float'},
    {name: 'surfaceType', type: 'array', length: 4, of: 'uint8'}
] as const satisfies StructSchema

export const PacketCarTelemetryData = [
    {name: 'carTelemetryData', type: 'array', length: 22, of: CarTelemetryData},
    {name: 'mfdPanelIndex', type: 'uint8'},
    {name: 'mfdPanelIndexSecondaryPlayer', type: 'uint8'},
    {name: 'suggestedGear', type: 'int8'}
] as const satisfies StructSchema

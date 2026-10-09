export const FIELD_SIZES = {
    uint8: 1,
    int8: 1,
    uint16: 2,
    int16: 2,
    uint32: 4,
    int32: 4,
    uint64: 8,
    float: 4
} as const

export type ScalarType = keyof typeof FIELD_SIZES

export interface ScalarField {
    readonly name: string
    readonly type: ScalarType
}

export interface StringField {
    readonly name: string
    readonly type: 'string'
    readonly length: number
}

export interface StructField {
    readonly name: string
    readonly type: 'struct'
    readonly schema: StructSchema
}

export interface ArrayField {
    readonly name: string
    readonly type: 'array'
    readonly length: number
    readonly of: ScalarType | StructSchema
}

export type FieldDefinition = ScalarField | StringField | StructField | ArrayField

export type StructSchema = readonly FieldDefinition[]

function elementSize(of: ScalarType | StructSchema): number {
    return typeof of === 'string' ? FIELD_SIZES[of] : sizeOf(of)
}

function fieldSize(field: FieldDefinition): number {
    switch (field.type) {
        case 'string':
            return field.length
        case 'struct':
            return sizeOf(field.schema)
        case 'array':
            return field.length * elementSize(field.of)
        default:
            return FIELD_SIZES[field.type]
    }
}

export function sizeOf(schema: StructSchema): number {
    return schema.reduce((total, field) => total + fieldSize(field), 0)
}

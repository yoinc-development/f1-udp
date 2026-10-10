export const FIELD_SIZES = {
    uint8: 1,
    int8: 1,
    uint16: 2,
    int16: 2,
    uint32: 4,
    int32: 4,
    uint64: 8,
    float: 4,
    double: 8
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

export type ArrayElement = ScalarType | StructSchema | NestedArray

export interface NestedArray {
    readonly type: 'array'
    readonly length: number
    readonly of: ArrayElement
}

export interface ArrayField extends NestedArray {
    readonly name: string
}

export interface UnionField {
    readonly name: string
    readonly type: 'union'
    readonly discriminator: string
    readonly variants: Readonly<Record<string, StructSchema>>
}

export type FieldDefinition = ScalarField | StringField | StructField | ArrayField | UnionField

export type StructSchema = readonly FieldDefinition[]

function elementSize(of: ArrayElement): number {
    if (typeof of === 'string') return FIELD_SIZES[of]
    return 'of' in of ? of.length * elementSize(of.of) : sizeOf(of)
}

function fieldSize(field: FieldDefinition): number {
    switch (field.type) {
        case 'string':
            return field.length
        case 'struct':
            return sizeOf(field.schema)
        case 'array':
            return field.length * elementSize(field.of)
        case 'union':
            return Math.max(0, ...Object.values(field.variants).map(sizeOf))
        default:
            return FIELD_SIZES[field.type]
    }
}

export function sizeOf(schema: StructSchema): number {
    return schema.reduce((total, field) => total + fieldSize(field), 0)
}

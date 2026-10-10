import {FIELD_SIZES, sizeOf, type ScalarType, type StructSchema} from './schema'

export type FieldValue = number | bigint | string | StructValue | FieldValue[]

export interface StructValue {
    [name: string]: FieldValue
}

export interface ReadResult {
    value: StructValue
    offset: number
}

function readScalar(type: ScalarType, buffer: Buffer, offset: number): number | bigint {
    switch (type) {
        case 'uint8':
            return buffer.readUInt8(offset)
        case 'int8':
            return buffer.readInt8(offset)
        case 'uint16':
            return buffer.readUInt16LE(offset)
        case 'int16':
            return buffer.readInt16LE(offset)
        case 'uint32':
            return buffer.readUInt32LE(offset)
        case 'int32':
            return buffer.readInt32LE(offset)
        case 'uint64':
            return buffer.readBigUInt64LE(offset)
        case 'float':
            return buffer.readFloatLE(offset)
    }
}

function readString(buffer: Buffer, offset: number, length: number): string {
    const bytes = buffer.subarray(offset, offset + length)
    const end = bytes.indexOf(0)
    return bytes.toString('utf8', 0, end === -1 ? length : end)
}

export function readStruct(schema: StructSchema, buffer: Buffer, offset = 0): ReadResult {
    const required = sizeOf(schema)
    if (buffer.length - offset < required) {
        throw new RangeError(
            `Buffer too short: need ${required} bytes at offset ${offset}, have ${buffer.length - offset}`
        )
    }
    const value: StructValue = {}
    let position = offset
    for (const field of schema) {
        switch (field.type) {
            case 'string':
                value[field.name] = readString(buffer, position, field.length)
                position += field.length
                break
            case 'struct': {
                const nested = readStruct(field.schema, buffer, position)
                value[field.name] = nested.value
                position = nested.offset
                break
            }
            case 'union': {
                const variant = field.variants[String(value[field.discriminator])]
                value[field.name] = variant ? readStruct(variant, buffer, position).value : {}
                position += sizeOf([field])
                break
            }
            case 'array': {
                const items: FieldValue[] = []
                for (let index = 0; index < field.length; index++) {
                    if (typeof field.of === 'string') {
                        items.push(readScalar(field.of, buffer, position))
                        position += FIELD_SIZES[field.of]
                    } else {
                        const nested = readStruct(field.of, buffer, position)
                        items.push(nested.value)
                        position = nested.offset
                    }
                }
                value[field.name] = items
                break
            }
            default:
                value[field.name] = readScalar(field.type, buffer, position)
                position += FIELD_SIZES[field.type]
        }
    }
    return {value, offset: position}
}

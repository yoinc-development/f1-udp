import {describe, expect, it} from 'vitest'
import {readStruct} from './reader'
import {sizeOf, type StructSchema} from './schema'

describe('readStruct', () => {
    it('reads every scalar type little-endian', () => {
        const schema = [
            {name: 'a', type: 'uint8'},
            {name: 'b', type: 'int8'},
            {name: 'c', type: 'uint16'},
            {name: 'd', type: 'int16'},
            {name: 'e', type: 'uint32'},
            {name: 'f', type: 'int32'},
            {name: 'g', type: 'uint64'},
            {name: 'h', type: 'float'},
            {name: 'i', type: 'double'}
        ] as const satisfies StructSchema
        const buffer = Buffer.alloc(sizeOf(schema))
        buffer.writeUInt8(200, 0)
        buffer.writeInt8(-5, 1)
        buffer.writeUInt16LE(65000, 2)
        buffer.writeInt16LE(-1234, 4)
        buffer.writeUInt32LE(4000000000, 6)
        buffer.writeInt32LE(-2000000000, 10)
        buffer.writeBigUInt64LE(18446744073709551615n, 14)
        buffer.writeFloatLE(1.5, 22)
        buffer.writeDoubleLE(5432.123456789, 26)

        const {value, offset} = readStruct(schema, buffer)

        expect(value).toEqual({
            a: 200,
            b: -5,
            c: 65000,
            d: -1234,
            e: 4000000000,
            f: -2000000000,
            g: 18446744073709551615n,
            h: 1.5,
            i: 5432.123456789
        })
        expect(offset).toBe(buffer.length)
    })

    it('reads arrays of scalars and of structs', () => {
        const car = [
            {name: 'id', type: 'uint8'},
            {name: 'speed', type: 'uint16'}
        ] as const satisfies StructSchema
        const schema = [
            {name: 'gears', type: 'array', length: 3, of: 'int8'},
            {name: 'cars', type: 'array', length: 2, of: car}
        ] as const satisfies StructSchema
        const buffer = Buffer.from([1, 0xff, 3, 7, 0x2c, 0x01, 9, 0x00, 0x02])

        const {value} = readStruct(schema, buffer)

        expect(value).toEqual({
            gears: [1, -1, 3],
            cars: [
                {id: 7, speed: 300},
                {id: 9, speed: 512}
            ]
        })
    })

    it('reads arrays of arrays', () => {
        const schema = [
            {name: 'grid', type: 'array', length: 2, of: {type: 'array', length: 3, of: 'uint8'}}
        ] as const satisfies StructSchema

        expect(sizeOf(schema)).toBe(6)
        expect(readStruct(schema, Buffer.from([1, 2, 3, 4, 5, 6])).value).toEqual({
            grid: [
                [1, 2, 3],
                [4, 5, 6]
            ]
        })
    })

    it('reads nested structs', () => {
        const inner = [{name: 'x', type: 'uint16'}] as const satisfies StructSchema
        const schema = [
            {name: 'before', type: 'uint8'},
            {name: 'inner', type: 'struct', schema: inner},
            {name: 'after', type: 'uint8'}
        ] as const satisfies StructSchema

        const {value} = readStruct(schema, Buffer.from([1, 0x34, 0x12, 2]))

        expect(value).toEqual({before: 1, inner: {x: 0x1234}, after: 2})
    })

    it('cuts strings at the first null byte', () => {
        const schema = [
            {name: 'name', type: 'string', length: 6},
            {name: 'next', type: 'uint8'}
        ] as const satisfies StructSchema

        const {value} = readStruct(schema, Buffer.from([0x48, 0x61, 0x6d, 0, 0x7a, 0x7a, 5]))

        expect(value).toEqual({name: 'Ham', next: 5})
    })

    it('reads a string that fills its whole length', () => {
        const schema = [{name: 'code', type: 'string', length: 4}] as const satisfies StructSchema

        const {value} = readStruct(schema, Buffer.from('LGOT'))

        expect(value).toEqual({code: 'LGOT'})
    })

    it('starts at the given offset and returns the end offset', () => {
        const schema = [{name: 'x', type: 'uint8'}] as const satisfies StructSchema

        const result = readStruct(schema, Buffer.from([1, 2, 3]), 2)

        expect(result).toEqual({value: {x: 3}, offset: 3})
    })

    it('throws when the buffer is too short', () => {
        const schema = [{name: 'x', type: 'uint32'}] as const satisfies StructSchema

        expect(() => readStruct(schema, Buffer.from([1, 2, 3]))).toThrow(/too short/)
    })
})

describe('readStruct unions', () => {
    const schema = [
        {name: 'code', type: 'string', length: 2},
        {
            name: 'details',
            type: 'union',
            discriminator: 'code',
            variants: {
                AA: [{name: 'small', type: 'uint8'}],
                BB: [{name: 'big', type: 'uint32'}]
            }
        },
        {name: 'tail', type: 'uint8'}
    ] as const satisfies StructSchema

    it('sizes a union as its largest variant', () => {
        expect(sizeOf(schema)).toBe(7)
    })

    it('reads only the variant picked by the discriminator and skips the rest', () => {
        const buffer = Buffer.from([0x42, 0x42, 1, 0, 0, 0, 9])

        expect(readStruct(schema, buffer).value).toEqual({code: 'BB', details: {big: 1}, tail: 9})
    })

    it('reads an empty object for an unknown code', () => {
        const buffer = Buffer.from([0x5a, 0x5a, 1, 0, 0, 0, 9])

        expect(readStruct(schema, buffer).value).toEqual({code: 'ZZ', details: {}, tail: 9})
    })
})

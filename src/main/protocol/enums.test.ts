import {describe, expect, it} from 'vitest'
import {enumLabel, hasFlag} from './enums'

const Example = {invalid: -1, none: 0, first: 1, unknown: 255} as const

describe('enumLabel', () => {
    it('returns the name of a value', () => {
        expect(enumLabel(Example, 1)).toBe('first')
        expect(enumLabel(Example, 255)).toBe('unknown')
    })

    it('handles negative values', () => {
        expect(enumLabel(Example, -1)).toBe('invalid')
    })

    it('returns undefined for a value that is not in the enum', () => {
        expect(enumLabel(Example, 9)).toBeUndefined()
    })
})

describe('hasFlag', () => {
    it('checks single bits', () => {
        expect(hasFlag(0b0101, 0b0001)).toBe(true)
        expect(hasFlag(0b0101, 0b0010)).toBe(false)
    })

    it('handles the highest bit of a uint32', () => {
        expect(hasFlag(0x80000000, 0x80000000)).toBe(true)
        expect(hasFlag(0x7fffffff, 0x80000000)).toBe(false)
    })
})

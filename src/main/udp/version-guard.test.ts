import {describe, expect, it} from 'vitest'
import {checkFormat} from './version-guard'

function withFormat(format: number): Buffer {
    const buffer = Buffer.alloc(4)
    buffer.writeUInt16LE(format, 0)
    return buffer
}

describe('checkFormat', () => {
    it('accepts a matching packet format', () => {
        expect(checkFormat(withFormat(2025), 2025)).toEqual({result: 'ok'})
    })

    it('ignores datagrams shorter than two bytes', () => {
        expect(checkFormat(Buffer.alloc(0), 2025)).toEqual({result: 'ignored'})
        expect(checkFormat(Buffer.from([1]), 2025)).toEqual({result: 'ignored'})
    })

    it.each([
        [2021, 2025],
        [2021, 2026],
        [2025, 2021],
        [2025, 2026],
        [2026, 2021],
        [2026, 2025]
    ])('reports format %i when %i is expected', (actual, expected) => {
        expect(checkFormat(withFormat(actual), expected)).toEqual({result: 'mismatch', actual})
    })
})

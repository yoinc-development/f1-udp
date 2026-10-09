import {describe, expect, it} from 'vitest'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'

describe('f1-25 PacketHeader', () => {
    it('is 29 bytes as in the spec', () => {
        expect(sizeOf(PacketHeader)).toBe(29)
    })
})

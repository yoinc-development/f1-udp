import {describe, expect, it} from 'vitest'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'

describe('f1-2021 PacketHeader', () => {
    it('is 24 bytes as in the spec', () => {
        expect(sizeOf(PacketHeader)).toBe(24)
    })
})

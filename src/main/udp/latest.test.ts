import {describe, expect, it} from 'vitest'
import {LatestPackets, toPlain, type LatestInput} from './latest'

function input(packetId: number, receivedAt: number): LatestInput {
    return {
        receivedAt,
        packetId,
        header: {packetId, sessionUID: 123n},
        data: {value: receivedAt},
        error: null
    }
}

describe('LatestPackets', () => {
    it('keeps only the newest packet per packet id', () => {
        const latest = new LatestPackets()
        latest.record(input(1, 10))
        latest.record(input(1, 20))

        expect(latest.get(1)?.receivedAt).toBe(20)
        expect(latest.get(2)).toBeNull()
    })

    it('lists the packet ids in ascending order', () => {
        const latest = new LatestPackets()
        latest.record(input(6, 1))
        latest.record(input(0, 2))
        latest.record(input(2, 3))

        expect(latest.ids()).toEqual([0, 2, 6])
    })

    it('converts bigint header fields to strings', () => {
        const latest = new LatestPackets()
        latest.record(input(1, 10))

        expect(latest.get(1)?.header).toEqual({packetId: 1, sessionUID: '123'})
    })

    it('stores a decode error without data', () => {
        const latest = new LatestPackets()
        latest.record({receivedAt: 5, packetId: 3, header: null, data: null, error: 'too short'})

        expect(latest.get(3)).toEqual({
            receivedAt: 5,
            packetId: 3,
            header: null,
            data: null,
            error: 'too short'
        })
    })

    it('can be reset', () => {
        const latest = new LatestPackets()
        latest.record(input(1, 10))
        latest.reset()

        expect(latest.ids()).toEqual([])
    })
})

describe('toPlain', () => {
    it('converts nested bigints in structs and arrays', () => {
        expect(toPlain({a: [1n, {b: 2n}], c: 'x', d: 3})).toEqual({
            a: ['1', {b: '2'}],
            c: 'x',
            d: 3
        })
    })
})

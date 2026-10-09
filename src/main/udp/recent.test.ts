import {describe, expect, it} from 'vitest'
import type {RecentPacket} from '@shared/udp'
import {RecentPackets} from './recent'

function entry(frameIdentifier: number): RecentPacket {
    return {
        receivedAt: frameIdentifier * 10,
        packetFormat: 2025,
        packetId: 0,
        size: 1349,
        sessionTime: frameIdentifier / 60,
        frameIdentifier
    }
}

describe('RecentPackets', () => {
    it('returns the newest entry first', () => {
        const recent = new RecentPackets()
        recent.record(entry(1))
        recent.record(entry(2))

        expect(recent.snapshot().map((item) => item.frameIdentifier)).toEqual([2, 1])
    })

    it('drops the oldest entries beyond its capacity', () => {
        const recent = new RecentPackets(3)
        for (let frame = 1; frame <= 5; frame++) recent.record(entry(frame))

        expect(recent.snapshot().map((item) => item.frameIdentifier)).toEqual([5, 4, 3])
    })

    it('can be reset', () => {
        const recent = new RecentPackets()
        recent.record(entry(1))
        recent.reset()

        expect(recent.snapshot()).toEqual([])
    })
})

import {describe, expect, it} from 'vitest'
import {PacketStatistics} from './stats'

function packet(format: number, size: number): Buffer {
    const buffer = Buffer.alloc(size)
    buffer.writeUInt16LE(format, 0)
    return buffer
}

describe('PacketStatistics', () => {
    it('groups by packet format and size', () => {
        const statistics = new PacketStatistics()
        statistics.record(packet(2025, 29), 0)
        statistics.record(packet(2025, 29), 10)
        statistics.record(packet(2025, 1000), 20)
        statistics.record(packet(2021, 29), 30)

        const groups = statistics.snapshot(40)
        expect(statistics.totalPackets).toBe(4)
        expect(groups.map((g) => [g.packetFormat, g.size, g.count])).toEqual([
            [2021, 29, 1],
            [2025, 29, 2],
            [2025, 1000, 1]
        ])
    })

    it('counts packets per second over a sliding window', () => {
        const statistics = new PacketStatistics()
        statistics.record(packet(2025, 29), 0)
        statistics.record(packet(2025, 29), 400)
        statistics.record(packet(2025, 29), 900)

        expect(statistics.snapshot(900)[0]?.perSecond).toBe(3)
        expect(statistics.snapshot(1300)[0]?.perSecond).toBe(2)
        expect(statistics.snapshot(5000)[0]).toMatchObject({perSecond: 0, count: 3})
    })

    it('keeps a hex preview of the latest packet, limited to 32 bytes', () => {
        const statistics = new PacketStatistics()
        statistics.record(packet(2025, 100), 0)

        const preview = statistics.snapshot(0)[0]?.preview
        expect(preview?.startsWith('e9 07 00')).toBe(true)
        expect(preview?.split(' ')).toHaveLength(32)
    })

    it('reports datagrams under two bytes separately', () => {
        const statistics = new PacketStatistics()
        statistics.record(Buffer.alloc(1), 0)

        expect(statistics.snapshot(0)).toMatchObject([{packetFormat: null, size: 1, count: 1}])
    })

    it('clears everything on reset', () => {
        const statistics = new PacketStatistics()
        statistics.record(packet(2025, 29), 0)
        statistics.reset()

        expect(statistics.totalPackets).toBe(0)
        expect(statistics.snapshot(0)).toEqual([])
    })
})

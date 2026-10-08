import type {PacketStats} from '@shared/udp'

const PREVIEW_BYTES = 32
const RATE_WINDOW_MS = 1000

interface Group {
    packetFormat: number | null
    size: number
    count: number
    lastReceivedAt: number
    preview: string
    recent: number[]
}

function toHex(buffer: Buffer): string {
    return buffer
        .subarray(0, PREVIEW_BYTES)
        .toString('hex')
        .replace(/(..)(?=.)/g, '$1 ')
}

function prune(group: Group, now: number): void {
    const cutoff = now - RATE_WINDOW_MS
    const keepFrom = group.recent.findIndex((time) => time > cutoff)
    group.recent.splice(0, keepFrom === -1 ? group.recent.length : keepFrom)
}

export class PacketStatistics {
    private readonly groups = new Map<string, Group>()
    private total = 0

    get totalPackets(): number {
        return this.total
    }

    record(buffer: Buffer, now: number): void {
        const packetFormat = buffer.length >= 2 ? buffer.readUInt16LE(0) : null
        const key = `${packetFormat}:${buffer.length}`
        let group = this.groups.get(key)
        if (!group) {
            group = {
                packetFormat,
                size: buffer.length,
                count: 0,
                lastReceivedAt: now,
                preview: '',
                recent: []
            }
            this.groups.set(key, group)
        }
        group.count++
        group.lastReceivedAt = now
        group.preview = toHex(buffer)
        group.recent.push(now)
        prune(group, now)
        this.total++
    }

    snapshot(now: number): PacketStats[] {
        const result: PacketStats[] = []
        for (const group of this.groups.values()) {
            prune(group, now)
            result.push({
                packetFormat: group.packetFormat,
                size: group.size,
                count: group.count,
                perSecond: group.recent.length,
                lastReceivedAt: group.lastReceivedAt,
                preview: group.preview
            })
        }
        return result.sort(
            (a, b) => (a.packetFormat ?? -1) - (b.packetFormat ?? -1) || a.size - b.size
        )
    }

    reset(): void {
        this.groups.clear()
        this.total = 0
    }
}

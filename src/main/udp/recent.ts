import type {RecentPacket} from '@shared/udp'

export const RECENT_CAPACITY = 200

export class RecentPackets {
    private entries: RecentPacket[] = []

    constructor(private readonly capacity = RECENT_CAPACITY) {}

    record(entry: RecentPacket): void {
        this.entries.push(entry)
        if (this.entries.length > this.capacity) this.entries.shift()
    }

    snapshot(): RecentPacket[] {
        return [...this.entries].reverse()
    }

    reset(): void {
        this.entries = []
    }
}

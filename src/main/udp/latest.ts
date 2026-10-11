import type {DecodedEntry, PlainValue} from '@shared/udp'
import type {FieldValue, StructValue} from '../protocol/reader'

export function toPlain(value: FieldValue): PlainValue {
    if (typeof value === 'bigint') return value.toString()
    if (Array.isArray(value)) return value.map(toPlain)
    if (typeof value === 'object') return toPlainStruct(value)
    return value
}

export function toPlainStruct(value: StructValue): {[name: string]: PlainValue} {
    const result: {[name: string]: PlainValue} = {}
    for (const [name, field] of Object.entries(value)) result[name] = toPlain(field)
    return result
}

export interface LatestInput {
    receivedAt: number
    packetId: number
    header: StructValue | null
    data: StructValue | null
    error: string | null
}

export class LatestPackets {
    private entries = new Map<number, LatestInput>()

    record(entry: LatestInput): void {
        this.entries.set(entry.packetId, entry)
    }

    get(packetId: number): DecodedEntry | null {
        const entry = this.entries.get(packetId)
        if (!entry) return null
        return {
            receivedAt: entry.receivedAt,
            packetId: entry.packetId,
            header: entry.header ? toPlainStruct(entry.header) : null,
            data: entry.data ? toPlainStruct(entry.data) : null,
            error: entry.error
        }
    }

    ids(): number[] {
        return [...this.entries.keys()].sort((a, b) => a - b)
    }

    reset(): void {
        this.entries.clear()
    }
}

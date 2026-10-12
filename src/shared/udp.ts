import type {WorldSnapshot} from './world'

export type ReceiverState = 'stopped' | 'listening' | 'error'

export interface ReceiverStatus {
    state: ReceiverState
    port: number
    error?: string
    reason?: string
}

export interface PacketStats {
    packetFormat: number | null
    packetId: number | null
    size: number
    count: number
    perSecond: number
    lastReceivedAt: number
    preview: string
}

export interface RecentPacket {
    receivedAt: number
    packetFormat: number | null
    packetId: number | null
    size: number
    sessionTime: number | null
    frameIdentifier: number | null
}

export type PlainValue = number | string | PlainValue[] | {[name: string]: PlainValue}

export interface DecodedEntry {
    receivedAt: number
    packetId: number
    header: {[name: string]: PlainValue} | null
    data: {[name: string]: PlainValue} | null
    error: string | null
}

export interface DirectorState {
    locked: boolean
    hotkey: string | null
}

export interface DirectorStartResult {
    started: boolean
    error: string | null
}

export interface UdpSnapshot {
    status: ReceiverStatus
    totalPackets: number
    packets: PacketStats[]
    recent: RecentPacket[]
    decodedIds: number[]
    director: DirectorState
    world: WorldSnapshot
}

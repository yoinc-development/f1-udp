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

export interface UdpSnapshot {
    status: ReceiverStatus
    totalPackets: number
    packets: PacketStats[]
    recent: RecentPacket[]
}

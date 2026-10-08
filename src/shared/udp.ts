export type ReceiverState = 'stopped' | 'listening' | 'error'

export interface ReceiverStatus {
    state: ReceiverState
    port: number
    error?: string
}

export interface PacketStats {
    packetFormat: number | null
    size: number
    count: number
    perSecond: number
    lastReceivedAt: number
    preview: string
}

export interface UdpSnapshot {
    status: ReceiverStatus
    totalPackets: number
    packets: PacketStats[]
}

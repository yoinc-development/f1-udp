import type {GameVersion} from './settings'
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

export const REPLAY_SPEEDS = [1, 10] as const

export type ReplaySpeed = (typeof REPLAY_SPEEDS)[number]

export interface RecordingStatus {
    active: boolean
    file: string | null
    packets: number
    bytes: number
    error?: string
}

export type ReplayState = 'idle' | 'playing' | 'paused' | 'ended' | 'error'

export interface ReplayStatus {
    state: ReplayState
    file: string | null
    gameVersion: GameVersion | null
    positionMs: number
    durationMs: number
    speed: ReplaySpeed
    error?: string
}

export interface DecisionEntry {
    t: number
    lap: number
    target: {car: number; name: string}
    reason: string
    kind: string
    tier: number
    score: number
    current: {car: number; score: number} | null
    rule: string
}

export interface AnalysisStatus {
    state: 'idle' | 'running' | 'done' | 'error'
    file: string | null
    progress: number
    decisions: number
    error?: string
}

export type LiveStage = 'idle' | 'armed' | 'directing' | 'finished'

export interface LiveDirectorStatus {
    stage: LiveStage
    current: DecisionEntry | null
    decisions: DecisionEntry[]
}

export interface UdpSnapshot {
    status: ReceiverStatus
    totalPackets: number
    packets: PacketStats[]
    recent: RecentPacket[]
    decodedIds: number[]
    director: DirectorState
    live: LiveDirectorStatus
    world: WorldSnapshot
    recording: RecordingStatus
    replay: ReplayStatus
    analysis: AnalysisStatus
}

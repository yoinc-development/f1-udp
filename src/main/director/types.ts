import type {WorldSnapshot} from '@shared/world'
import type {WorldEvent} from '../state/events'

export type PoiKind =
    | 'raceStart'
    | 'crash'
    | 'battle'
    | 'overtake'
    | 'pitStop'
    | 'penalty'
    | 'retirement'
    | 'fastestLap'
    | 'leader'

export type Tier = 1 | 2 | 3

export type Phase = 'inactive' | 'lap1' | 'race' | 'lastLap'

export interface Poi {
    kind: PoiKind
    tier: Tier
    car: number
    cars: number[]
    score: number
    reason: string
}

export interface DetectorInput {
    now: number
    snapshot: WorldSnapshot
    events: WorldEvent[]
}

export interface Timed {
    until: number
    poi: Poi
}

export interface Decision {
    t: number
    lap: number
    target: {car: number; name: string}
    reason: string
    kind: PoiKind
    tier: Tier
    score: number
    current: {car: number; score: number} | null
    rule: string
}

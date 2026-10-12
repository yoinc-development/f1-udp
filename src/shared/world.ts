export type SafetyCar = 'none' | 'full' | 'virtual' | 'formation'

export type Tyre = 'soft' | 'medium' | 'hard' | 'inter' | 'wet'

export type PitState = 'none' | 'pitting' | 'pitArea'

export type CarStatus = 'active' | 'finished' | 'dnf' | 'dsq' | 'nc' | 'retired'

export interface WorldSession {
    track: string | null
    sessionType: string | null
    currentLap: number
    totalLaps: number
    safetyCar: SafetyCar
    spectating: boolean
    focusedCarIndex: number | null
    timeLeftSeconds: number
}

export interface WorldCar {
    carIndex: number
    position: number
    raceNumber: number | null
    name: string | null
    team: string | null
    lap: number
    gapToLeaderMs: number | null
    intervalMs: number | null
    lastLapMs: number | null
    bestLapMs: number | null
    tyre: Tyre | null
    tyreAge: number | null
    pitStatus: PitState
    pitStops: number
    penaltySeconds: number
    warnings: number
    status: CarStatus
    frontWingDamage: number | null
}

export interface WorldSnapshot {
    available: boolean
    session: WorldSession | null
    cars: WorldCar[]
}

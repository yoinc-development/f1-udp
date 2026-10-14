import type {WorldCar, WorldSession, WorldSnapshot} from '@shared/world'
import type {WorldEvent, WorldEventKind} from '../state/events'

export function car(
    carIndex: number,
    position: number,
    overrides: Partial<WorldCar> = {}
): WorldCar {
    return {
        carIndex,
        position,
        raceNumber: carIndex + 1,
        name: `C${carIndex}`,
        team: null,
        lap: 3,
        gapToLeaderMs: null,
        intervalMs: position === 1 ? 0 : 5000,
        lastLapMs: null,
        bestLapMs: null,
        tyre: null,
        tyreAge: null,
        pitStatus: 'none',
        pitStops: 0,
        penaltySeconds: 0,
        warnings: 0,
        status: 'active',
        frontWingDamage: 0,
        ...overrides
    }
}

export function session(overrides: Partial<WorldSession> = {}): WorldSession {
    return {
        track: null,
        sessionType: 'Race',
        isRace: true,
        currentLap: 3,
        totalLaps: 5,
        safetyCar: 'none',
        spectating: true,
        focusedCarIndex: null,
        timeLeftSeconds: 0,
        ...overrides
    }
}

export function snapshot(cars: WorldCar[], overrides: Partial<WorldSession> = {}): WorldSnapshot {
    return {
        available: true,
        session: session(overrides),
        cars: [...cars].sort((a, b) => a.position - b.position)
    }
}

export function event(
    time: number,
    kind: WorldEventKind,
    cars: number[] = [],
    details: Record<string, number> = {}
): WorldEvent {
    return {time, kind, cars, details}
}

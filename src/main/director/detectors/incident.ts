import type {WorldCar, WorldSnapshot} from '@shared/world'
import type {DirectorConfig} from '../config'
import type {DetectorInput, Poi, Timed} from '../types'
import {carName, findCar, poisOf, stillActive} from './common'

interface Sample {
    time: number
    wing: Record<number, number>
    position: Record<number, number>
}

interface Pending {
    time: number
    cars: number[]
    before: Sample
}

export interface IncidentState {
    history: Sample[]
    pending: Pending[]
    active: Timed[]
}

export function createIncidentState(): IncidentState {
    return {history: [], pending: [], active: []}
}

const OUT: readonly WorldCar['status'][] = ['dnf', 'retired', 'dsq']

function sampleOf(now: number, snapshot: WorldSnapshot): Sample {
    const wing: Record<number, number> = {}
    const position: Record<number, number> = {}
    for (const car of snapshot.cars) {
        wing[car.carIndex] = car.frontWingDamage ?? 0
        position[car.carIndex] = car.position
    }
    return {time: now, wing, position}
}

function baselineAt(history: Sample[], current: Sample, time: number): Sample {
    let found: Sample | undefined
    for (const sample of history) if (sample.time <= time) found = sample
    return found ?? history[0] ?? current
}

interface Consequence {
    car: number
    severity: number
    text: string
}

function consequenceOf(
    car: WorldCar,
    before: Sample,
    retired: boolean,
    config: DirectorConfig
): Consequence | null {
    const wing = (car.frontWingDamage ?? 0) - (before.wing[car.carIndex] ?? 0)
    const lost = car.position - (before.position[car.carIndex] ?? car.position)
    if (retired || OUT.includes(car.status)) {
        return {car: car.carIndex, severity: 1000, text: 'retired'}
    }
    if (wing >= config.crash.wingDamageIncrease) {
        return {car: car.carIndex, severity: wing, text: `front wing +${Math.round(wing)}%`}
    }
    if (lost >= config.crash.positionsLost) {
        return {car: car.carIndex, severity: lost * 10, text: `lost ${lost} positions`}
    }
    return null
}

function raceStarts(input: DetectorInput, config: DirectorConfig): Timed[] {
    const leader = input.snapshot.cars[0]
    if (!leader) return []
    return input.events
        .filter((event) => event.kind === 'lightsOut')
        .map((event) => ({
            until: event.time + config.durationsSeconds.raceStart,
            poi: {
                kind: 'raceStart' as const,
                tier: config.tiers.raceStart,
                car: leader.carIndex,
                cars: [leader.carIndex],
                score: config.scores.raceStart,
                reason: `race start, lights out, leader ${carName(input.snapshot, leader.carIndex)}`
            }
        }))
}

export function detectIncidents(
    input: DetectorInput,
    state: IncidentState,
    config: DirectorConfig
): {pois: Poi[]; state: IncidentState} {
    const {now, snapshot, events} = input
    const current = sampleOf(now, snapshot)
    const retiredNow = new Set(
        events.filter((event) => event.kind === 'retirement').flatMap((event) => event.cars)
    )

    const pending: Pending[] = [...state.pending]
    for (const event of events) {
        if (event.kind !== 'collision') continue
        pending.push({
            time: event.time,
            cars: event.cars,
            before: baselineAt(state.history, current, event.time)
        })
    }

    const active = stillActive([...state.active, ...raceStarts(input, config)], now)
    const stillPending: Pending[] = []
    for (const collision of pending) {
        if (now - collision.time > config.crash.windowSeconds) continue
        const consequences: Consequence[] = []
        for (const carIndex of collision.cars) {
            const car = findCar(snapshot, carIndex)
            const found = car
                ? consequenceOf(car, collision.before, retiredNow.has(carIndex), config)
                : null
            if (found) consequences.push(found)
        }
        const worst = consequences.sort((a, b) => b.severity - a.severity)[0]
        if (worst) {
            const other = collision.cars.find((carIndex) => carIndex !== worst.car)
            const contact = other === undefined ? '' : ` with ${carName(snapshot, other)}`
            active.push({
                until: now + config.durationsSeconds.crash,
                poi: {
                    kind: 'crash',
                    tier: config.tiers.crash,
                    car: worst.car,
                    cars: collision.cars,
                    score: config.scores.crash,
                    reason: `crash: ${carName(snapshot, worst.car)} ${worst.text} after contact${contact}`
                }
            })
        } else {
            stillPending.push(collision)
        }
    }

    const history = [...state.history, current].filter(
        (sample) => now - sample.time <= config.crash.windowSeconds + 2
    )
    return {pois: poisOf(active), state: {history, pending: stillPending, active}}
}

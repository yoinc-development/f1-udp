import type {DirectorConfig} from '../config'
import type {WorldEvent} from '../../state/events'
import type {DetectorInput, Poi, Timed} from '../types'
import {carName, findCar, poisOf, positionWeight, stillActive} from './common'

export interface EventPoiState {
    active: Timed[]
}

export function createEventPoiState(): EventPoiState {
    return {active: []}
}

function toTimed(event: WorldEvent, input: DetectorInput, config: DirectorConfig): Timed | null {
    const carIndex = event.cars[0]
    if (carIndex === undefined) return null
    const {snapshot} = input
    const name = carName(snapshot, carIndex)
    const base = {car: carIndex, cars: [carIndex]}

    if (event.kind === 'penalty') {
        const type = event.details.penaltyType ?? -1
        if (!config.penalty.types.includes(type)) return null
        return {
            until: event.time + config.durationsSeconds.penalty,
            poi: {
                ...base,
                kind: 'penalty',
                tier: config.tiers.penalty,
                score: config.scores.penalty,
                reason: `penalty: ${name}, type ${type}, ${event.details.time ?? 0}s`
            }
        }
    }
    if (event.kind === 'retirement') {
        return {
            until: event.time + config.durationsSeconds.retirement,
            poi: {
                ...base,
                kind: 'retirement',
                tier: config.tiers.retirement,
                score: config.scores.retirement,
                reason: `retirement: ${name}`
            }
        }
    }
    if (event.kind === 'fastestLap') {
        const car = findCar(snapshot, carIndex)
        const weight = car ? positionWeight(config, car.position) : 0
        if (!car || weight === 0) return null
        return {
            until: event.time + config.durationsSeconds.fastestLap,
            poi: {
                ...base,
                kind: 'fastestLap',
                tier: config.tiers.fastestLap,
                score: config.scores.fastestLap * weight,
                reason: `fastest lap: ${name} P${car.position}`
            }
        }
    }
    return null
}

export function detectEventPois(
    input: DetectorInput,
    state: EventPoiState,
    config: DirectorConfig
): {pois: Poi[]; state: EventPoiState} {
    const active = stillActive(state.active, input.now)
    for (const event of input.events) {
        const timed = toTimed(event, input, config)
        if (timed && timed.until > input.now) active.push(timed)
    }
    return {pois: poisOf(active), state: {active}}
}

import type {DirectorConfig} from '../config'
import type {DetectorInput, Poi, Timed} from '../types'
import {carName, poisOf, positionWeight, stillActive} from './common'

export interface PitState {
    inPit: Record<number, boolean> | null
    active: Timed[]
}

export function createPitState(): PitState {
    return {inPit: null, active: []}
}

export function detectPitStops(
    input: DetectorInput,
    state: PitState,
    config: DirectorConfig
): {pois: Poi[]; state: PitState} {
    const {now, snapshot} = input
    const active = stillActive(state.active, now)
    const inPit: Record<number, boolean> = {}
    for (const car of snapshot.cars) {
        const pitting = car.pitStatus !== 'none'
        inPit[car.carIndex] = pitting
        const weight = positionWeight(config, car.position)
        if (state.inPit && pitting && !state.inPit[car.carIndex] && weight > 0) {
            active.push({
                until: now + config.durationsSeconds.pitStop,
                poi: {
                    kind: 'pitStop',
                    tier: config.tiers.pitStop,
                    car: car.carIndex,
                    cars: [car.carIndex],
                    score: config.scores.pitStop * weight,
                    reason: `pit stop: ${carName(snapshot, car.carIndex)} P${car.position}`
                }
            })
        }
    }
    return {pois: poisOf(active), state: {inPit, active}}
}

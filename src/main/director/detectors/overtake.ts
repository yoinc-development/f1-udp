import type {DirectorConfig} from '../config'
import type {DetectorInput, Poi, Timed} from '../types'
import {carName, findCar, poisOf, positionWeight, stillActive} from './common'

export interface OvertakeState {
    active: Timed[]
}

export function createOvertakeState(): OvertakeState {
    return {active: []}
}

export function detectOvertakes(
    input: DetectorInput,
    state: OvertakeState,
    config: DirectorConfig
): {pois: Poi[]; state: OvertakeState} {
    const {now, snapshot, events} = input
    const active = stillActive(state.active, now)
    for (const event of events) {
        const [overtaking, overtaken] = event.cars
        if (event.kind !== 'overtake' || overtaking === undefined || overtaken === undefined) {
            continue
        }
        const car = findCar(snapshot, overtaking)
        const weight = car ? positionWeight(config, car.position) : 0
        const until = event.time + config.durationsSeconds.overtake
        if (!car || weight === 0 || until <= now) continue
        const names = `${carName(snapshot, overtaking)} passes ${carName(snapshot, overtaken)}`
        active.push({
            until,
            poi: {
                kind: 'overtake',
                tier: config.tiers.overtake,
                car: overtaking,
                cars: [overtaking, overtaken],
                score: config.scores.overtake * weight,
                reason: `overtake: ${names} for P${car.position}`
            }
        })
    }
    return {pois: poisOf(active), state: {active}}
}

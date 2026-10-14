import type {WorldCar} from '@shared/world'
import type {DirectorConfig} from '../config'
import type {DetectorInput, Poi} from '../types'
import {carName, positionWeight} from './common'

export interface BattleState {
    closeSince: Record<number, number>
}

export function createBattleState(): BattleState {
    return {closeSince: {}}
}

function isClose(car: WorldCar, ahead: WorldCar, maxGapMs: number): boolean {
    return (
        car.position === ahead.position + 1 &&
        car.status === 'active' &&
        ahead.status === 'active' &&
        car.pitStatus === 'none' &&
        ahead.pitStatus === 'none' &&
        car.intervalMs !== null &&
        car.intervalMs > 0 &&
        car.intervalMs < maxGapMs
    )
}

export function detectBattles(
    input: DetectorInput,
    state: BattleState,
    config: DirectorConfig
): {pois: Poi[]; state: BattleState} {
    const {now, snapshot} = input
    const {cars} = snapshot
    const maxGapMs = config.battle.maxGapSeconds * 1000
    const closeSince: Record<number, number> = {}
    const established: boolean[] = []

    cars.forEach((car, index) => {
        const ahead = cars[index - 1]
        if (!ahead || !isClose(car, ahead, maxGapMs)) {
            established.push(false)
            return
        }
        const since = state.closeSince[car.carIndex] ?? now
        closeSince[car.carIndex] = since
        established.push(now - since >= config.battle.minSeconds)
    })

    const pois: Poi[] = []
    let start = 0
    while (start < cars.length) {
        let end = start
        while (established[end + 1]) end++
        const front = cars[start]
        const weight = front ? positionWeight(config, front.position) : 0
        if (front && end > start && weight > 0) {
            const group = cars.slice(start, end + 1)
            const followers = group.slice(1)
            const elapsed = Math.min(
                ...followers.map((car) => now - (closeSince[car.carIndex] ?? now))
            )
            const gaps = followers.map((car) => `${((car.intervalMs ?? 0) / 1000).toFixed(2)}s`)
            const places = group.map((car) => `P${car.position}`).join('/')
            const names = group.map((car) => carName(snapshot, car.carIndex)).join(' ')
            pois.push({
                kind: 'battle',
                tier: config.tiers.battle,
                car: front.carIndex,
                cars: group.map((car) => car.carIndex),
                score:
                    config.scores.battle *
                    weight *
                    (1 + config.battle.extraCarBonus * (group.length - 2)),
                reason: `battle ${places} ${names}, gap ${gaps.join('/')} for ${Math.floor(elapsed)}s`
            })
        }
        start = end + 1
    }
    return {pois, state: {closeSince}}
}

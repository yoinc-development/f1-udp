import {describe, expect, it} from 'vitest'
import {DEFAULT_CONFIG} from '../config'
import {car, event, snapshot} from '../fixtures'
import type {WorldCar} from '@shared/world'
import type {WorldEvent} from '../../state/events'
import {createIncidentState, detectIncidents} from './incident'

type Frame = {now: number; cars: WorldCar[]; events?: WorldEvent[]}

function run(frames: Frame[]) {
    let state = createIncidentState()
    const results = []
    for (const frame of frames) {
        const result = detectIncidents(
            {now: frame.now, snapshot: snapshot(frame.cars), events: frame.events ?? []},
            state,
            DEFAULT_CONFIG
        )
        state = result.state
        results.push(result.pois)
    }
    return results
}

const GRID = [car(0, 1), car(1, 2), car(2, 3), car(3, 4), car(4, 5)]
const COLLISION = event(10.1, 'collision', [1, 2])

describe('crash detection', () => {
    it('ignores a collision without consequence', () => {
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: GRID, events: [COLLISION]},
            {now: 16, cars: GRID}
        ])

        expect(results.flat()).toEqual([])
    })

    it('reports a crash when the front wing damage rises by 20 points', () => {
        const hit = GRID.map((item) =>
            item.carIndex === 1 ? {...item, frontWingDamage: 25} : item
        )
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: hit, events: [COLLISION]}
        ])

        expect(results[1]).toHaveLength(1)
        expect(results[1]?.[0]).toMatchObject({kind: 'crash', tier: 1, car: 1, cars: [1, 2]})
        expect(results[1]?.[0]?.reason).toContain('front wing +25%')
    })

    it('uses the damage before the collision as the baseline, not the damage after it', () => {
        const hit = GRID.map((item) =>
            item.carIndex === 1 ? {...item, frontWingDamage: 25} : item
        )
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: hit, events: [COLLISION]},
            {now: 10.5, cars: hit}
        ])

        expect(results[2]).toHaveLength(1)
    })

    it('does not report a wing damage rise of less than 20 points', () => {
        const hit = GRID.map((item) =>
            item.carIndex === 1 ? {...item, frontWingDamage: 19} : item
        )
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: hit, events: [COLLISION]}
        ])

        expect(results.flat()).toEqual([])
    })

    it('reports a crash when a car retires within 5 s', () => {
        const out = GRID.map((item) =>
            item.carIndex === 2 ? {...item, status: 'retired' as const} : item
        )
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: GRID, events: [COLLISION]},
            {now: 13, cars: out}
        ])

        expect(results[2]?.[0]).toMatchObject({kind: 'crash', car: 2})
        expect(results[2]?.[0]?.reason).toContain('retired')
    })

    it('reports a crash when a car loses three positions', () => {
        const lost = [car(0, 1), car(2, 2), car(3, 3), car(4, 4), car(1, 5)]
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: GRID, events: [COLLISION]},
            {now: 12, cars: lost}
        ])

        expect(results[2]?.[0]).toMatchObject({kind: 'crash', car: 1})
        expect(results[2]?.[0]?.reason).toContain('lost 3 positions')
    })

    it('does not report a consequence that comes after the 5 s window', () => {
        const hit = GRID.map((item) =>
            item.carIndex === 1 ? {...item, frontWingDamage: 60} : item
        )
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: GRID, events: [COLLISION]},
            {now: 15.5, cars: hit}
        ])

        expect(results.flat()).toEqual([])
    })

    it('keeps the crash for 10 s, then drops it', () => {
        const hit = GRID.map((item) =>
            item.carIndex === 1 ? {...item, frontWingDamage: 25} : item
        )
        const results = run([
            {now: 10, cars: GRID},
            {now: 10.25, cars: hit, events: [COLLISION]},
            {now: 19, cars: hit},
            {now: 20.5, cars: hit}
        ])

        expect(results[2]).toHaveLength(1)
        expect(results[3]).toEqual([])
    })
})

describe('race start', () => {
    it('shows the leader for 15 s after lights out', () => {
        const results = run([
            {now: 5, cars: GRID, events: [event(5, 'lightsOut')]},
            {now: 19, cars: GRID},
            {now: 20.5, cars: GRID}
        ])

        expect(results[0]?.[0]).toMatchObject({kind: 'raceStart', tier: 1, car: 0})
        expect(results[1]).toHaveLength(1)
        expect(results[2]).toEqual([])
    })
})

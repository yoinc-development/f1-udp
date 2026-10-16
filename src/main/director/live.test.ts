import {describe, expect, it} from 'vitest'
import {DEFAULT_CONFIG} from './config'
import {LiveDirector} from './live'
import {DirectorRun} from './run'
import type {WorldState} from '../state/world'
import {car, event, snapshot} from './fixtures'
import type {WorldEvent} from '../state/events'

const CARS = snapshot([car(0, 1), car(1, 2, {intervalMs: 5000}), car(2, 3, {intervalMs: 300})])

class FakeWorld {
    sessionTime = 0
    sessionUid: string | null = 'a'
    events: WorldEvent[] = []

    snapshot() {
        return CARS
    }

    takeEvents(): WorldEvent[] {
        const events = this.events
        this.events = []
        return events
    }
}

function feed(live: LiveDirector, world: FakeWorld, from: number, to: number): void {
    for (let time = from; time <= to; time += 0.25) {
        world.sessionTime = time
        if (time === from) world.events.push(event(time, 'lightsOut'))
        live.tick(world as unknown as WorldState, 'f1-25')
    }
}

describe('LiveDirector', () => {
    it('is armed with no decisions until the lights go out', () => {
        const live = new LiveDirector(DEFAULT_CONFIG)

        expect(live.stage).toBe('armed')
        expect(live.current).toBeNull()
        expect(live.recent).toEqual([])
    })

    it('keeps the newest decision first', () => {
        const live = new LiveDirector(DEFAULT_CONFIG)
        feed(live, new FakeWorld(), 0, 30)

        expect(live.recent.map((decision) => decision.t)).toEqual([15, 0])
        expect(live.current?.t).toBe(15)
        expect(live.stage).toBe('directing')
    })

    it('gives the same decisions as a plain run', () => {
        const live = new LiveDirector(DEFAULT_CONFIG)
        const run = new DirectorRun(DEFAULT_CONFIG)
        const world = new FakeWorld()
        feed(live, world, 0, 60)
        const expected = []
        for (let now = 0; now <= 60; now += 0.25) {
            const decision = run.tick({
                now,
                sessionUid: 'a',
                snapshot: CARS,
                events: now === 0 ? [event(0, 'lightsOut')] : []
            })
            if (decision) expected.push(decision)
        }

        expect(live.recent).toEqual(expected.reverse())
    })

    it('clears the decisions and arms again on reset', () => {
        const live = new LiveDirector(DEFAULT_CONFIG)
        feed(live, new FakeWorld(), 0, 30)
        live.reset(DEFAULT_CONFIG)

        expect(live.recent).toEqual([])
        expect(live.stage).toBe('armed')
    })

    it('keeps only the most recent decisions', () => {
        const live = new LiveDirector(DEFAULT_CONFIG, 1)
        feed(live, new FakeWorld(), 0, 30)

        expect(live.recent.map((decision) => decision.t)).toEqual([15])
    })
})

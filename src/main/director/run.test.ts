import {describe, expect, it} from 'vitest'
import {DEFAULT_CONFIG} from './config'
import {car, event, snapshot} from './fixtures'
import {DirectorRun} from './run'
import type {Decision} from './types'
import type {WorldEvent} from '../state/events'

const BATTLE = snapshot([car(0, 1), car(1, 2, {intervalMs: 5000}), car(2, 3, {intervalMs: 300})])

function play(
    run: DirectorRun,
    from: number,
    to: number,
    options: {events?: Record<number, WorldEvent[]>; uid?: string} = {}
): Decision[] {
    const decisions: Decision[] = []
    for (let now = from; now <= to; now += 0.25) {
        const decision = run.tick({
            now,
            sessionUid: options.uid ?? 'a',
            snapshot: BATTLE,
            events: options.events?.[now] ?? []
        })
        if (decision) decisions.push(decision)
    }
    return decisions
}

describe('DirectorRun', () => {
    it('is due on the first call and then every quarter of a second of session time', () => {
        const run = new DirectorRun(DEFAULT_CONFIG)

        expect(run.isDue(10)).toBe(true)
        run.tick({now: 10, sessionUid: 'a', snapshot: BATTLE, events: []})

        expect(run.isDue(10.1)).toBe(false)
        expect(run.isDue(10.25)).toBe(true)
    })

    it('is due again when the session time goes backwards', () => {
        const run = new DirectorRun(DEFAULT_CONFIG)
        run.tick({now: 100, sessionUid: 'a', snapshot: BATTLE, events: []})

        expect(run.isDue(90)).toBe(true)
    })

    it('starts on the leader and moves to a battle that lasts after the minimum dwell', () => {
        const run = new DirectorRun(DEFAULT_CONFIG)
        const decisions = play(run, 0, 30)

        expect(
            decisions.map((decision) => [decision.t, decision.target.car, decision.kind])
        ).toEqual([
            [0, 0, 'leader'],
            [15, 1, 'battle']
        ])
    })

    it('goes back to the leader after a red flag and ignores battles until the restart', () => {
        const run = new DirectorRun(DEFAULT_CONFIG)
        const decisions = play(run, 0, 40, {
            events: {20: [event(20, 'redFlag')], 30: [event(30, 'lightsOut')]}
        })

        expect(decisions.map((decision) => [decision.t, decision.target.car])).toEqual([
            [0, 0],
            [15, 1],
            [20, 0]
        ])
    })

    it('treats the first ticks of a new session as a new run', () => {
        const run = new DirectorRun(DEFAULT_CONFIG)
        play(run, 0, 30)
        const next = play(run, 0, 1, {uid: 'b'})

        expect(next).toHaveLength(1)
        expect(next[0]).toMatchObject({t: 0, rule: 'initial target'})
    })

    it('gives the same decisions on every run', () => {
        expect(play(new DirectorRun(DEFAULT_CONFIG), 0, 60)).toEqual(
            play(new DirectorRun(DEFAULT_CONFIG), 0, 60)
        )
    })
})

import {describe, expect, it} from 'vitest'
import {DEFAULT_CONFIG} from './config'
import {createDirectorMemory, decide} from './decide'
import {car, snapshot} from './fixtures'
import type {Decision, Phase, Poi, PoiKind, Tier} from './types'

const CARS = [car(0, 1), car(1, 2), car(2, 3), car(3, 4)]

function poi(kind: PoiKind, carIndex: number, score: number, tier: Tier = 2, cars?: number[]): Poi {
    return {
        kind,
        tier,
        car: carIndex,
        cars: cars ?? [carIndex],
        score,
        reason: `${kind} ${carIndex}`
    }
}

interface Frame {
    now: number
    pois?: Poi[]
    phase?: Phase
    neutral?: boolean
}

function drive(frames: Frame[]): Decision[] {
    let memory = createDirectorMemory()
    const decisions: Decision[] = []
    for (const frame of frames) {
        const result = decide(
            {
                now: frame.now,
                phase: frame.phase ?? 'race',
                neutral: frame.neutral ?? false,
                snapshot: snapshot(CARS),
                pois: frame.pois ?? []
            },
            memory,
            DEFAULT_CONFIG
        )
        memory = result.memory
        if (result.decision) decisions.push(result.decision)
    }
    return decisions
}

function ticks(from: number, to: number, pois: Poi[], phase?: Phase): Frame[] {
    const frames: Frame[] = []
    for (let now = from; now <= to; now += 0.25) frames.push({now, pois, phase})
    return frames
}

describe('decide', () => {
    it('starts on the leader with an explained decision', () => {
        const [decision] = drive([{now: 100}])

        expect(decision).toEqual({
            t: 100,
            lap: 3,
            target: {car: 0, name: 'C0'},
            reason: 'leader C0',
            kind: 'leader',
            tier: 3,
            score: 10,
            current: null,
            rule: 'initial target'
        })
    })

    it('gives no decision when there is no race', () => {
        expect(drive([{now: 0, phase: 'inactive'}])).toEqual([])
    })

    it('holds a battle that lasts, such as two cars at 0.3 s for 20 s', () => {
        const battle = poi('battle', 1, 54, 2, [0, 1])
        const decisions = drive([{now: 0}, ...ticks(1, 30, [battle])])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 1])
        expect(decisions[1]?.rule).toBe('higher tier after min dwell')
    })

    it('waits for the minimum dwell before leaving the current target', () => {
        const battle = poi('battle', 1, 54)
        const early = drive([{now: 0}, ...ticks(1, 14.75, [battle])])
        const late = drive([{now: 0}, ...ticks(1, 15, [battle])])

        expect(early).toHaveLength(1)
        expect(late).toHaveLength(2)
        expect(late[1]?.t).toBe(15)
    })

    it('switches to a crash on the next tick, ignoring dwell and hysteresis', () => {
        const battle = poi('battle', 1, 54)
        const crash = poi('crash', 3, 100, 1)
        const decisions = drive([
            {now: 0},
            ...ticks(1, 16, [battle]),
            {now: 17, pois: [battle, crash]}
        ])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 1, 3])
        expect(decisions[2]).toMatchObject({
            t: 17,
            rule: 'tier 1 interrupt, ignores dwell and hysteresis'
        })
    })

    it('lets a crash interrupt right after the first shot started', () => {
        const decisions = drive([{now: 0}, {now: 1, pois: [poi('crash', 2, 100, 1)]}])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 2])
    })

    it('keeps a better challenger of the same tier out until it beats the margin', () => {
        const current = poi('battle', 1, 60)
        const warm = drive([
            {now: 0},
            ...ticks(1, 16, [current]),
            ...ticks(17, 40, [current, poi('battle', 2, 70)])
        ])
        const hot = drive([
            {now: 0},
            ...ticks(1, 16, [current]),
            ...ticks(17, 40, [current, poi('battle', 2, 80)])
        ])

        expect(warm.map((decision) => decision.target.car)).toEqual([0, 1])
        expect(hot.map((decision) => decision.target.car)).toEqual([0, 1, 2])
        expect(hot[2]?.rule).toBe('challenger beat current by > 30% after min dwell')
    })

    it('does not return to a target it just left until the cooldown is over', () => {
        const a = poi('battle', 1, 60)
        const b = poi('battle', 2, 90)
        const decisions = drive([
            {now: 0},
            ...ticks(1, 16, [a]),
            ...ticks(17, 33, [a, b]),
            ...ticks(34, 70, [a, poi('battle', 2, 20)])
        ])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 1, 2, 1])
        expect(decisions[3]?.t).toBe((decisions[2]?.t ?? 0) + 30)
    })

    it('penalises a target that was shown for a long time', () => {
        const long = poi('battle', 1, 60)
        const fresh = poi('battle', 2, 40)
        const decisions = drive([
            {now: 0},
            ...ticks(1, 59, [long, fresh]),
            ...ticks(60, 80, [long, fresh])
        ])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 1, 2])
        expect(decisions[2]?.t).toBeGreaterThan(61)
    })

    it('returns to the leader when the current target is no longer of interest', () => {
        const battle = poi('battle', 1, 54)
        const decisions = drive([{now: 0}, ...ticks(1, 16, [battle]), ...ticks(16.25, 40, [])])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 1, 0])
        expect(decisions[2]?.rule).toBe('current target no longer of interest after min dwell')
    })

    it('goes back to the leader as soon as the last lap starts', () => {
        const battle = poi('battle', 2, 54)
        const decisions = drive([
            {now: 0},
            ...ticks(1, 20, [battle]),
            {now: 21, pois: [battle], phase: 'lastLap'}
        ])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 2, 0])
        expect(decisions[2]?.rule).toBe('current target no longer of interest after mode change')
    })

    it('ignores everything but crashes on the last lap', () => {
        const decisions = drive([
            {now: 0, phase: 'lastLap'},
            ...ticks(1, 40, [poi('battle', 1, 54), poi('overtake', 2, 50)], 'lastLap'),
            {now: 41, phase: 'lastLap', pois: [poi('crash', 3, 100, 1)]}
        ])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 3])
    })

    it('shows only the race start and battles of three or more cars in lap 1', () => {
        const duo = poi('battle', 1, 54, 2, [0, 1])
        const trio = poi('battle', 2, 60, 2, [1, 2, 3])
        const noise = poi('overtake', 3, 50)

        expect(
            drive([{now: 0, phase: 'lap1'}, ...ticks(1, 40, [duo, noise], 'lap1')])
        ).toHaveLength(1)

        const decisions = drive([{now: 0, phase: 'lap1'}, ...ticks(1, 40, [duo, trio], 'lap1')])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 2])
    })

    it('shows the race start before any battle in lap 1', () => {
        const start = poi('raceStart', 0, 90, 1)
        const trio = poi('battle', 2, 60, 2, [1, 2, 3])
        const decisions = drive([
            {now: 0, phase: 'lap1', pois: [start]},
            ...ticks(1, 14, [start, trio], 'lap1'),
            ...ticks(15, 40, [trio], 'lap1')
        ])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 2])
        expect(decisions[0]?.kind).toBe('raceStart')
        expect(decisions[1]?.t).toBe(15)
    })

    it('shows only the leader and crashes under a safety car or after a red flag', () => {
        const battle = poi('battle', 1, 54)
        const decisions = drive([
            {now: 0},
            ...ticks(1, 20, [battle]),
            ...ticks(21, 40, [battle], 'race').map((frame) => ({...frame, neutral: true}))
        ])

        expect(decisions.map((decision) => decision.target.car)).toEqual([0, 1, 0])
        expect(decisions[2]?.rule).toBe('current target no longer of interest after mode change')
    })

    it('does not repeat a decision while the target stays the same', () => {
        expect(drive(ticks(0, 60, []))).toHaveLength(1)
    })

    it('gives the same decisions for the same input', () => {
        const frames = [{now: 0}, ...ticks(1, 40, [poi('battle', 1, 54)])]

        expect(drive(frames)).toEqual(drive(frames))
    })
})

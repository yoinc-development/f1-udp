import {describe, expect, it} from 'vitest'
import {DEFAULT_CONFIG} from '../config'
import {car, snapshot} from '../fixtures'
import {createBattleState, detectBattles} from './battle'

function run(frames: {now: number; cars: ReturnType<typeof car>[]}[]) {
    let state = createBattleState()
    let pois: ReturnType<typeof detectBattles>['pois'] = []
    for (const frame of frames) {
        const result = detectBattles(
            {now: frame.now, snapshot: snapshot(frame.cars), events: []},
            state,
            DEFAULT_CONFIG
        )
        state = result.state
        pois = result.pois
    }
    return pois
}

function duel(first: number, gap: number, now: number) {
    return {
        now,
        cars: [car(0, first), car(1, first + 1, {intervalMs: gap}), car(2, first + 2)]
    }
}

describe('detectBattles', () => {
    it('needs the gap to stay under 0.5 s for 5 s', () => {
        expect(run([duel(2, 400, 0), duel(2, 400, 4.9)])).toEqual([])

        const pois = run([duel(2, 400, 0), duel(2, 400, 5)])

        expect(pois).toHaveLength(1)
        expect(pois[0]).toMatchObject({kind: 'battle', tier: 2, car: 0, cars: [0, 1]})
        expect(pois[0]?.reason).toBe('battle P2/P3 C0 C1, gap 0.40s for 5s')
    })

    it('starts again when the gap opens up in between', () => {
        expect(run([duel(2, 400, 0), duel(2, 800, 3), duel(2, 400, 6), duel(2, 400, 9)])).toEqual(
            []
        )
    })

    it('does not count a gap of exactly 0.5 s or no gap data', () => {
        expect(run([duel(2, 500, 0), duel(2, 500, 10)])).toEqual([])
        expect(run([duel(2, 0, 0), duel(2, 0, 10)])).toEqual([])
    })

    it('ignores battles for positions behind P5', () => {
        expect(run([duel(6, 300, 0), duel(6, 300, 10)])).toEqual([])
    })

    it('counts a battle for P5 with the car behind it', () => {
        const pois = run([duel(5, 300, 0), duel(5, 300, 10)])

        expect(pois).toHaveLength(1)
        expect(pois[0]?.cars).toEqual([0, 1])
    })

    it('scores a battle higher the closer it is to the lead', () => {
        const front = run([duel(1, 300, 0), duel(1, 300, 6)])[0]
        const back = run([duel(4, 300, 0), duel(4, 300, 6)])[0]

        expect(front?.score).toBeGreaterThan(back?.score ?? Infinity)
    })

    it('joins a chain of gaps under 0.5 s into one battle of three cars', () => {
        const chain = (now: number) => ({
            now,
            cars: [
                car(0, 1),
                car(1, 2, {intervalMs: 300}),
                car(2, 3, {intervalMs: 450}),
                car(3, 4, {intervalMs: 5000})
            ]
        })
        const pois = run([chain(0), chain(5)])

        expect(pois).toHaveLength(1)
        expect(pois[0]?.cars).toEqual([0, 1, 2])
        expect(pois[0]?.score).toBeGreaterThan(60)
    })

    it('splits two battles that are separated by a large gap', () => {
        const split = (now: number) => ({
            now,
            cars: [
                car(0, 1),
                car(1, 2, {intervalMs: 300}),
                car(2, 3, {intervalMs: 5000}),
                car(3, 4, {intervalMs: 300})
            ]
        })
        const pois = run([split(0), split(5)])

        expect(pois.map((poi) => poi.cars)).toEqual([
            [0, 1],
            [2, 3]
        ])
    })

    it('ignores cars in the pits and retired cars', () => {
        const pit = (now: number) => ({
            now,
            cars: [car(0, 1), car(1, 2, {intervalMs: 300, pitStatus: 'pitting'})]
        })
        const out = (now: number) => ({
            now,
            cars: [car(0, 1), car(1, 2, {intervalMs: 300, status: 'retired'})]
        })

        expect(run([pit(0), pit(10)])).toEqual([])
        expect(run([out(0), out(10)])).toEqual([])
    })
})

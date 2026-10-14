import {describe, expect, it} from 'vitest'
import {DEFAULT_CONFIG} from '../config'
import {car, event, snapshot} from '../fixtures'
import {createEventPoiState, detectEventPois} from './events'
import {createOvertakeState, detectOvertakes} from './overtake'
import {createPitState, detectPitStops} from './pit'

const GRID = [car(0, 1), car(1, 2), car(2, 3), car(7, 8)]

describe('detectOvertakes', () => {
    it('reports an overtake for a car in the top five for 6 s', () => {
        const first = detectOvertakes(
            {now: 10, snapshot: snapshot(GRID), events: [event(9.9, 'overtake', [1, 2])]},
            createOvertakeState(),
            DEFAULT_CONFIG
        )
        const later = detectOvertakes(
            {now: 15, snapshot: snapshot(GRID), events: []},
            first.state,
            DEFAULT_CONFIG
        )
        const gone = detectOvertakes(
            {now: 16.5, snapshot: snapshot(GRID), events: []},
            later.state,
            DEFAULT_CONFIG
        )

        expect(first.pois[0]).toMatchObject({kind: 'overtake', tier: 2, car: 1, cars: [1, 2]})
        expect(first.pois[0]?.reason).toBe('overtake: C1 passes C2 for P2')
        expect(later.pois).toHaveLength(1)
        expect(gone.pois).toEqual([])
    })

    it('ignores overtakes behind P5', () => {
        const result = detectOvertakes(
            {now: 10, snapshot: snapshot(GRID), events: [event(10, 'overtake', [7, 2])]},
            createOvertakeState(),
            DEFAULT_CONFIG
        )

        expect(result.pois).toEqual([])
    })
})

describe('detectPitStops', () => {
    it('reports a car that enters the pits, but not the first snapshot', () => {
        const inPit = snapshot([car(0, 1), car(1, 2, {pitStatus: 'pitting'})])
        const first = detectPitStops(
            {now: 1, snapshot: inPit, events: []},
            createPitState(),
            DEFAULT_CONFIG
        )
        const clear = detectPitStops(
            {now: 2, snapshot: snapshot([car(0, 1), car(1, 2)]), events: []},
            first.state,
            DEFAULT_CONFIG
        )
        const entering = detectPitStops(
            {now: 3, snapshot: inPit, events: []},
            clear.state,
            DEFAULT_CONFIG
        )
        const later = detectPitStops(
            {now: 12, snapshot: inPit, events: []},
            entering.state,
            DEFAULT_CONFIG
        )

        expect(first.pois).toEqual([])
        expect(entering.pois[0]).toMatchObject({kind: 'pitStop', car: 1})
        expect(entering.pois[0]?.reason).toBe('pit stop: C1 P2')
        expect(later.pois).toEqual([])
    })

    it('ignores pit stops behind P5', () => {
        const clear = snapshot([car(0, 1), car(7, 8)])
        const inPit = snapshot([car(0, 1), car(7, 8, {pitStatus: 'pitArea'})])
        const first = detectPitStops(
            {now: 1, snapshot: clear, events: []},
            createPitState(),
            DEFAULT_CONFIG
        )
        const second = detectPitStops(
            {now: 2, snapshot: inPit, events: []},
            first.state,
            DEFAULT_CONFIG
        )

        expect(second.pois).toEqual([])
    })
})

describe('detectEventPois', () => {
    function detect(events: ReturnType<typeof event>[], now = 10) {
        return detectEventPois(
            {now, snapshot: snapshot(GRID), events},
            createEventPoiState(),
            DEFAULT_CONFIG
        )
    }

    it('reports time penalties, drive throughs, stop go and disqualifications for any car', () => {
        for (const type of [0, 1, 4, 6]) {
            const result = detect([event(10, 'penalty', [7], {penaltyType: type, time: 5})])

            expect(result.pois[0]).toMatchObject({kind: 'penalty', tier: 2, car: 7})
        }
    })

    it('ignores warnings and lap invalidations', () => {
        expect(detect([event(10, 'penalty', [1], {penaltyType: 5})]).pois).toEqual([])
        expect(detect([event(10, 'penalty', [1], {penaltyType: 10})]).pois).toEqual([])
    })

    it('reports a retirement for any car', () => {
        const result = detect([event(10, 'retirement', [7], {reason: 1})])

        expect(result.pois[0]).toMatchObject({kind: 'retirement', car: 7})
    })

    it('reports a fastest lap only for the top five', () => {
        expect(detect([event(10, 'fastestLap', [1])]).pois[0]).toMatchObject({
            kind: 'fastestLap',
            car: 1
        })
        expect(detect([event(10, 'fastestLap', [7])]).pois).toEqual([])
    })

    it('expires the poi after its duration', () => {
        const first = detect([event(10, 'fastestLap', [1])])
        const later = detectEventPois(
            {now: 15.5, snapshot: snapshot(GRID), events: []},
            first.state,
            DEFAULT_CONFIG
        )

        expect(later.pois).toEqual([])
    })
})

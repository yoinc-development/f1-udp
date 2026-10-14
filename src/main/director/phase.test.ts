import {describe, expect, it} from 'vitest'
import {car, snapshot} from './fixtures'
import {isNeutral, phaseOf} from './phase'

const CARS = [car(0, 1), car(1, 2)]

describe('phaseOf', () => {
    it('is inactive without a session, cars or a race', () => {
        expect(phaseOf({available: true, session: null, cars: CARS})).toBe('inactive')
        expect(phaseOf(snapshot([]))).toBe('inactive')
        expect(phaseOf(snapshot(CARS, {isRace: false}))).toBe('inactive')
        expect(phaseOf({available: false, session: null, cars: []})).toBe('inactive')
    })

    it('is lap 1 while the leader is on the first lap', () => {
        expect(phaseOf(snapshot(CARS, {currentLap: 1}))).toBe('lap1')
        expect(phaseOf(snapshot(CARS, {currentLap: 0}))).toBe('lap1')
    })

    it('is the last lap when the leader is on the final lap of a race with a lap count', () => {
        expect(phaseOf(snapshot(CARS, {currentLap: 5, totalLaps: 5}))).toBe('lastLap')
        expect(phaseOf(snapshot(CARS, {currentLap: 4, totalLaps: 5}))).toBe('race')
    })

    it('has no last lap in a race without a lap count', () => {
        expect(phaseOf(snapshot(CARS, {currentLap: 30, totalLaps: 0}))).toBe('race')
    })
})

describe('isNeutral', () => {
    it('is neutral under a full or virtual safety car and after a red flag', () => {
        expect(isNeutral(snapshot(CARS, {safetyCar: 'full'}), false)).toBe(true)
        expect(isNeutral(snapshot(CARS, {safetyCar: 'virtual'}), false)).toBe(true)
        expect(isNeutral(snapshot(CARS), true)).toBe(true)
    })

    it('is not neutral on a formation lap or in normal racing', () => {
        expect(isNeutral(snapshot(CARS, {safetyCar: 'formation'}), false)).toBe(false)
        expect(isNeutral(snapshot(CARS), false)).toBe(false)
    })
})

import {describe, expect, it} from 'vitest'
import type {StructValue} from '../protocol/reader'
import {WorldState} from './world'

const SESSION_A = 111n
const SESSION_B = 222n

function header(sessionUID: bigint, playerCarIndex = 0): StructValue {
    return {sessionUID, playerCarIndex}
}

function lapPacket(positions: Record<number, number>): StructValue {
    const lapData: StructValue[] = Array.from({length: 22}, () => ({resultStatus: 0}))
    for (const [carIndex, position] of Object.entries(positions)) {
        lapData[Number(carIndex)] = {resultStatus: 2, carPosition: position, currentLapNum: 3}
    }
    return {lapData}
}

describe('WorldState', () => {
    it('reports no world state for versions without an adapter', () => {
        const world = new WorldState()

        expect(world.snapshot('f1-26')).toEqual({available: false, session: null, cars: []})
        expect(world.snapshot('f1-2021').available).toBe(false)
    })

    it('ignores packets of versions without an adapter', () => {
        const world = new WorldState()

        world.apply('f1-26', header(SESSION_A), 2, lapPacket({0: 1}))

        expect(world.snapshot('f1-25').cars).toEqual([])
    })

    it('is available but empty for F1 25 before any packet', () => {
        const world = new WorldState()

        expect(world.snapshot('f1-25')).toEqual({available: true, session: null, cars: []})
    })

    it('clears the state when the session uid changes', () => {
        const world = new WorldState()
        world.apply('f1-25', header(SESSION_A), 2, lapPacket({0: 1, 1: 2}))
        expect(world.snapshot('f1-25').cars).toHaveLength(2)

        world.apply('f1-25', header(SESSION_B), 2, lapPacket({4: 1}))

        const cars = world.snapshot('f1-25').cars
        expect(cars.map((car) => car.carIndex)).toEqual([4])
    })

    it('keeps the state while the session uid stays the same', () => {
        const world = new WorldState()
        world.apply('f1-25', header(SESSION_A), 2, lapPacket({0: 1}))
        world.apply('f1-25', header(SESSION_A), 2, lapPacket({0: 1, 1: 2}))

        expect(world.snapshot('f1-25').cars).toHaveLength(2)
    })

    it('clears the state on reset', () => {
        const world = new WorldState()
        world.apply('f1-25', header(SESSION_A), 2, lapPacket({0: 1}))

        world.reset()

        expect(world.snapshot('f1-25').cars).toEqual([])
    })
})

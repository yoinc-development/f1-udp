import {beforeEach, describe, expect, it} from 'vitest'
import type {StructValue} from '../protocol/reader'
import {WorldState} from './world'

const UID = 987654321n

function header(playerCarIndex = 0): StructValue {
    return {sessionUID: UID, playerCarIndex}
}

function fill(
    entries: Record<number, StructValue>,
    blank: StructValue,
    length = 22
): StructValue[] {
    return Array.from({length}, (_, index) => entries[index] ?? blank)
}

function lap(overrides: StructValue): StructValue {
    return {
        resultStatus: 2,
        carPosition: 1,
        currentLapNum: 5,
        lastLapTimeInMS: 91234,
        deltaToRaceLeaderMSPart: 0,
        deltaToRaceLeaderMinutesPart: 0,
        deltaToCarInFrontMSPart: 0,
        deltaToCarInFrontMinutesPart: 0,
        pitStatus: 0,
        numPitStops: 0,
        penalties: 0,
        totalWarnings: 0,
        ...overrides
    }
}

describe('F1 25 world state', () => {
    let world: WorldState

    beforeEach(() => {
        world = new WorldState()
    })

    it('builds cars from lap data sorted by position and combines the split times', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill(
                {
                    3: lap({
                        carPosition: 2,
                        deltaToRaceLeaderMSPart: 5250,
                        deltaToRaceLeaderMinutesPart: 1,
                        deltaToCarInFrontMSPart: 850,
                        deltaToCarInFrontMinutesPart: 0
                    }),
                    7: lap({carPosition: 1})
                },
                {resultStatus: 0}
            )
        })

        const {cars} = world.snapshot('f1-25')

        expect(cars.map((car) => car.carIndex)).toEqual([7, 3])
        expect(cars[1]).toMatchObject({
            position: 2,
            lap: 5,
            gapToLeaderMs: 65250,
            intervalMs: 850,
            lastLapMs: 91234,
            status: 'active'
        })
    })

    it('leaves out invalid and inactive cars', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill(
                {0: lap({carPosition: 1}), 1: lap({carPosition: 2, resultStatus: 1})},
                {resultStatus: 0}
            )
        })

        expect(world.snapshot('f1-25').cars.map((car) => car.carIndex)).toEqual([0])
    })

    it('maps the result status, pit status, penalties and warnings', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill(
                {
                    0: lap({
                        resultStatus: 4,
                        pitStatus: 2,
                        numPitStops: 2,
                        penalties: 5,
                        totalWarnings: 1
                    })
                },
                {resultStatus: 0}
            )
        })

        expect(world.snapshot('f1-25').cars[0]).toMatchObject({
            status: 'dnf',
            pitStatus: 'pitArea',
            pitStops: 2,
            penaltySeconds: 5,
            warnings: 1
        })
    })

    it('adds names, numbers and team names from participants for active cars only', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill({0: lap({carPosition: 1}), 1: lap({carPosition: 2})}, {resultStatus: 0})
        })
        world.apply('f1-25', header(), 4, {
            numActiveCars: 1,
            participants: fill(
                {
                    0: {name: 'HAM', raceNumber: 44, teamId: 1},
                    1: {name: 'ALO', raceNumber: 14, teamId: 4}
                },
                {name: '', raceNumber: 0, teamId: 255}
            )
        })

        const {cars} = world.snapshot('f1-25')

        expect(cars[0]).toMatchObject({name: 'HAM', raceNumber: 44, team: 'Ferrari'})
        expect(cars[1]).toMatchObject({name: null, team: null})
    })

    it('gives no team when the team id is 255', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill({0: lap({carPosition: 1})}, {resultStatus: 0})
        })
        world.apply('f1-25', header(), 4, {
            numActiveCars: 1,
            participants: fill({0: {name: 'ME', raceNumber: 1, teamId: 255}}, {})
        })

        expect(world.snapshot('f1-25').cars[0]?.team).toBeNull()
    })

    it('maps the visual tyre compound and age from car status', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill(
                {0: lap({carPosition: 1}), 1: lap({carPosition: 2}), 2: lap({carPosition: 3})},
                {resultStatus: 0}
            )
        })
        world.apply('f1-25', header(), 7, {
            carStatusData: fill(
                {
                    0: {visualTyreCompound: 16, tyresAgeLaps: 4},
                    1: {visualTyreCompound: 18, tyresAgeLaps: 12},
                    2: {visualTyreCompound: 8, tyresAgeLaps: 1}
                },
                {visualTyreCompound: 0, tyresAgeLaps: 0}
            )
        })

        const {cars} = world.snapshot('f1-25')

        expect(cars.map((car) => [car.tyre, car.tyreAge])).toEqual([
            ['soft', 4],
            ['hard', 12],
            ['wet', 1]
        ])
    })

    it('takes the higher front wing damage from car damage', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill({0: lap({carPosition: 1})}, {resultStatus: 0})
        })
        world.apply('f1-25', header(), 10, {
            carDamageData: fill(
                {0: {frontLeftWingDamage: 10, frontRightWingDamage: 35}},
                {frontLeftWingDamage: 0, frontRightWingDamage: 0}
            )
        })

        expect(world.snapshot('f1-25').cars[0]?.frontWingDamage).toBe(35)
    })

    it('takes the best lap from the session history', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill({2: lap({carPosition: 1})}, {resultStatus: 0})
        })
        world.apply('f1-25', header(), 11, {
            carIdx: 2,
            bestLapTimeLapNum: 2,
            lapHistoryData: [{lapTimeInMS: 92000}, {lapTimeInMS: 90111}, {lapTimeInMS: 91000}]
        })

        expect(world.snapshot('f1-25').cars[0]?.bestLapMs).toBe(90111)
    })

    it('ignores a session history without a best lap', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill({2: lap({carPosition: 1})}, {resultStatus: 0})
        })
        world.apply('f1-25', header(), 11, {carIdx: 2, bestLapTimeLapNum: 0, lapHistoryData: []})

        expect(world.snapshot('f1-25').cars[0]?.bestLapMs).toBeNull()
    })

    it('builds the session with names, safety car and the leader lap', () => {
        world.apply('f1-25', header(), 2, {
            lapData: fill(
                {
                    0: lap({carPosition: 2, currentLapNum: 11}),
                    1: lap({carPosition: 1, currentLapNum: 12})
                },
                {resultStatus: 0}
            )
        })
        world.apply('f1-25', header(), 1, {
            trackId: 5,
            sessionType: 15,
            totalLaps: 58,
            safetyCarStatus: 2,
            sessionTimeLeft: 1800,
            isSpectating: 0,
            spectatorCarIndex: 255
        })

        expect(world.snapshot('f1-25').session).toEqual({
            track: 'Monaco',
            sessionType: 'Race',
            isRace: true,
            currentLap: 12,
            totalLaps: 58,
            safetyCar: 'virtual',
            timeLeftSeconds: 1800,
            spectating: false,
            focusedCarIndex: 0
        })
    })

    it('focuses the spectated car while spectating', () => {
        world.apply('f1-25', header(255), 1, {
            trackId: -1,
            sessionType: 18,
            totalLaps: 0,
            safetyCarStatus: 0,
            sessionTimeLeft: 0,
            isSpectating: 1,
            spectatorCarIndex: 9
        })

        expect(world.snapshot('f1-25').session).toMatchObject({
            track: null,
            sessionType: 'Time Trial',
            spectating: true,
            focusedCarIndex: 9
        })
    })

    it('has no focused car when spectating without a spectated car', () => {
        world.apply('f1-25', header(255), 1, {
            trackId: 0,
            sessionType: 15,
            totalLaps: 5,
            safetyCarStatus: 0,
            sessionTimeLeft: 0,
            isSpectating: 1,
            spectatorCarIndex: 255
        })

        expect(world.snapshot('f1-25').session?.focusedCarIndex).toBeNull()
    })
    it('marks race sessions only', () => {
        const session = (sessionType: number): StructValue => ({
            trackId: 0,
            sessionType,
            totalLaps: 5,
            safetyCarStatus: 0,
            sessionTimeLeft: 0,
            isSpectating: 1,
            spectatorCarIndex: 255
        })
        const isRace = (sessionType: number): boolean | undefined => {
            const state = new WorldState()
            state.apply('f1-25', header(255), 1, session(sessionType))
            return state.snapshot('f1-25').session?.isRace
        }

        expect([15, 16, 17].map(isRace)).toEqual([true, true, true])
        expect([1, 5, 10, 18].map(isRace)).toEqual([false, false, false, false])
    })

    describe('events', () => {
        const at = (sessionTime: number): StructValue => ({...header(), sessionTime})

        it('turns event packets into timestamped world events and clears them when taken', () => {
            world.apply('f1-25', at(12.5), 3, {
                eventStringCode: 'COLL',
                eventDetails: {vehicle1Idx: 3, vehicle2Idx: 7}
            })
            world.apply('f1-25', at(13), 3, {
                eventStringCode: 'PENA',
                eventDetails: {
                    penaltyType: 4,
                    infringementType: 7,
                    vehicleIdx: 5,
                    otherVehicleIdx: 255,
                    time: 5,
                    lapNum: 2
                }
            })

            expect(world.takeEvents()).toEqual([
                {time: 12.5, kind: 'collision', cars: [3, 7], details: {}},
                {
                    time: 13,
                    kind: 'penalty',
                    cars: [5],
                    details: {
                        penaltyType: 4,
                        infringementType: 7,
                        otherVehicleIdx: 255,
                        time: 5,
                        lapNum: 2
                    }
                }
            ])
            expect(world.takeEvents()).toEqual([])
        })

        it('maps retirement, fastest lap, overtake, red flag and lights out', () => {
            const send = (code: string, eventDetails: StructValue): void =>
                world.apply('f1-25', at(1), 3, {eventStringCode: code, eventDetails})
            send('RTMT', {vehicleIdx: 4, reason: 2})
            send('FTLP', {vehicleIdx: 6, lapTime: 83.5})
            send('OVTK', {overtakingVehicleIdx: 1, beingOvertakenVehicleIdx: 2})
            send('RDFL', {})
            send('LGOT', {})

            expect(world.takeEvents().map((item) => [item.kind, item.cars, item.details])).toEqual([
                ['retirement', [4], {reason: 2}],
                ['fastestLap', [6], {lapTime: 83.5}],
                ['overtake', [1, 2], {}],
                ['redFlag', [], {}],
                ['lightsOut', [], {}]
            ])
        })

        it('ignores event codes the director does not use', () => {
            world.apply('f1-25', at(1), 3, {
                eventStringCode: 'BUTN',
                eventDetails: {buttonStatus: 1}
            })
            world.apply('f1-25', at(1), 3, {eventStringCode: 'SSTA', eventDetails: {}})

            expect(world.takeEvents()).toEqual([])
        })

        it('keeps the session time and session uid of the latest packet', () => {
            world.apply('f1-25', at(42.5), 3, {eventStringCode: 'LGOT', eventDetails: {}})

            expect(world.sessionTime).toBe(42.5)
            expect(world.sessionUid).toBe(String(UID))
        })
    })
})

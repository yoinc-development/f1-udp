import type {CarStatus, PitState, SafetyCar, Tyre, WorldCar} from '@shared/world'
import {enumLabel} from '../protocol/enums'
import {SessionType, Team, Track} from '../protocol/f1-25/appendices'
import {
    INVALID_CAR_INDEX,
    NO_TEAM_ID,
    PitStatus,
    ResultStatus,
    SafetyCarStatus,
    VisualTyreCompound
} from '../protocol/f1-25/enums'
import type {FieldValue, StructValue} from '../protocol/reader'
import type {WorldDraft} from './world'

const PACKET_SESSION = 1
const PACKET_LAP_DATA = 2
const PACKET_PARTICIPANTS = 4
const PACKET_CAR_STATUS = 7
const PACKET_CAR_DAMAGE = 10
const PACKET_SESSION_HISTORY = 11

const MINUTE_MS = 60000

const STATUS: Readonly<Record<number, CarStatus>> = {
    [ResultStatus.active]: 'active',
    [ResultStatus.finished]: 'finished',
    [ResultStatus.didNotFinish]: 'dnf',
    [ResultStatus.disqualified]: 'dsq',
    [ResultStatus.notClassified]: 'nc',
    [ResultStatus.retired]: 'retired'
}

const PIT: Readonly<Record<number, PitState>> = {
    [PitStatus.none]: 'none',
    [PitStatus.pitting]: 'pitting',
    [PitStatus.inPitArea]: 'pitArea'
}

const SAFETY_CAR: Readonly<Record<number, SafetyCar>> = {
    [SafetyCarStatus.none]: 'none',
    [SafetyCarStatus.full]: 'full',
    [SafetyCarStatus.virtual]: 'virtual',
    [SafetyCarStatus.formationLap]: 'formation'
}

const TYRE: Readonly<Record<number, Tyre>> = {
    [VisualTyreCompound.soft]: 'soft',
    [VisualTyreCompound.f2SuperSoft]: 'soft',
    [VisualTyreCompound.f2Soft]: 'soft',
    [VisualTyreCompound.medium]: 'medium',
    [VisualTyreCompound.f2Medium]: 'medium',
    [VisualTyreCompound.hard]: 'hard',
    [VisualTyreCompound.f2Hard]: 'hard',
    [VisualTyreCompound.inter]: 'inter',
    [VisualTyreCompound.wet]: 'wet',
    [VisualTyreCompound.f2Wet]: 'wet'
}

const TEAMS: Readonly<Record<number, string>> = Team
const TRACKS: Readonly<Record<number, string>> = Track

function asNumber(value: FieldValue | undefined): number {
    return Number(value ?? 0)
}

function asRecords(value: FieldValue | undefined): StructValue[] {
    return Array.isArray(value) ? (value as StructValue[]) : []
}

function splitTime(data: StructValue, name: string): number {
    return asNumber(data[`${name}MinutesPart`]) * MINUTE_MS + asNumber(data[`${name}MSPart`])
}

function humanize(label: string): string {
    const spaced = label.replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function carIndexOrNull(value: number): number | null {
    return value === INVALID_CAR_INDEX ? null : value
}

function carOf(draft: WorldDraft, carIndex: number): WorldCar {
    let car = draft.cars.get(carIndex)
    if (!car) {
        car = {
            carIndex,
            position: 0,
            raceNumber: null,
            name: null,
            team: null,
            lap: 0,
            gapToLeaderMs: null,
            intervalMs: null,
            lastLapMs: null,
            bestLapMs: null,
            tyre: null,
            tyreAge: null,
            pitStatus: 'none',
            pitStops: 0,
            penaltySeconds: 0,
            warnings: 0,
            status: 'active',
            frontWingDamage: null
        }
        draft.cars.set(carIndex, car)
    }
    return car
}

function applyLapData(data: StructValue, draft: WorldDraft): void {
    asRecords(data.lapData).forEach((lap, carIndex) => {
        const resultStatus = asNumber(lap.resultStatus)
        if (resultStatus === ResultStatus.invalid || resultStatus === ResultStatus.inactive) {
            draft.inactive.add(carIndex)
            return
        }
        draft.inactive.delete(carIndex)
        const car = carOf(draft, carIndex)
        car.position = asNumber(lap.carPosition)
        car.lap = asNumber(lap.currentLapNum)
        car.gapToLeaderMs = splitTime(lap, 'deltaToRaceLeader')
        car.intervalMs = splitTime(lap, 'deltaToCarInFront')
        car.lastLapMs = asNumber(lap.lastLapTimeInMS) || null
        car.pitStatus = PIT[asNumber(lap.pitStatus)] ?? 'none'
        car.pitStops = asNumber(lap.numPitStops)
        car.penaltySeconds = asNumber(lap.penalties)
        car.warnings = asNumber(lap.totalWarnings)
        car.status = STATUS[resultStatus] ?? 'active'
    })
}

function applyParticipants(data: StructValue, draft: WorldDraft): void {
    const active = asNumber(data.numActiveCars)
    asRecords(data.participants).forEach((participant, carIndex) => {
        if (carIndex >= active) return
        const car = carOf(draft, carIndex)
        const teamId = asNumber(participant.teamId)
        car.name = String(participant.name ?? '') || null
        car.raceNumber = asNumber(participant.raceNumber)
        car.team = teamId === NO_TEAM_ID ? null : (TEAMS[teamId] ?? null)
    })
}

function applySession(header: StructValue, data: StructValue, draft: WorldDraft): void {
    const sessionType = enumLabel(SessionType, asNumber(data.sessionType))
    draft.session = {
        track: TRACKS[asNumber(data.trackId)] ?? null,
        sessionType: sessionType ? humanize(sessionType) : null,
        totalLaps: asNumber(data.totalLaps),
        safetyCar: SAFETY_CAR[asNumber(data.safetyCarStatus)] ?? 'none',
        timeLeftSeconds: asNumber(data.sessionTimeLeft)
    }
    draft.spectating = asNumber(data.isSpectating) === 1
    draft.spectatorCarIndex = carIndexOrNull(asNumber(data.spectatorCarIndex))
    draft.playerCarIndex = carIndexOrNull(asNumber(header.playerCarIndex))
}

function applyCarStatus(data: StructValue, draft: WorldDraft): void {
    asRecords(data.carStatusData).forEach((status, carIndex) => {
        const car = carOf(draft, carIndex)
        car.tyre = TYRE[asNumber(status.visualTyreCompound)] ?? null
        car.tyreAge = asNumber(status.tyresAgeLaps)
    })
}

function applyCarDamage(data: StructValue, draft: WorldDraft): void {
    asRecords(data.carDamageData).forEach((damage, carIndex) => {
        carOf(draft, carIndex).frontWingDamage = Math.max(
            asNumber(damage.frontLeftWingDamage),
            asNumber(damage.frontRightWingDamage)
        )
    })
}

function applySessionHistory(data: StructValue, draft: WorldDraft): void {
    const bestLap = asNumber(data.bestLapTimeLapNum)
    if (bestLap < 1) return
    const lapTime = asNumber(asRecords(data.lapHistoryData)[bestLap - 1]?.lapTimeInMS)
    if (lapTime > 0) carOf(draft, asNumber(data.carIdx)).bestLapMs = lapTime
}

export function applyF125(
    packetId: number,
    header: StructValue,
    data: StructValue,
    draft: WorldDraft
): void {
    if (packetId === PACKET_LAP_DATA) applyLapData(data, draft)
    else if (packetId === PACKET_PARTICIPANTS) applyParticipants(data, draft)
    else if (packetId === PACKET_SESSION) applySession(header, data, draft)
    else if (packetId === PACKET_CAR_STATUS) applyCarStatus(data, draft)
    else if (packetId === PACKET_CAR_DAMAGE) applyCarDamage(data, draft)
    else if (packetId === PACKET_SESSION_HISTORY) applySessionHistory(data, draft)
}

import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {enumLabel, hasFlag} from '../enums'
import * as appendices from './appendices'
import * as enums from './enums'
import {EventDataDetails} from './event'

function enumObjects(module: Record<string, unknown>): [string, Record<string, unknown>][] {
    return Object.entries(module).filter(
        (entry): entry is [string, Record<string, unknown>] =>
            typeof entry[1] === 'object' && entry[1] !== null
    )
}

function eventPacket(code: string, details: number[]): Buffer {
    const buffer = Buffer.alloc(45)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(3, 6)
    buffer.writeUInt8(255, 28)
    buffer.write(code, 29, 4, 'ascii')
    buffer.set(details, 33)
    return buffer
}

describe('f1-25 enums', () => {
    it.each([...enumObjects(enums), ...enumObjects(appendices)])(
        '%s has unique values',
        (_name, enumObject) => {
            if (Object.keys(enumObject).every((key) => /^\d+$/.test(key))) return
            const values = Object.values(enumObject)
            expect(new Set(values).size).toBe(values.length)
        }
    )

    it('maps values to names', () => {
        expect(enums.ResultStatus.finished).toBe(3)
        expect(enums.Platform.unknown).toBe(255)
        expect(enums.Flag.invalid).toBe(-1)
        expect(enums.Gear.reverse).toBe(-1)
        expect(enums.MfdPanel.closed).toBe(255)
        expect(enums.PitLaneTyreSim.off).toBe(1)
        expect(enums.MpUnsafePitRelease.on).toBe(0)
        expect(enumLabel(enums.SafetyCarType, 2)).toBe('virtual')
        expect(enumLabel(enums.ActualTyreCompound, 16)).toBe('c5')
        expect(enumLabel(enums.VisualTyreCompound, 16)).toBe('soft')
        expect(enumLabel(enums.ResultReason, 99)).toBeUndefined()
    })

    it('keeps the actual and visual compounds apart for the same number', () => {
        expect(enumLabel(enums.ActualTyreCompound, 20)).toBe('c1')
        expect(enumLabel(enums.VisualTyreCompound, 20)).toBe('f2Soft')
    })

    it('reads the lap valid flags', () => {
        const flags = 0x09

        expect(hasFlag(flags, enums.LapValidFlags.lap)).toBe(true)
        expect(hasFlag(flags, enums.LapValidFlags.sector1)).toBe(false)
        expect(hasFlag(flags, enums.LapValidFlags.sector3)).toBe(true)
    })

    it('covers every event code the event schema decodes', () => {
        const codes = Object.values(enums.EventCode) as string[]

        for (const code of Object.keys(EventDataDetails)) {
            expect(codes).toContain(code)
        }
        expect(new Set(codes).size).toBe(codes.length)
    })

    it('matches decoded event values', () => {
        const safetyCar = decode(eventPacket('SCAR', [1, 0]), 'f1-25').data as {
            eventStringCode: string
            eventDetails: {safetyCarType: number; eventType: number}
        }

        expect(safetyCar.eventStringCode).toBe(enums.EventCode.safetyCar)
        expect(safetyCar.eventDetails.safetyCarType).toBe(enums.SafetyCarType.full)
        expect(safetyCar.eventDetails.eventType).toBe(enums.SafetyCarEventType.deployed)

        const retirement = decode(eventPacket('RTMT', [4, 3]), 'f1-25').data as {
            eventDetails: {vehicleIdx: number; reason: number}
        }

        expect(retirement.eventDetails.reason).toBe(enums.ResultReason.terminalDamage)
    })
})

describe('f1-25 appendices', () => {
    it.each([
        ['Team', appendices.Team, 37],
        ['Driver', appendices.Driver, 87],
        ['Track', appendices.Track, 27],
        ['Nationality', appendices.Nationality, 89],
        ['GameMode', appendices.GameMode, 12],
        ['SessionType', appendices.SessionType, 19],
        ['RuleSet', appendices.RuleSet, 4],
        ['SurfaceType', appendices.SurfaceType, 12],
        ['ButtonFlags', appendices.ButtonFlags, 32],
        ['PenaltyType', appendices.PenaltyType, 18],
        ['InfringementType', appendices.InfringementType, 55]
    ] as const)('%s has the number of entries of the spec', (_name, table, count) => {
        expect(Object.keys(table)).toHaveLength(count)
    })

    it('looks up ids in the display tables', () => {
        expect(appendices.Team[2]).toBe('Red Bull Racing')
        expect(appendices.Driver[9]).toBe('Max Verstappen')
        expect(appendices.Track[5]).toBe('Monaco')
        expect(appendices.Nationality[22]).toBe('Dutch')
        expect(appendices.Track[39]).toBe('Silverstone (Reverse)')
    })

    it('does not define the special ids', () => {
        expect(enums.NETWORK_HUMAN_DRIVER_ID in appendices.Driver).toBe(false)
        expect(enums.NO_TEAM_ID in appendices.Team).toBe(false)
        expect(enums.TRACK_ID_UNKNOWN in appendices.Track).toBe(false)
    })

    it('names the enums with the spec values', () => {
        expect(appendices.SessionType.race).toBe(15)
        expect(appendices.SessionType.timeTrial).toBe(18)
        expect(appendices.RuleSet.elimination).toBe(12)
        expect(appendices.SurfaceType.grass).toBe(7)
        expect(appendices.PenaltyType.timePenalty).toBe(4)
        expect(appendices.InfringementType.pitLaneSpeeding).toBe(17)
        expect(appendices.GameMode.timeTrial).toBe(5)
    })

    it('reads the button flags including the highest bit', () => {
        const status = appendices.ButtonFlags.crossOrA | appendices.ButtonFlags.udpAction12

        expect(hasFlag(status, appendices.ButtonFlags.crossOrA)).toBe(true)
        expect(hasFlag(status, appendices.ButtonFlags.udpAction12)).toBe(true)
        expect(hasFlag(status, appendices.ButtonFlags.triangleOrY)).toBe(false)
    })
})

import {mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {DEFAULT_CONFIG, loadDirectorConfig, mergeConfig} from './config'

let directory: string

beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'f1-udp-director-'))
})

afterEach(() => {
    rmSync(directory, {recursive: true, force: true})
})

describe('mergeConfig', () => {
    it('overrides single nested values and keeps the rest', () => {
        const merged = mergeConfig(DEFAULT_CONFIG, {switching: {minDwellSeconds: 8}})

        expect(merged.switching.minDwellSeconds).toBe(8)
        expect(merged.switching.hysteresis).toBe(DEFAULT_CONFIG.switching.hysteresis)
        expect(merged.battle).toEqual(DEFAULT_CONFIG.battle)
    })

    it('ignores values of the wrong type, negative numbers and unknown keys', () => {
        const merged = mergeConfig(DEFAULT_CONFIG, {
            switching: {minDwellSeconds: 'fast', hysteresis: -1},
            unknown: 5
        })

        expect(merged).toEqual(DEFAULT_CONFIG)
    })

    it('replaces the position weights with a list of numbers only', () => {
        expect(mergeConfig(DEFAULT_CONFIG, {positionWeights: [1, 0.5]}).positionWeights).toEqual([
            1, 0.5
        ])
        expect(mergeConfig(DEFAULT_CONFIG, {positionWeights: []}).positionWeights).toEqual(
            DEFAULT_CONFIG.positionWeights
        )
        expect(mergeConfig(DEFAULT_CONFIG, {positionWeights: ['a']}).positionWeights).toEqual(
            DEFAULT_CONFIG.positionWeights
        )
    })

    it('rejects a tick rate of zero and tiers outside 1 to 3', () => {
        const merged = mergeConfig(DEFAULT_CONFIG, {tickHz: 0, tiers: {battle: 7}})

        expect(merged.tickHz).toBe(DEFAULT_CONFIG.tickHz)
        expect(merged.tiers.battle).toBe(DEFAULT_CONFIG.tiers.battle)
    })

    it('does not change the defaults', () => {
        mergeConfig(DEFAULT_CONFIG, {tiers: {battle: 1}})

        expect(DEFAULT_CONFIG.tiers.battle).toBe(2)
    })
})

describe('loadDirectorConfig', () => {
    it('returns the defaults without a director.json', () => {
        expect(loadDirectorConfig(directory)).toEqual(DEFAULT_CONFIG)
    })

    it('applies the overrides of director.json', () => {
        writeFileSync(join(directory, 'director.json'), '{"battle": {"maxGapSeconds": 1}}')

        expect(loadDirectorConfig(directory).battle.maxGapSeconds).toBe(1)
    })

    it('falls back to the defaults for a broken file', () => {
        writeFileSync(join(directory, 'director.json'), '{not json')

        expect(loadDirectorConfig(directory)).toEqual(DEFAULT_CONFIG)
    })
})

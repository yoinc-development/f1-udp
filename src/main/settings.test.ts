import {mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {DEFAULT_SETTINGS} from '@shared/settings'
import {loadSettings, saveSettings} from './settings'

describe('settings', () => {
    let directory: string

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'f1-udp-settings-'))
    })

    afterEach(() => {
        rmSync(directory, {recursive: true, force: true})
    })

    it('returns the defaults when no file exists', () => {
        expect(loadSettings(directory)).toEqual(DEFAULT_SETTINGS)
    })

    it('merges a partial file over the defaults and ignores unknown keys', () => {
        writeFileSync(join(directory, 'settings.json'), JSON.stringify({udpPort: 4445, other: true}))
        expect(loadSettings(directory)).toEqual({...DEFAULT_SETTINGS, udpPort: 4445})
    })

    it('falls back to the defaults on broken JSON', () => {
        writeFileSync(join(directory, 'settings.json'), '{ not json')
        expect(loadSettings(directory)).toEqual(DEFAULT_SETTINGS)
    })

    it('rejects invalid values', () => {
        writeFileSync(
            join(directory, 'settings.json'),
            JSON.stringify({udpPort: 70000, gameVersion: 'f1-1999'})
        )
        expect(loadSettings(directory)).toEqual(DEFAULT_SETTINGS)
    })

    it('persists a partial update', () => {
        const saved = saveSettings(directory, {gameVersion: 'f1-2021'})
        expect(saved).toEqual({...DEFAULT_SETTINGS, gameVersion: 'f1-2021'})
        expect(loadSettings(directory)).toEqual(saved)
    })
})

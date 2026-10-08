import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {DEFAULT_SETTINGS, GAME_VERSIONS, type GameVersion, type Settings} from '@shared/settings'

const FILE_NAME = 'settings.json'

function isPort(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 65535
}

function isGameVersion(value: unknown): value is GameVersion {
    return typeof value === 'string' && (GAME_VERSIONS as readonly string[]).includes(value)
}

function merge(base: Settings, input: unknown): Settings {
    if (typeof input !== 'object' || input === null) return base
    const record = input as Record<string, unknown>
    return {
        udpPort: isPort(record.udpPort) ? record.udpPort : base.udpPort,
        gameVersion: isGameVersion(record.gameVersion) ? record.gameVersion : base.gameVersion
    }
}

export function loadSettings(directory: string): Settings {
    try {
        const raw = readFileSync(join(directory, FILE_NAME), 'utf8')
        return merge(DEFAULT_SETTINGS, JSON.parse(raw))
    } catch {
        return {...DEFAULT_SETTINGS}
    }
}

export function saveSettings(directory: string, partial: Partial<Settings>): Settings {
    const next = merge(loadSettings(directory), partial)
    mkdirSync(directory, {recursive: true})
    writeFileSync(join(directory, FILE_NAME), JSON.stringify(next, null, 2), 'utf8')
    return next
}

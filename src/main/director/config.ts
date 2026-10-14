import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import defaults from './config.json'
import type {PoiKind, Tier} from './types'

export interface DirectorConfig {
    tickHz: number
    tiers: Record<PoiKind, Tier>
    scores: Record<PoiKind, number>
    durationsSeconds: Record<
        'raceStart' | 'crash' | 'overtake' | 'pitStop' | 'penalty' | 'retirement' | 'fastestLap',
        number
    >
    positionWeights: number[]
    battle: {
        maxGapSeconds: number
        minSeconds: number
        lapOneMinCars: number
        extraCarBonus: number
    }
    crash: {windowSeconds: number; wingDamageIncrease: number; positionsLost: number}
    penalty: {types: number[]}
    switching: {
        minDwellSeconds: number
        hysteresis: number
        cooldownSeconds: number
        varietyAfterSeconds: number
        varietyFactor: number
    }
}

export const DEFAULT_CONFIG: DirectorConfig = defaults as DirectorConfig

const FILE_NAME = 'director.json'

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeValue(base: unknown, input: unknown): unknown {
    if (typeof base === 'number') return isNumber(input) ? input : base
    if (Array.isArray(base)) {
        return Array.isArray(input) && input.length > 0 && input.every(isNumber) ? input : base
    }
    if (isRecord(base)) {
        if (!isRecord(input)) return base
        return Object.fromEntries(
            Object.entries(base).map(([key, value]) => [key, mergeValue(value, input[key])])
        )
    }
    return base
}

export function mergeConfig(base: DirectorConfig, input: unknown): DirectorConfig {
    const merged = mergeValue(base, input) as DirectorConfig
    if (merged.tickHz <= 0) merged.tickHz = base.tickHz
    for (const kind of Object.keys(merged.tiers) as PoiKind[]) {
        if (![1, 2, 3].includes(merged.tiers[kind])) merged.tiers[kind] = base.tiers[kind]
    }
    return merged
}

export function loadDirectorConfig(directory: string): DirectorConfig {
    try {
        const raw = readFileSync(join(directory, FILE_NAME), 'utf8')
        return mergeConfig(DEFAULT_CONFIG, JSON.parse(raw))
    } catch {
        return DEFAULT_CONFIG
    }
}

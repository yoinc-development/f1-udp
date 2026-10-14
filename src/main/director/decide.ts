import type {WorldSnapshot} from '@shared/world'
import type {DirectorConfig} from './config'
import type {Decision, Phase, Poi, PoiKind, Tier} from './types'

interface Current {
    car: number
    since: number
    kind: PoiKind
    tier: Tier
    score: number
    reason: string
}

export interface DirectorMemory {
    current: Current | null
    left: Record<number, number>
    phase: Phase
    neutral: boolean
}

export interface DecideInput {
    now: number
    phase: Phase
    neutral: boolean
    snapshot: WorldSnapshot
    pois: Poi[]
}

export function createDirectorMemory(): DirectorMemory {
    return {current: null, left: {}, phase: 'inactive', neutral: false}
}

interface Rated {
    poi: Poi
    score: number
}

const NO_TIER = 4

function round(value: number, digits: number): number {
    const factor = 10 ** digits
    return Math.round(value * factor) / factor
}

function isAllowed(poi: Poi, input: DecideInput, config: DirectorConfig): boolean {
    if (poi.kind === 'crash') return true
    if (input.neutral || input.phase === 'lastLap') return false
    if (input.phase === 'lap1') {
        return (
            poi.kind === 'raceStart' ||
            (poi.kind === 'battle' && poi.cars.length >= config.battle.lapOneMinCars)
        )
    }
    return true
}

function rate(candidates: Poi[], now: number, memory: DirectorMemory, config: DirectorConfig) {
    const {current} = memory
    const {switching} = config
    const rated: Rated[] = []
    for (const poi of candidates) {
        const leftAt = memory.left[poi.car]
        const cooling =
            current !== null &&
            poi.car !== current.car &&
            poi.kind !== 'leader' &&
            poi.tier > 1 &&
            leftAt !== undefined &&
            now - leftAt < switching.cooldownSeconds
        if (cooling) continue
        const stale =
            current?.car === poi.car && now - current.since > switching.varietyAfterSeconds
        rated.push({poi, score: stale ? poi.score * switching.varietyFactor : poi.score})
    }
    return rated.sort((a, b) => a.poi.tier - b.poi.tier || b.score - a.score)
}

export function decide(
    input: DecideInput,
    memory: DirectorMemory,
    config: DirectorConfig
): {decision: Decision | null; memory: DirectorMemory} {
    const {now, phase, neutral, snapshot} = input
    const leader = snapshot.cars[0]
    if (phase === 'inactive' || !leader) {
        return {decision: null, memory: {...memory, current: null, phase, neutral}}
    }

    const leaderPoi: Poi = {
        kind: 'leader',
        tier: config.tiers.leader,
        car: leader.carIndex,
        cars: [leader.carIndex],
        score: config.scores.leader,
        reason: `leader ${leader.name ?? `car ${leader.carIndex}`}`
    }
    const allowed = input.pois.filter((poi) => isAllowed(poi, input, config))
    const rated = rate([...allowed, leaderPoi], now, memory, config)
    const best = rated[0]
    const {current} = memory
    const next: DirectorMemory = {...memory, phase, neutral}
    if (!best) return {decision: null, memory: next}

    const own = current ? rated.find((item) => item.poi.car === current.car) : undefined
    const ownTier = own?.poi.tier ?? NO_TIER
    const ownScore = own?.score ?? 0

    if (current && best.poi.car === current.car) {
        next.current = {...current, ...describe(best), since: current.since}
        return {decision: null, memory: next}
    }

    const rule = current
        ? switchRule(input, memory, config, best, ownTier, ownScore)
        : 'initial target'
    if (!rule) {
        if (current && own) next.current = {...current, ...describe(own)}
        return {decision: null, memory: next}
    }

    next.left = current ? {...memory.left, [current.car]: now} : memory.left
    next.current = {car: best.poi.car, since: now, ...describe(best)}
    const target = snapshot.cars.find((car) => car.carIndex === best.poi.car)
    return {
        decision: {
            t: round(now, 3),
            lap: snapshot.session?.currentLap ?? 0,
            target: {car: best.poi.car, name: target?.name ?? `car ${best.poi.car}`},
            reason: best.poi.reason,
            kind: best.poi.kind,
            tier: best.poi.tier,
            score: round(best.score, 1),
            current: current ? {car: current.car, score: round(ownScore, 1)} : null,
            rule
        },
        memory: next
    }
}

function describe(item: Rated): Pick<Current, 'kind' | 'tier' | 'score' | 'reason'> {
    return {
        kind: item.poi.kind,
        tier: item.poi.tier,
        score: item.score,
        reason: item.poi.reason
    }
}

function switchRule(
    input: DecideInput,
    memory: DirectorMemory,
    config: DirectorConfig,
    best: Rated,
    ownTier: number,
    ownScore: number
): string | null {
    const {current} = memory
    const {switching} = config
    if (!current) return 'initial target'
    if (best.poi.tier === 1 && (ownTier > 1 || best.score > ownScore)) {
        return 'tier 1 interrupt, ignores dwell and hysteresis'
    }
    const modeChanged = memory.phase !== input.phase || memory.neutral !== input.neutral
    if (input.now - current.since < switching.minDwellSeconds && !modeChanged) return null
    const dwell = modeChanged ? 'mode change' : 'min dwell'
    if (ownTier === NO_TIER) return `current target no longer of interest after ${dwell}`
    if (best.poi.tier < ownTier) return `higher tier after ${dwell}`
    if (best.poi.tier === ownTier && best.score > ownScore * (1 + switching.hysteresis)) {
        return `challenger beat current by > ${Math.round(switching.hysteresis * 100)}% after ${dwell}`
    }
    return null
}

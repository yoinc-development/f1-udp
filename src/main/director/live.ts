import type {GameVersion} from '@shared/settings'
import type {DecisionEntry} from '@shared/udp'
import type {WorldState} from '../state/world'
import type {DirectorConfig} from './config'
import {DirectorRun, tickWorld} from './run'
import type {DirectorStage} from './types'

export const MAX_LIVE_DECISIONS = 200

export class LiveDirector {
    private run: DirectorRun
    private decisions: DecisionEntry[] = []

    constructor(
        config: DirectorConfig,
        private readonly maxDecisions = MAX_LIVE_DECISIONS
    ) {
        this.run = new DirectorRun(config)
    }

    get stage(): DirectorStage {
        return this.run.stage
    }

    get current(): DecisionEntry | null {
        return this.decisions[0] ?? null
    }

    get recent(): DecisionEntry[] {
        return this.decisions
    }

    reset(config: DirectorConfig): void {
        this.run = new DirectorRun(config)
        this.decisions = []
    }

    tick(world: WorldState, gameVersion: GameVersion): void {
        const decision = tickWorld(this.run, world, gameVersion)
        if (!decision) return
        this.decisions = [decision, ...this.decisions].slice(0, this.maxDecisions)
    }
}

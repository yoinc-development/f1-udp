import type {WorldSnapshot} from '@shared/world'
import type {WorldEvent} from '../state/events'
import type {DirectorConfig} from './config'
import {createDirectorMemory, decide, type DirectorMemory} from './decide'
import {createDetectorState, detect, type DetectorState} from './detectors'
import {isNeutral, phaseOf} from './phase'
import type {Decision} from './types'

export interface TickInput {
    now: number
    sessionUid: string | null
    snapshot: WorldSnapshot
    events: WorldEvent[]
}

export class DirectorRun {
    private detectors: DetectorState = createDetectorState()
    private memory: DirectorMemory = createDirectorMemory()
    private redFlag = false
    private lastTick: number | null = null
    private sessionUid: string | null = null

    constructor(private readonly config: DirectorConfig) {}

    get period(): number {
        return 1 / this.config.tickHz
    }

    isDue(now: number): boolean {
        return this.lastTick === null || now < this.lastTick || now - this.lastTick >= this.period
    }

    tick(input: TickInput): Decision | null {
        const {now, snapshot, events} = input
        if (input.sessionUid !== this.sessionUid) this.reset(input.sessionUid)
        this.lastTick = now

        for (const event of events) {
            if (event.kind === 'redFlag') this.redFlag = true
            else if (event.kind === 'lightsOut') this.redFlag = false
        }

        const phase = phaseOf(snapshot)
        const detected = detect({now, snapshot, events}, this.detectors, this.config)
        this.detectors = detected.state
        const result = decide(
            {
                now,
                phase,
                neutral: isNeutral(snapshot, this.redFlag),
                snapshot,
                pois: detected.pois
            },
            this.memory,
            this.config
        )
        this.memory = result.memory
        return result.decision
    }

    private reset(sessionUid: string | null): void {
        this.detectors = createDetectorState()
        this.memory = createDirectorMemory()
        this.redFlag = false
        this.lastTick = null
        this.sessionUid = sessionUid
    }
}

import type {GameVersion} from '@shared/settings'
import type {SafetyCar, WorldCar, WorldSession, WorldSnapshot} from '@shared/world'
import type {StructValue} from '../protocol/reader'
import {applyF125} from './f1-25'

export type SessionInfo = Pick<
    WorldSession,
    'track' | 'sessionType' | 'totalLaps' | 'timeLeftSeconds'
> & {safetyCar: SafetyCar}

export interface WorldDraft {
    sessionUid: string | null
    playerCarIndex: number | null
    spectatorCarIndex: number | null
    spectating: boolean
    session: SessionInfo | null
    cars: Map<number, WorldCar>
    inactive: Set<number>
}

export type WorldAdapter = (
    packetId: number,
    header: StructValue,
    data: StructValue,
    draft: WorldDraft
) => void

const ADAPTERS: Partial<Record<GameVersion, WorldAdapter>> = {
    'f1-25': applyF125
}

export function createDraft(): WorldDraft {
    return {
        sessionUid: null,
        playerCarIndex: null,
        spectatorCarIndex: null,
        spectating: false,
        session: null,
        cars: new Map(),
        inactive: new Set()
    }
}

export class WorldState {
    private draft = createDraft()

    reset(): void {
        this.draft = createDraft()
    }

    apply(
        gameVersion: GameVersion,
        header: StructValue,
        packetId: number,
        data: StructValue
    ): void {
        const adapter = ADAPTERS[gameVersion]
        if (!adapter) return
        const sessionUid = String(header.sessionUID)
        if (this.draft.sessionUid !== null && this.draft.sessionUid !== sessionUid) this.reset()
        this.draft.sessionUid = sessionUid
        adapter(packetId, header, data, this.draft)
    }

    snapshot(gameVersion: GameVersion): WorldSnapshot {
        if (!ADAPTERS[gameVersion]) return {available: false, session: null, cars: []}
        const {draft} = this
        const cars = [...draft.cars.values()]
            .filter((car) => car.position > 0 && !draft.inactive.has(car.carIndex))
            .sort((a, b) => a.position - b.position)
        const session = draft.session && {
            ...draft.session,
            currentLap: cars[0]?.lap ?? 0,
            spectating: draft.spectating,
            focusedCarIndex: draft.spectating ? draft.spectatorCarIndex : draft.playerCarIndex
        }
        return {available: true, session, cars}
    }
}

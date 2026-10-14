import type {WorldSnapshot} from '@shared/world'
import type {Phase} from './types'

export function phaseOf(snapshot: WorldSnapshot): Phase {
    const {session, cars} = snapshot
    if (!snapshot.available || !session || !session.isRace || cars.length === 0) return 'inactive'
    const lap = session.currentLap
    if (lap <= 1) return 'lap1'
    if (session.totalLaps > 0 && lap >= session.totalLaps) return 'lastLap'
    return 'race'
}

export function isNeutral(snapshot: WorldSnapshot, redFlag: boolean): boolean {
    const safetyCar = snapshot.session?.safetyCar
    return redFlag || safetyCar === 'full' || safetyCar === 'virtual'
}

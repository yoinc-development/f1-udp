import type {DirectorConfig} from '../config'
import type {DetectorInput, Poi} from '../types'
import {createBattleState, detectBattles, type BattleState} from './battle'
import {createEventPoiState, detectEventPois, type EventPoiState} from './events'
import {createIncidentState, detectIncidents, type IncidentState} from './incident'
import {createOvertakeState, detectOvertakes, type OvertakeState} from './overtake'
import {createPitState, detectPitStops, type PitState} from './pit'

export interface DetectorState {
    battle: BattleState
    incident: IncidentState
    overtake: OvertakeState
    pit: PitState
    events: EventPoiState
}

export function createDetectorState(): DetectorState {
    return {
        battle: createBattleState(),
        incident: createIncidentState(),
        overtake: createOvertakeState(),
        pit: createPitState(),
        events: createEventPoiState()
    }
}

export function detect(
    input: DetectorInput,
    state: DetectorState,
    config: DirectorConfig
): {pois: Poi[]; state: DetectorState} {
    const battle = detectBattles(input, state.battle, config)
    const incident = detectIncidents(input, state.incident, config)
    const overtake = detectOvertakes(input, state.overtake, config)
    const pit = detectPitStops(input, state.pit, config)
    const events = detectEventPois(input, state.events, config)
    return {
        pois: [...incident.pois, ...battle.pois, ...overtake.pois, ...pit.pois, ...events.pois],
        state: {
            battle: battle.state,
            incident: incident.state,
            overtake: overtake.state,
            pit: pit.state,
            events: events.state
        }
    }
}

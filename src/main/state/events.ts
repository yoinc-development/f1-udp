export type WorldEventKind =
    | 'collision'
    | 'retirement'
    | 'penalty'
    | 'fastestLap'
    | 'overtake'
    | 'redFlag'
    | 'lightsOut'
    | 'sessionEnded'

export interface WorldEvent {
    time: number
    kind: WorldEventKind
    cars: number[]
    details: Record<string, number>
}

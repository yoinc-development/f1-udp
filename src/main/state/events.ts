export type WorldEventKind =
    'collision' | 'retirement' | 'penalty' | 'fastestLap' | 'overtake' | 'redFlag' | 'lightsOut'

export interface WorldEvent {
    time: number
    kind: WorldEventKind
    cars: number[]
    details: Record<string, number>
}

import type {WorldCar, WorldSnapshot} from '@shared/world'
import type {DirectorConfig} from '../config'
import type {Poi, Timed} from '../types'

export function carName(snapshot: WorldSnapshot, carIndex: number): string {
    return snapshot.cars.find((car) => car.carIndex === carIndex)?.name ?? `car ${carIndex}`
}

export function findCar(snapshot: WorldSnapshot, carIndex: number): WorldCar | undefined {
    return snapshot.cars.find((car) => car.carIndex === carIndex)
}

export function positionWeight(config: DirectorConfig, position: number): number {
    return config.positionWeights[position - 1] ?? 0
}

export function stillActive(list: Timed[], now: number): Timed[] {
    return list.filter((entry) => entry.until > now)
}

export function poisOf(list: Timed[]): Poi[] {
    return list.map((entry) => entry.poi)
}

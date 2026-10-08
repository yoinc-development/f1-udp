export const GAME_VERSIONS = ['f1-25', 'f1-2021'] as const

export type GameVersion = (typeof GAME_VERSIONS)[number]

export interface Settings {
    udpPort: number
    gameVersion: GameVersion
}

export const DEFAULT_SETTINGS: Settings = {
    udpPort: 20777,
    gameVersion: 'f1-25'
}

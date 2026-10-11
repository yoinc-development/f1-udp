import type {GameVersion, Settings} from './settings'
import type {DecodedEntry, DirectorStartResult, UdpSnapshot} from './udp'

export interface Api {
    settings: {
        get: () => Promise<Settings>
        set: (partial: Partial<Settings>) => Promise<Settings>
    }
    udp: {
        snapshot: () => Promise<UdpSnapshot>
        start: (port: number, gameVersion: GameVersion) => Promise<Settings>
        stop: () => Promise<void>
        decoded: (packetId: number) => Promise<DecodedEntry | null>
        onSnapshot: (callback: (snapshot: UdpSnapshot) => void) => () => void
    }
    director: {
        start: (
            port: number,
            gameVersion: GameVersion
        ) => Promise<DirectorStartResult & {settings: Settings}>
        stop: () => Promise<void>
    }
}

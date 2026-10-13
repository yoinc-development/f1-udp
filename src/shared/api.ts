import type {GameVersion, Settings} from './settings'
import type {DecodedEntry, DirectorStartResult, ReplaySpeed, UdpSnapshot} from './udp'

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
    recording: {
        start: () => Promise<void>
        stop: () => Promise<void>
        openFolder: () => Promise<void>
    }
    replay: {
        open: (speed: ReplaySpeed) => Promise<void>
        pause: () => Promise<void>
        resume: () => Promise<void>
        speed: (speed: ReplaySpeed) => Promise<void>
        stop: () => Promise<void>
    }
}

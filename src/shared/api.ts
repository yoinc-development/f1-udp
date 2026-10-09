import type {GameVersion, Settings} from './settings'
import type {UdpSnapshot} from './udp'

export interface Api {
    settings: {
        get: () => Promise<Settings>
        set: (partial: Partial<Settings>) => Promise<Settings>
    }
    udp: {
        snapshot: () => Promise<UdpSnapshot>
        start: (port: number, gameVersion: GameVersion) => Promise<Settings>
        stop: () => Promise<void>
        onSnapshot: (callback: (snapshot: UdpSnapshot) => void) => () => void
    }
}

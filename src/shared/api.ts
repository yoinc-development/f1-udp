import type {Settings} from './settings'
import type {UdpSnapshot} from './udp'

export interface Api {
    settings: {
        get: () => Promise<Settings>
        set: (partial: Partial<Settings>) => Promise<Settings>
    }
    udp: {
        snapshot: () => Promise<UdpSnapshot>
        onSnapshot: (callback: (snapshot: UdpSnapshot) => void) => () => void
    }
}

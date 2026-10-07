import type {Settings} from './settings'

export interface Api {
    settings: {
        get: () => Promise<Settings>
        set: (partial: Partial<Settings>) => Promise<Settings>
    }
}

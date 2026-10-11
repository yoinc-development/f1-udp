import type {GameVersion} from '@shared/settings'
import type {DirectorStartResult, DirectorState, ReceiverStatus} from '@shared/udp'

export interface SessionHost {
    startReceiver: (port: number, gameVersion: GameVersion) => Promise<ReceiverStatus>
    stopReceiver: () => void
    registerShortcut: (accelerator: string, callback: () => void) => boolean
    unregisterShortcut: (accelerator: string) => void
    minimizeWindow: () => void
    restoreWindow: () => void
    onChange: () => void
}

export interface SessionOptions {
    port: number
    gameVersion: GameVersion
    hotkey: string
}

export class DirectorSession {
    private hotkey: string | null = null

    constructor(private readonly host: SessionHost) {}

    get state(): DirectorState {
        return {locked: this.hotkey !== null, hotkey: this.hotkey}
    }

    async start(options: SessionOptions): Promise<DirectorStartResult> {
        if (this.hotkey !== null) return {started: true, error: null}
        const {port, gameVersion, hotkey} = options

        const registered = this.host.registerShortcut(hotkey, () => this.stop())
        if (!registered) {
            return {started: false, error: `The stop key ${hotkey} could not be registered`}
        }

        const status = await this.host.startReceiver(port, gameVersion)
        if (status.state !== 'listening') {
            this.host.unregisterShortcut(hotkey)
            return {
                started: false,
                error: status.error ?? `Could not listen on UDP port ${port}`
            }
        }

        this.hotkey = hotkey
        this.host.minimizeWindow()
        this.host.onChange()
        return {started: true, error: null}
    }

    stop(): void {
        if (this.hotkey === null) return
        this.release()
        this.host.stopReceiver()
        this.host.onChange()
    }

    sync(receiverState: ReceiverStatus['state']): void {
        if (this.hotkey === null || receiverState === 'listening') return
        this.release()
    }

    private release(): void {
        const hotkey = this.hotkey
        if (hotkey === null) return
        this.hotkey = null
        this.host.unregisterShortcut(hotkey)
        this.host.restoreWindow()
    }
}

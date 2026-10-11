import {useCallback, useEffect, useState} from 'react'
import {DEFAULT_SETTINGS, type GameVersion} from '@shared/settings'
import type {ReceiverStatus, UdpSnapshot} from '@shared/udp'

export interface StatusLine {
    tone: 'ok' | 'idle' | 'error'
    text: string
}

export function describeStatus(status: ReceiverStatus): StatusLine {
    if (status.state === 'listening') {
        return {tone: 'ok', text: `Listening on UDP port ${status.port}`}
    }
    if (status.state === 'error') {
        return {tone: 'error', text: `Receiver error on port ${status.port}: ${status.error}`}
    }
    return {
        tone: status.reason ? 'error' : 'idle',
        text: status.reason ? `Receiver stopped: ${status.reason}` : 'Receiver stopped'
    }
}

export function useReceiver() {
    const [snapshot, setSnapshot] = useState<UdpSnapshot | null>(null)
    const [portInput, setPortInput] = useState(String(DEFAULT_SETTINGS.udpPort))
    const [version, setVersion] = useState<GameVersion>(DEFAULT_SETTINGS.gameVersion)
    const [hotkey, setHotkey] = useState(DEFAULT_SETTINGS.stopHotkey)
    const [directorError, setDirectorError] = useState<string | null>(null)
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        void window.api.udp.snapshot().then(setSnapshot)
        void window.api.settings.get().then((settings) => {
            setPortInput(String(settings.udpPort))
            setVersion(settings.gameVersion)
            setHotkey(settings.stopHotkey)
        })
        return window.api.udp.onSnapshot((next) => {
            setSnapshot(next)
            setNow(Date.now())
        })
    }, [])

    const start = useCallback((): void => {
        void window.api.udp.start(Number(portInput), version).then((settings) => {
            setPortInput(String(settings.udpPort))
            setVersion(settings.gameVersion)
        })
    }, [portInput, version])

    const stop = useCallback((): void => {
        void window.api.udp.stop()
    }, [])

    const startDirector = useCallback((): void => {
        setDirectorError(null)
        void window.api.director.start(Number(portInput), version).then(({settings, error}) => {
            setPortInput(String(settings.udpPort))
            setVersion(settings.gameVersion)
            setHotkey(settings.stopHotkey)
            setDirectorError(error)
        })
    }, [portInput, version])

    const stopDirector = useCallback((): void => {
        void window.api.director.stop()
    }, [])

    return {
        snapshot,
        now,
        portInput,
        setPortInput,
        version,
        setVersion,
        hotkey,
        directorError,
        start,
        stop,
        startDirector,
        stopDirector
    }
}

export type Receiver = ReturnType<typeof useReceiver>

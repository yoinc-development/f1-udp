import {useCallback, useEffect, useState} from 'react'
import {DEFAULT_SETTINGS, type GameVersion} from '@shared/settings'
import type {ReceiverStatus, ReplaySpeed, ReplayStatus, UdpSnapshot} from '@shared/udp'

export interface StatusLine {
    tone: 'ok' | 'idle' | 'error'
    text: string
}

export function describeStatus(status: ReceiverStatus, replay: ReplayStatus): StatusLine {
    if (replay.state === 'playing' || replay.state === 'paused') {
        return {tone: 'ok', text: `Replaying ${replay.file}`}
    }
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
    const [replaySpeed, setReplaySpeed] = useState<ReplaySpeed>(1)
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

    const startRecording = useCallback((): void => {
        void window.api.recording.start()
    }, [])

    const stopRecording = useCallback((): void => {
        void window.api.recording.stop()
    }, [])

    const openRecordings = useCallback((): void => {
        void window.api.recording.openFolder()
    }, [])

    const openReplay = useCallback((): void => {
        void window.api.replay.open(replaySpeed)
    }, [replaySpeed])

    const changeReplaySpeed = useCallback((next: ReplaySpeed): void => {
        setReplaySpeed(next)
        void window.api.replay.speed(next)
    }, [])

    const pauseReplay = useCallback((): void => {
        void window.api.replay.pause()
    }, [])

    const resumeReplay = useCallback((): void => {
        void window.api.replay.resume()
    }, [])

    const stopReplay = useCallback((): void => {
        void window.api.replay.stop()
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
        stopDirector,
        replaySpeed,
        startRecording,
        stopRecording,
        openRecordings,
        openReplay,
        changeReplaySpeed,
        pauseReplay,
        resumeReplay,
        stopReplay
    }
}

export type Receiver = ReturnType<typeof useReceiver>

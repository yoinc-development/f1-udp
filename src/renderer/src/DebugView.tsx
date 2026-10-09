import {useEffect, useState} from 'react'
import {DEFAULT_SETTINGS, GAME_VERSIONS, type GameVersion} from '@shared/settings'
import type {UdpSnapshot} from '@shared/udp'
import RecentPanel from './RecentPanel'

const cell = {padding: '0.25rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap'} as const

function formatAge(lastReceivedAt: number, now: number): string {
    return `${((now - lastReceivedAt) / 1000).toFixed(1)} s ago`
}

export default function DebugView() {
    const [snapshot, setSnapshot] = useState<UdpSnapshot | null>(null)
    const [portInput, setPortInput] = useState('')
    const [version, setVersion] = useState<GameVersion>(DEFAULT_SETTINGS.gameVersion)
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        void window.api.udp.snapshot().then(setSnapshot)
        void window.api.settings.get().then((settings) => {
            setPortInput(String(settings.udpPort))
            setVersion(settings.gameVersion)
        })
        return window.api.udp.onSnapshot((next) => {
            setSnapshot(next)
            setNow(Date.now())
        })
    }, [])

    const start = (): void => {
        void window.api.udp.start(Number(portInput), version).then((settings) => {
            setPortInput(String(settings.udpPort))
            setVersion(settings.gameVersion)
        })
    }

    const stop = (): void => {
        void window.api.udp.stop()
    }

    if (!snapshot) return <p>loading...</p>

    const {status} = snapshot
    const listening = status.state === 'listening'

    return (
        <section>
            <p>
                {status.state === 'listening' && `Listening on UDP port ${status.port}`}
                {status.state === 'stopped' &&
                    (status.reason ? `Receiver stopped: ${status.reason}` : 'Receiver stopped')}
                {status.state === 'error' &&
                    `Receiver error on port ${status.port}: ${status.error}`}
                {' | '}
                {snapshot.totalPackets} packets received
            </p>
            <p>
                <label>
                    UDP port{' '}
                    <input
                        type="number"
                        min={1}
                        max={65535}
                        value={portInput}
                        disabled={listening}
                        onChange={(event) => setPortInput(event.target.value)}
                    />
                </label>{' '}
                <label>
                    Game{' '}
                    <select
                        value={version}
                        disabled={listening}
                        onChange={(event) => setVersion(event.target.value as GameVersion)}
                    >
                        {GAME_VERSIONS.map((gameVersion) => (
                            <option key={gameVersion} value={gameVersion}>
                                {gameVersion}
                            </option>
                        ))}
                    </select>
                </label>{' '}
                <button onClick={start} disabled={listening}>
                    Start
                </button>{' '}
                <button onClick={stop} disabled={!listening}>
                    Stop
                </button>
            </p>
            <table style={{borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                <thead>
                    <tr>
                        <th style={cell}>Format</th>
                        <th style={cell}>Packet id</th>
                        <th style={cell}>Size</th>
                        <th style={cell}>Count</th>
                        <th style={cell}>Per second</th>
                        <th style={cell}>Last</th>
                        <th style={cell}>First bytes</th>
                    </tr>
                </thead>
                <tbody>
                    {snapshot.packets.map((packet) => (
                        <tr key={`${packet.packetFormat}:${packet.packetId}:${packet.size}`}>
                            <td style={cell}>{packet.packetFormat ?? 'too short'}</td>
                            <td style={cell}>{packet.packetId ?? '-'}</td>
                            <td style={cell}>{packet.size}</td>
                            <td style={cell}>{packet.count}</td>
                            <td style={cell}>{packet.perSecond}</td>
                            <td style={cell}>{formatAge(packet.lastReceivedAt, now)}</td>
                            <td style={{...cell, fontFamily: 'monospace'}}>{packet.preview}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {snapshot.packets.length === 0 && <p>No packets received yet.</p>}
            <RecentPanel recent={snapshot.recent} />
        </section>
    )
}

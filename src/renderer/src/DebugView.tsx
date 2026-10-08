import {useEffect, useState} from 'react'
import type {UdpSnapshot} from '@shared/udp'

const cell = {padding: '0.25rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap'} as const

function formatAge(lastReceivedAt: number, now: number): string {
    return `${((now - lastReceivedAt) / 1000).toFixed(1)} s ago`
}

export default function DebugView() {
    const [snapshot, setSnapshot] = useState<UdpSnapshot | null>(null)
    const [portInput, setPortInput] = useState('')
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        void window.api.udp.snapshot().then(setSnapshot)
        void window.api.settings.get().then((settings) => setPortInput(String(settings.udpPort)))
        return window.api.udp.onSnapshot((next) => {
            setSnapshot(next)
            setNow(Date.now())
        })
    }, [])

    const applyPort = (): void => {
        void window.api.settings.set({udpPort: Number(portInput)}).then((settings) => {
            setPortInput(String(settings.udpPort))
        })
    }

    if (!snapshot) return <p>loading...</p>

    const {status} = snapshot

    return (
        <section>
            <p>
                {status.state === 'listening' && `Listening on UDP port ${status.port}`}
                {status.state === 'stopped' && 'Receiver stopped'}
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
                        onChange={(event) => setPortInput(event.target.value)}
                    />
                </label>{' '}
                <button onClick={applyPort}>Apply</button>
            </p>
            <table style={{borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                <thead>
                    <tr>
                        <th style={cell}>Format</th>
                        <th style={cell}>Size</th>
                        <th style={cell}>Count</th>
                        <th style={cell}>Per second</th>
                        <th style={cell}>Last</th>
                        <th style={cell}>First bytes</th>
                    </tr>
                </thead>
                <tbody>
                    {snapshot.packets.map((packet) => (
                        <tr key={`${packet.packetFormat}:${packet.size}`}>
                            <td style={cell}>{packet.packetFormat ?? 'too short'}</td>
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
        </section>
    )
}

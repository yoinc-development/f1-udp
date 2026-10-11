import {useEffect, useState} from 'react'
import type {DecodedEntry} from '@shared/udp'
import Button from './components/Button'
import controls from './components/controls.module.css'
import Panel, {Empty} from './components/Panel'
import styles from './DecodedPanel.module.css'

const PACKET_NAMES: Readonly<Record<number, string>> = {
    0: 'Motion',
    1: 'Session',
    2: 'Lap Data',
    3: 'Event',
    4: 'Participants',
    5: 'Car Setups',
    6: 'Car Telemetry',
    7: 'Car Status',
    8: 'Final Classification',
    9: 'Lobby Info',
    10: 'Car Damage',
    11: 'Session History',
    12: 'Tyre Sets',
    13: 'Motion Ex',
    14: 'Time Trial',
    15: 'Lap Positions'
}

interface Props {
    packetIds: number[]
    updatedAt: number
}

function label(packetId: number): string {
    const name = PACKET_NAMES[packetId]
    return name ? `${packetId} - ${name}` : String(packetId)
}

export default function DecodedPanel({packetIds, updatedAt}: Props) {
    const [selected, setSelected] = useState<number | null>(null)
    const [paused, setPaused] = useState(false)
    const [entry, setEntry] = useState<DecodedEntry | null>(null)

    const current = selected !== null && packetIds.includes(selected) ? selected : packetIds[0]

    useEffect(() => {
        if (paused || current === undefined) return
        let cancelled = false
        void window.api.udp.decoded(current).then((next) => {
            if (!cancelled) setEntry(next)
        })
        return () => {
            cancelled = true
        }
    }, [current, paused, updatedAt])

    const actions =
        current === undefined ? null : (
            <>
                {entry && <span>received {new Date(entry.receivedAt).toLocaleTimeString()}</span>}
                <label className={controls.field}>
                    Packet
                    <select
                        className={controls.select}
                        value={current}
                        onChange={(event) => {
                            setSelected(Number(event.target.value))
                            setEntry(null)
                        }}
                    >
                        {packetIds.map((id) => (
                            <option key={id} value={id}>
                                {label(id)}
                            </option>
                        ))}
                    </select>
                </label>
                <Button onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</Button>
            </>
        )

    return (
        <Panel title="Latest decoded packet" actions={actions}>
            {current === undefined ? (
                <Empty>No packets decoded yet.</Empty>
            ) : (
                <>
                    {entry?.error && <p className={styles.error}>Decode error: {entry.error}</p>}
                    {entry && (
                        <pre className={styles.json}>
                            {JSON.stringify({header: entry.header, data: entry.data}, null, 2)}
                        </pre>
                    )}
                </>
            )}
        </Panel>
    )
}

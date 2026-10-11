import {useState} from 'react'
import type {RecentPacket} from '@shared/udp'
import Button from './components/Button'
import controls from './components/controls.module.css'
import Panel, {Empty} from './components/Panel'
import table from './components/table.module.css'

function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return `${date.toLocaleTimeString([], {hour12: false})}.${String(date.getMilliseconds()).padStart(3, '0')}`
}

interface Props {
    recent: RecentPacket[]
}

export default function RecentPanel({recent}: Props) {
    const [frozen, setFrozen] = useState<RecentPacket[] | null>(null)
    const [filter, setFilter] = useState('all')

    const entries = frozen ?? recent
    const packetIds = [...new Set(entries.map((entry) => entry.packetId))].sort(
        (a, b) => (a ?? -1) - (b ?? -1)
    )
    const visible =
        filter === 'all' ? entries : entries.filter((e) => String(e.packetId) === filter)

    const actions = (
        <>
            <span>
                showing {visible.length} of the last {entries.length}
            </span>
            <label className={controls.field}>
                Packet id
                <select
                    className={controls.select}
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                >
                    <option value="all">all</option>
                    {packetIds.map((id) => (
                        <option key={String(id)} value={String(id)}>
                            {id ?? 'unknown'}
                        </option>
                    ))}
                </select>
            </label>
            <Button onClick={() => setFrozen(frozen ? null : recent)}>
                {frozen ? 'Resume' : 'Pause'}
            </Button>
        </>
    )

    return (
        <Panel title="Recent packets" actions={actions}>
            {visible.length === 0 ? (
                <Empty>No packets to show.</Empty>
            ) : (
                <div className={table.scroll}>
                    <table className={table.table}>
                        <thead>
                            <tr>
                                <th>Received</th>
                                <th>Packet id</th>
                                <th>Size</th>
                                <th>Session time</th>
                                <th>Frame</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((entry, index) => (
                                <tr key={`${entry.receivedAt}:${entry.frameIdentifier}:${index}`}>
                                    <td>{formatTime(entry.receivedAt)}</td>
                                    <td>{entry.packetId ?? '-'}</td>
                                    <td>{entry.size}</td>
                                    <td>{entry.sessionTime?.toFixed(3) ?? '-'}</td>
                                    <td>{entry.frameIdentifier ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Panel>
    )
}

import {useState} from 'react'
import type {RecentPacket} from '@shared/udp'

const cell = {padding: '0.25rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap'} as const

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

    return (
        <section>
            <h2>Recent packets</h2>
            <p>
                <button onClick={() => setFrozen(frozen ? null : recent)}>
                    {frozen ? 'Resume' : 'Pause'}
                </button>{' '}
                <label>
                    Packet id{' '}
                    <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                        <option value="all">all</option>
                        {packetIds.map((id) => (
                            <option key={String(id)} value={String(id)}>
                                {id ?? 'unknown'}
                            </option>
                        ))}
                    </select>
                </label>{' '}
                showing {visible.length} of the last {entries.length}
            </p>
            <div style={{maxHeight: '24rem', overflowY: 'auto'}}>
                <table style={{borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                    <thead>
                        <tr>
                            <th style={cell}>Received</th>
                            <th style={cell}>Packet id</th>
                            <th style={cell}>Size</th>
                            <th style={cell}>Session time</th>
                            <th style={cell}>Frame</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((entry, index) => (
                            <tr key={`${entry.receivedAt}:${entry.frameIdentifier}:${index}`}>
                                <td style={cell}>{formatTime(entry.receivedAt)}</td>
                                <td style={cell}>{entry.packetId ?? '-'}</td>
                                <td style={cell}>{entry.size}</td>
                                <td style={cell}>{entry.sessionTime?.toFixed(3) ?? '-'}</td>
                                <td style={cell}>{entry.frameIdentifier ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {visible.length === 0 && <p>No packets to show.</p>}
        </section>
    )
}

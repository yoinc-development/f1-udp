import {GAME_VERSIONS, type GameVersion} from '@shared/settings'
import type {UdpSnapshot} from '@shared/udp'
import Button from './components/Button'
import controls from './components/controls.module.css'
import Panel, {Empty} from './components/Panel'
import table from './components/table.module.css'
import styles from './DebugView.module.css'
import DecodedPanel from './DecodedPanel'
import RecentPanel from './RecentPanel'
import type {Receiver} from './useReceiver'

function formatAge(lastReceivedAt: number, now: number): string {
    return `${((now - lastReceivedAt) / 1000).toFixed(1)} s ago`
}

interface Props {
    receiver: Receiver
    snapshot: UdpSnapshot
}

export default function DebugView({receiver, snapshot}: Props) {
    const {now, portInput, setPortInput, version, setVersion} = receiver
    const listening = snapshot.status.state === 'listening'

    return (
        <div className={styles.view}>
            <div className={styles.controls}>
                <label className={controls.field}>
                    UDP port
                    <input
                        className={`${controls.input} ${controls.port}`}
                        type="number"
                        min={1}
                        max={65535}
                        value={portInput}
                        disabled={listening}
                        onChange={(event) => setPortInput(event.target.value)}
                    />
                </label>
                <label className={controls.field}>
                    Game
                    <select
                        className={controls.select}
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
                </label>
                <Button variant="primary" onClick={receiver.start} disabled={listening}>
                    Start
                </Button>
                <Button onClick={receiver.stop} disabled={!listening}>
                    Stop
                </Button>
            </div>

            <Panel title="Packets by id">
                {snapshot.packets.length === 0 ? (
                    <Empty>No packets received yet.</Empty>
                ) : (
                    <div className={table.scroll}>
                        <table className={table.table}>
                            <thead>
                                <tr>
                                    <th>Format</th>
                                    <th>Packet id</th>
                                    <th>Size</th>
                                    <th>Count</th>
                                    <th>Per second</th>
                                    <th>Last</th>
                                    <th>First bytes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {snapshot.packets.map((packet) => (
                                    <tr
                                        key={`${packet.packetFormat}:${packet.packetId}:${packet.size}`}
                                    >
                                        <td>{packet.packetFormat ?? 'too short'}</td>
                                        <td>{packet.packetId ?? '-'}</td>
                                        <td>{packet.size}</td>
                                        <td>{packet.count}</td>
                                        <td>{packet.perSecond}</td>
                                        <td>{formatAge(packet.lastReceivedAt, now)}</td>
                                        <td className={table.mono}>{packet.preview}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

            <div className={styles.grid}>
                <RecentPanel recent={snapshot.recent} />
                <DecodedPanel packetIds={snapshot.decodedIds} updatedAt={now} />
            </div>
        </div>
    )
}

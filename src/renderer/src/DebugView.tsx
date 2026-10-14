import {formatBytes, formatDuration} from '@shared/format'
import {GAME_VERSIONS, type GameVersion} from '@shared/settings'
import {REPLAY_SPEEDS, type ReplaySpeed, type UdpSnapshot} from '@shared/udp'
import Button from './components/Button'
import Segmented from './components/Segmented'
import controls from './components/controls.module.css'
import Panel, {Empty} from './components/Panel'
import table from './components/table.module.css'
import styles from './DebugView.module.css'
import DecisionsPanel from './DecisionsPanel'
import DecodedPanel from './DecodedPanel'
import RecentPanel from './RecentPanel'
import WorldPanel from './WorldPanel'
import type {Receiver} from './useReceiver'

type SpeedLabel = `${ReplaySpeed}x`

const SPEED_OPTIONS: readonly SpeedLabel[] = REPLAY_SPEEDS.map((speed) => `${speed}x` as const)

function speedOf(label: SpeedLabel): ReplaySpeed {
    return label === '10x' ? 10 : 1
}

function formatAge(lastReceivedAt: number, now: number): string {
    return `${((now - lastReceivedAt) / 1000).toFixed(1)} s ago`
}

interface Props {
    receiver: Receiver
    snapshot: UdpSnapshot
}

export default function DebugView({receiver, snapshot}: Props) {
    const {now, portInput, setPortInput, version, setVersion} = receiver
    const {recording, replay, analysis} = snapshot
    const listening = snapshot.status.state === 'listening'
    const replaying = replay.state === 'playing' || replay.state === 'paused'
    const recordingName = recording.file?.split(/[\\/]/).pop()

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
                        disabled={listening || replaying}
                        onChange={(event) => setPortInput(event.target.value)}
                    />
                </label>
                <label className={controls.field}>
                    Game
                    <select
                        className={controls.select}
                        value={version}
                        disabled={listening || replaying}
                        onChange={(event) => setVersion(event.target.value as GameVersion)}
                    >
                        {GAME_VERSIONS.map((gameVersion) => (
                            <option key={gameVersion} value={gameVersion}>
                                {gameVersion}
                            </option>
                        ))}
                    </select>
                </label>
                <Button
                    variant="primary"
                    onClick={receiver.start}
                    disabled={listening || replaying}
                >
                    Start
                </Button>
                <Button onClick={receiver.stop} disabled={!listening}>
                    Stop
                </Button>
            </div>

            <div className={styles.controls}>
                <span className={styles.heading}>Recording</span>
                {recording.active ? (
                    <Button onClick={receiver.stopRecording}>Stop recording</Button>
                ) : (
                    <Button onClick={receiver.startRecording} disabled={!listening}>
                        Start recording
                    </Button>
                )}
                <Button onClick={receiver.openRecordings}>Open folder</Button>
                {recording.error ? (
                    <span className={styles.error}>{recording.error}</span>
                ) : (
                    recordingName && (
                        <span className={styles.note}>
                            {recording.active ? 'Recording' : 'Saved'} {recordingName},{' '}
                            {recording.packets} packets, {formatBytes(recording.bytes)}
                        </span>
                    )
                )}
            </div>

            <div className={styles.controls}>
                <span className={styles.heading}>Replay</span>
                <Button onClick={receiver.openReplay} disabled={listening}>
                    Open recording...
                </Button>
                <Segmented
                    options={SPEED_OPTIONS}
                    value={`${receiver.replaySpeed}x`}
                    label="Replay speed"
                    onChange={(option) => receiver.changeReplaySpeed(speedOf(option))}
                />
                {replay.state === 'paused' ? (
                    <Button onClick={receiver.resumeReplay}>Resume</Button>
                ) : (
                    <Button onClick={receiver.pauseReplay} disabled={replay.state !== 'playing'}>
                        Pause
                    </Button>
                )}
                <Button onClick={receiver.stopReplay} disabled={replay.state === 'idle'}>
                    Stop
                </Button>
                {replay.state === 'error' ? (
                    <span className={styles.error}>{replay.error}</span>
                ) : (
                    replay.file && (
                        <span className={styles.note}>
                            {replay.file} ({replay.gameVersion}),{' '}
                            {formatDuration(replay.positionMs)} /{' '}
                            {formatDuration(replay.durationMs)}
                            {replay.state === 'ended' && ', finished'}
                        </span>
                    )
                )}
                {analysis.state === 'running' && (
                    <span className={styles.note}>
                        Analysing {Math.round(analysis.progress * 100)}%, {analysis.decisions}{' '}
                        decisions
                    </span>
                )}
                {analysis.state === 'done' && (
                    <span className={styles.note}>
                        {analysis.decisions} decisions saved to {analysis.file}
                    </span>
                )}
                {analysis.state === 'error' && (
                    <span className={styles.error}>Analysis failed: {analysis.error}</span>
                )}
            </div>

            {analysis.state !== 'idle' && <DecisionsPanel analysis={analysis} />}

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

            <WorldPanel world={snapshot.world} gameVersion={replay.gameVersion ?? version} />

            <div className={styles.grid}>
                <RecentPanel recent={snapshot.recent} />
                <DecodedPanel packetIds={snapshot.decodedIds} updatedAt={now} />
            </div>
        </div>
    )
}

import {GAME_VERSIONS} from '@shared/settings'
import type {UdpSnapshot} from '@shared/udp'
import Button from './components/Button'
import Segmented from './components/Segmented'
import controls from './components/controls.module.css'
import styles from './DirectorView.module.css'
import type {Receiver} from './useReceiver'

interface Props {
    receiver: Receiver
    snapshot: UdpSnapshot
}

export default function DirectorView({receiver, snapshot}: Props) {
    const {version, setVersion, portInput, setPortInput, hotkey, directorError} = receiver
    const {locked} = snapshot.director
    const listening = snapshot.status.state === 'listening'

    return (
        <div className={styles.wrap}>
            <section className={styles.card}>
                <h1 className={styles.title}>Stream director</h1>

                <div className={styles.row}>
                    <span className={styles.label}>Game version</span>
                    <Segmented
                        options={GAME_VERSIONS}
                        value={version}
                        label="Game version"
                        disabled={listening}
                        onChange={setVersion}
                    />
                </div>

                <div className={styles.row}>
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
                </div>

                {directorError && <p className={styles.error}>{directorError}</p>}

                {locked ? (
                    <>
                        <p className={styles.locked}>
                            Directing. Press <span className={styles.key}>{hotkey}</span> to stop.
                        </p>
                        <Button large onClick={receiver.stopDirector}>
                            Stop
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="primary"
                            large
                            disabled={listening}
                            onClick={receiver.startDirector}
                        >
                            Start directing
                        </Button>
                        <p className={styles.hint}>
                            Starting minimizes this window and locks its controls. Press{' '}
                            <span className={styles.key}>{hotkey}</span> to stop listening and bring
                            it back.
                        </p>
                    </>
                )}
            </section>
        </div>
    )
}

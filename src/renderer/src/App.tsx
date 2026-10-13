import {useState} from 'react'
import styles from './App.module.css'
import TitleBar from './components/TitleBar'
import DebugView from './DebugView'
import DirectorView from './DirectorView'
import {describeStatus, useReceiver} from './useReceiver'

const VIEWS = ['director', 'debug'] as const
type View = (typeof VIEWS)[number]

const VIEW_LABELS: Readonly<Record<View, string>> = {director: 'Director', debug: 'Debug'}
const VIEW_KEY = 'f1-udp.view'

function loadView(): View {
    try {
        const stored = localStorage.getItem(VIEW_KEY)
        return VIEWS.find((view) => view === stored) ?? 'director'
    } catch {
        return 'director'
    }
}

function saveView(view: View): void {
    try {
        localStorage.setItem(VIEW_KEY, view)
    } catch {
        return
    }
}

export default function App() {
    const [view, setView] = useState<View>(loadView)
    const receiver = useReceiver()
    const {snapshot} = receiver

    const status = snapshot ? describeStatus(snapshot.status, snapshot.replay) : null
    const locked = snapshot?.director.locked ?? false

    return (
        <div className={styles.shell}>
            <TitleBar />
            <div className={styles.body}>
                <nav className={styles.sidebar}>
                    <div className={styles.section}>
                        <span className={styles.label}>View</span>
                        {VIEWS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`${styles.item} ${option === view ? styles.active : ''}`}
                                aria-current={option === view ? 'page' : undefined}
                                disabled={locked}
                                onClick={() => {
                                    setView(option)
                                    saveView(option)
                                }}
                            >
                                {VIEW_LABELS[option]}
                            </button>
                        ))}
                    </div>
                    {snapshot && status && (
                        <div className={styles.status}>
                            <div className={styles.statusLine}>
                                <span className={`${styles.dot} ${styles[status.tone]}`} />
                                <span>{status.text}</span>
                            </div>
                            <span className={styles.packets}>{snapshot.totalPackets} packets</span>
                        </div>
                    )}
                </nav>
                <main className={styles.main}>
                    {!snapshot ? (
                        <p>loading...</p>
                    ) : view === 'director' ? (
                        <DirectorView receiver={receiver} snapshot={snapshot} />
                    ) : (
                        <DebugView receiver={receiver} snapshot={snapshot} />
                    )}
                </main>
            </div>
        </div>
    )
}

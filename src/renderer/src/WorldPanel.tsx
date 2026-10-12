import {formatGap, formatLapTime} from '@shared/format'
import type {CarStatus, Tyre, WorldCar, WorldSnapshot} from '@shared/world'
import Panel, {Empty} from './components/Panel'
import table from './components/table.module.css'
import styles from './WorldPanel.module.css'

const TYRE_LETTER: Readonly<Record<Tyre, string>> = {
    soft: 'S',
    medium: 'M',
    hard: 'H',
    inter: 'I',
    wet: 'W'
}

const STATUS_LABEL: Readonly<Record<CarStatus, string>> = {
    active: '',
    finished: 'Finished',
    dnf: 'DNF',
    dsq: 'DSQ',
    nc: 'NC',
    retired: 'Retired'
}

function penalty(car: WorldCar): string {
    const parts = []
    if (car.penaltySeconds > 0) parts.push(`+${car.penaltySeconds}s`)
    if (car.warnings > 0) parts.push(`${car.warnings}w`)
    return parts.join(' ') || '-'
}

function TyreCell({car}: {car: WorldCar}) {
    if (!car.tyre) return <>-</>
    return (
        <span className={`${styles.tyre} ${styles[car.tyre]}`}>
            <span className={styles.tyreDot}>{TYRE_LETTER[car.tyre]}</span>
            <span>{car.tyreAge ?? '-'}</span>
        </span>
    )
}

function CarRow({car, focused}: {car: WorldCar; focused: boolean}) {
    const out = car.status !== 'active' && car.status !== 'finished'
    const classes = [focused ? styles.focused : '', out ? styles.out : ''].filter(Boolean)
    return (
        <tr className={classes.join(' ')}>
            <td className={styles.position}>{car.position}</td>
            <td>{car.raceNumber ?? '-'}</td>
            <td>{car.name ?? `Car ${car.carIndex}`}</td>
            <td>{car.team ?? '-'}</td>
            <td>{car.position === 1 ? 'Leader' : formatGap(car.gapToLeaderMs)}</td>
            <td>{car.position === 1 ? '-' : formatGap(car.intervalMs)}</td>
            <td>{car.lap}</td>
            <td>{formatLapTime(car.lastLapMs)}</td>
            <td>{formatLapTime(car.bestLapMs)}</td>
            <td>
                <TyreCell car={car} />
            </td>
            <td>
                {car.pitStatus !== 'none' && (
                    <span className={`${styles.badge} ${styles.pit}`}>Pit</span>
                )}{' '}
                {car.pitStops}
            </td>
            <td>{penalty(car)}</td>
            <td>{car.frontWingDamage ? `${car.frontWingDamage}%` : '-'}</td>
            <td>{STATUS_LABEL[car.status] || '-'}</td>
        </tr>
    )
}

interface Props {
    world: WorldSnapshot
    gameVersion: string
}

export default function WorldPanel({world, gameVersion}: Props) {
    const {session} = world

    const actions = session && (
        <>
            {session.track && <span>{session.track}</span>}
            {session.sessionType && <span>{session.sessionType}</span>}
            <span>
                Lap {session.currentLap}/{session.totalLaps}
            </span>
            {session.safetyCar !== 'none' && (
                <span className={`${styles.badge} ${styles.warning}`}>
                    {session.safetyCar === 'full'
                        ? 'Safety car'
                        : session.safetyCar === 'virtual'
                          ? 'Virtual safety car'
                          : 'Formation lap'}
                </span>
            )}
            {session.spectating && (
                <span className={styles.badge}>
                    Spectating{session.focusedCarIndex !== null && ` #${session.focusedCarIndex}`}
                </span>
            )}
        </>
    )

    return (
        <Panel title="World state" actions={actions}>
            {!world.available ? (
                <Empty>World state is not available for {gameVersion} yet.</Empty>
            ) : world.cars.length === 0 ? (
                <Empty>No world state yet.</Empty>
            ) : (
                <div className={`${table.scroll} ${styles.tall}`}>
                    <table className={table.table}>
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>No.</th>
                                <th>Driver</th>
                                <th>Team</th>
                                <th>Gap</th>
                                <th>Interval</th>
                                <th>Lap</th>
                                <th>Last</th>
                                <th>Best</th>
                                <th>Tyre</th>
                                <th>Pit</th>
                                <th>Pen</th>
                                <th>Wing</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {world.cars.map((car) => (
                                <CarRow
                                    key={car.carIndex}
                                    car={car}
                                    focused={car.carIndex === session?.focusedCarIndex}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Panel>
    )
}

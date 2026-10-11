import type {ReactNode} from 'react'
import styles from './Panel.module.css'

interface Props {
    title: string
    actions?: ReactNode
    children: ReactNode
}

export default function Panel({title, actions, children}: Props) {
    return (
        <section className={styles.panel}>
            <header className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                {actions && <div className={styles.actions}>{actions}</div>}
            </header>
            <div className={styles.body}>{children}</div>
        </section>
    )
}

export function Empty({children}: {children: ReactNode}) {
    return <p className={styles.empty}>{children}</p>
}

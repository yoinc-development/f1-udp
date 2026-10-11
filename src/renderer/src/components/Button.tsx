import type {ButtonHTMLAttributes} from 'react'
import styles from './Button.module.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
    large?: boolean
}

export default function Button({variant = 'secondary', large = false, className, ...rest}: Props) {
    const classes = [styles.button, styles[variant], large ? styles.large : '', className]
    return <button className={classes.filter(Boolean).join(' ')} {...rest} />
}

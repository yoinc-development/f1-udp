import styles from './Segmented.module.css'

interface Props<T extends string> {
    options: readonly T[]
    value: T
    onChange: (value: T) => void
    label: string
    disabled?: boolean
    format?: (option: T) => string
}

export default function Segmented<T extends string>({
    options,
    value,
    onChange,
    label,
    disabled = false,
    format = (option) => option
}: Props<T>) {
    return (
        <div className={styles.group} role="group" aria-label={label}>
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    className={`${styles.option} ${option === value ? styles.active : ''}`}
                    aria-pressed={option === value}
                    disabled={disabled}
                    onClick={() => onChange(option)}
                >
                    {format(option)}
                </button>
            ))}
        </div>
    )
}

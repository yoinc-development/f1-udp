export function formatLapTime(ms: number | null): string {
    if (ms === null || !Number.isFinite(ms) || ms <= 0) return '-'
    const total = Math.round(ms)
    const minutes = Math.floor(total / 60000)
    const seconds = Math.floor((total % 60000) / 1000)
    const millis = total % 1000
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

export function formatGap(ms: number | null): string {
    if (ms === null || !Number.isFinite(ms)) return '-'
    return `+${(ms / 1000).toFixed(3)}`
}

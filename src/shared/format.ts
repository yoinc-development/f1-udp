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

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatDuration(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000))
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    const tail = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    return hours > 0 ? `${hours}:${tail}` : tail
}

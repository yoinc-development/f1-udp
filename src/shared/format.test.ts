import {describe, expect, it} from 'vitest'
import {formatGap, formatLapTime} from './format'

describe('formatLapTime', () => {
    it('formats minutes, seconds and milliseconds', () => {
        expect(formatLapTime(83456)).toBe('1:23.456')
    })

    it('pads seconds and milliseconds', () => {
        expect(formatLapTime(60005)).toBe('1:00.005')
    })

    it('shows a dash for missing or empty times', () => {
        expect(formatLapTime(null)).toBe('-')
        expect(formatLapTime(0)).toBe('-')
    })
})

describe('formatGap', () => {
    it('formats a gap in seconds with a sign', () => {
        expect(formatGap(1234)).toBe('+1.234')
        expect(formatGap(65000)).toBe('+65.000')
    })

    it('shows a dash when there is no gap', () => {
        expect(formatGap(null)).toBe('-')
    })
})

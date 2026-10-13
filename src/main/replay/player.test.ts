import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {encodeHeader, encodeRecord} from './format'
import {Player, type ByteSource} from './player'

function memorySource(bytes: Buffer): ByteSource {
    return {
        size: bytes.length,
        read: (position, length) => Promise.resolve(bytes.subarray(position, position + length)),
        close: () => Promise.resolve()
    }
}

function recording(records: [number, number][], gameVersion = 'f1-25'): ByteSource {
    const header = encodeHeader({gameVersion, port: 20777, startedAt: 0})
    const body = records.map(([offset, id]) => encodeRecord(offset, Buffer.from([id])))
    return memorySource(Buffer.concat([header, ...body]))
}

const RACE: [number, number][] = [
    [0, 1],
    [100, 2],
    [200, 3],
    [1000, 4]
]

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

async function advance(ms: number): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms)
}

describe('Player', () => {
    it('opens a recording and reports game version and duration', async () => {
        const player = new Player()
        const gameVersion = await player.open(recording(RACE), 'race.f1rec')

        expect(gameVersion).toBe('f1-25')
        expect(player.status).toMatchObject({
            state: 'idle',
            file: 'race.f1rec',
            gameVersion: 'f1-25',
            durationMs: 1000
        })
    })

    it('rejects a file that is not a recording', async () => {
        const player = new Player()

        await expect(player.open(memorySource(Buffer.from('garbage data')), 'x')).rejects.toThrow()
        expect(player.status.state).toBe('error')
    })

    it('rejects an unknown game version', async () => {
        const player = new Player()

        await expect(player.open(recording(RACE, 'f1-99'), 'x')).rejects.toThrow('f1-99')
    })

    it('emits packets in file order at their recorded time', async () => {
        const player = new Player()
        await player.open(recording(RACE), 'race.f1rec')
        const seen: number[] = []
        player.play((buffer) => seen.push(buffer[0]!), 1)

        await advance(50)
        expect(seen).toEqual([1])
        await advance(100)
        expect(seen).toEqual([1, 2])
        await advance(100)
        expect(seen).toEqual([1, 2, 3])
        await advance(900)
        expect(seen).toEqual([1, 2, 3, 4])
        expect(player.status.state).toBe('ended')
        expect(player.status.positionMs).toBe(1000)
    })

    it('plays ten times faster at 10x', async () => {
        const player = new Player()
        await player.open(recording(RACE), 'race.f1rec')
        const seen: number[] = []
        player.play((buffer) => seen.push(buffer[0]!), 10)

        await advance(100)

        expect(seen).toEqual([1, 2, 3, 4])
        expect(player.status.state).toBe('ended')
    })

    it('holds the position while paused', async () => {
        const player = new Player()
        await player.open(recording(RACE), 'race.f1rec')
        const seen: number[] = []
        player.play((buffer) => seen.push(buffer[0]!), 1)
        await advance(120)
        player.pause()
        const position = player.status.positionMs
        await advance(5000)

        expect(seen).toEqual([1, 2])
        expect(player.status).toMatchObject({state: 'paused', positionMs: position})

        player.resume()
        await advance(100)
        expect(seen).toEqual([1, 2, 3])
    })

    it('changes the speed while playing', async () => {
        const player = new Player()
        await player.open(recording(RACE), 'race.f1rec')
        const seen: number[] = []
        player.play((buffer) => seen.push(buffer[0]!), 1)
        await advance(150)
        player.setSpeed(10)
        await advance(100)

        expect(seen).toEqual([1, 2, 3, 4])
    })

    it('returns to idle on stop', async () => {
        const player = new Player()
        await player.open(recording(RACE), 'race.f1rec')
        const seen: number[] = []
        player.play((buffer) => seen.push(buffer[0]!), 1)
        await advance(120)
        player.stop()
        await advance(2000)

        expect(seen).toEqual([1, 2])
        expect(player.status.state).toBe('idle')
        expect(player.active).toBe(false)
    })

    it('stops delivering when the handler fails the replay', async () => {
        const player = new Player()
        await player.open(recording(RACE), 'race.f1rec')
        const seen: number[] = []
        player.play((buffer) => {
            seen.push(buffer[0]!)
            if (buffer[0] === 2) player.fail('format mismatch')
        }, 10)
        await advance(500)

        expect(seen).toEqual([1, 2])
        expect(player.status).toMatchObject({state: 'error', error: 'format mismatch'})
    })

    it('plays the same packet sequence on every run', async () => {
        const runs: number[][] = []
        for (let run = 0; run < 2; run++) {
            const player = new Player()
            await player.open(recording(RACE), 'race.f1rec')
            const seen: number[] = []
            player.play((buffer) => seen.push(buffer[0]!), 10)
            await advance(300)
            runs.push(seen)
        }

        expect(runs[0]).toEqual(runs[1])
    })
})

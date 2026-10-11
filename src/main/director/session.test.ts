import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {ReceiverStatus} from '@shared/udp'
import {DirectorSession, type SessionHost} from './session'

const OPTIONS = {port: 20777, gameVersion: 'f1-25', hotkey: 'Control+Shift+F12'} as const

function createHost() {
    const host = {
        startReceiver: vi.fn(async (): Promise<ReceiverStatus> => ({
            state: 'listening',
            port: 20777
        })),
        stopReceiver: vi.fn(),
        registerShortcut: vi.fn<SessionHost['registerShortcut']>(() => true),
        unregisterShortcut: vi.fn(),
        minimizeWindow: vi.fn(),
        restoreWindow: vi.fn(),
        onChange: vi.fn()
    }
    return host
}

describe('DirectorSession', () => {
    let host: ReturnType<typeof createHost>
    let session: DirectorSession

    beforeEach(() => {
        host = createHost()
        session = new DirectorSession(host)
    })

    it('registers the stop key, listens, minimizes and locks', async () => {
        const result = await session.start(OPTIONS)

        expect(result).toEqual({started: true, error: null})
        expect(host.registerShortcut).toHaveBeenCalledWith(OPTIONS.hotkey, expect.any(Function))
        expect(host.startReceiver).toHaveBeenCalledWith(20777, 'f1-25')
        expect(host.minimizeWindow).toHaveBeenCalledOnce()
        expect(session.state).toEqual({locked: true, hotkey: OPTIONS.hotkey})
    })

    it('refuses to start when the stop key cannot be registered', async () => {
        host.registerShortcut.mockReturnValue(false)

        const result = await session.start(OPTIONS)

        expect(result.started).toBe(false)
        expect(result.error).toContain(OPTIONS.hotkey)
        expect(host.startReceiver).not.toHaveBeenCalled()
        expect(host.minimizeWindow).not.toHaveBeenCalled()
        expect(session.state.locked).toBe(false)
    })

    it('releases the stop key when the receiver does not start', async () => {
        host.startReceiver.mockResolvedValue({state: 'error', port: 20777, error: 'EADDRINUSE'})

        const result = await session.start(OPTIONS)

        expect(result).toEqual({started: false, error: 'EADDRINUSE'})
        expect(host.unregisterShortcut).toHaveBeenCalledWith(OPTIONS.hotkey)
        expect(host.minimizeWindow).not.toHaveBeenCalled()
        expect(session.state.locked).toBe(false)
    })

    it('stops the receiver and restores the window when the shortcut fires', async () => {
        await session.start(OPTIONS)
        const callback = host.registerShortcut.mock.calls[0]?.[1]

        callback?.()

        expect(host.stopReceiver).toHaveBeenCalledOnce()
        expect(host.unregisterShortcut).toHaveBeenCalledWith(OPTIONS.hotkey)
        expect(host.restoreWindow).toHaveBeenCalledOnce()
        expect(session.state).toEqual({locked: false, hotkey: null})
    })

    it('does nothing on stop when not locked', () => {
        session.stop()

        expect(host.stopReceiver).not.toHaveBeenCalled()
        expect(host.restoreWindow).not.toHaveBeenCalled()
    })

    it('releases the lock when the receiver stops by itself', async () => {
        await session.start(OPTIONS)

        session.sync('stopped')

        expect(host.unregisterShortcut).toHaveBeenCalledWith(OPTIONS.hotkey)
        expect(host.restoreWindow).toHaveBeenCalledOnce()
        expect(host.stopReceiver).not.toHaveBeenCalled()
        expect(session.state.locked).toBe(false)
    })

    it('keeps the lock while the receiver is listening', async () => {
        await session.start(OPTIONS)

        session.sync('listening')

        expect(session.state.locked).toBe(true)
        expect(host.restoreWindow).not.toHaveBeenCalled()
    })

    it('ignores a second start while locked', async () => {
        await session.start(OPTIONS)

        const result = await session.start(OPTIONS)

        expect(result.started).toBe(true)
        expect(host.registerShortcut).toHaveBeenCalledOnce()
        expect(host.startReceiver).toHaveBeenCalledOnce()
    })
})

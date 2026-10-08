import {createSocket} from 'node:dgram'
import {afterEach, describe, expect, it} from 'vitest'
import {UdpReceiver} from './receiver'

function send(port: number, message: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
        const socket = createSocket('udp4')
        socket.send(message, port, '127.0.0.1', (error) => {
            socket.close()
            if (error) reject(error)
            else resolve()
        })
    })
}

describe('UdpReceiver', () => {
    const receivers: UdpReceiver[] = []

    function create(): UdpReceiver {
        const receiver = new UdpReceiver()
        receivers.push(receiver)
        return receiver
    }

    afterEach(() => {
        for (const receiver of receivers.splice(0)) receiver.stop()
    })

    it('delivers received datagrams to listeners', async () => {
        const receiver = create()
        const status = await receiver.start(0)
        expect(status.state).toBe('listening')

        const received = new Promise<Buffer>((resolve) => receiver.onPacket(resolve))
        await send(status.port, Buffer.from([1, 2, 3]))

        expect([...(await received)]).toEqual([1, 2, 3])
    })

    it('reports an error when the port is already in use', async () => {
        const first = create()
        const {port} = await first.start(0)

        const second = create()
        const status = await second.start(port)

        expect(status.state).toBe('error')
        expect(status.error).toContain('EADDRINUSE')
    })

    it('can be restarted and stopped', async () => {
        const receiver = create()
        await receiver.start(0)
        const again = await receiver.start(0)
        expect(again.state).toBe('listening')

        receiver.stop()
        expect(receiver.status.state).toBe('stopped')
    })
})

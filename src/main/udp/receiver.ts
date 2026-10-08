import {createSocket, type Socket} from 'node:dgram'
import type {ReceiverStatus} from '@shared/udp'

export type PacketListener = (buffer: Buffer) => void

export class UdpReceiver {
    private socket: Socket | null = null
    private current: ReceiverStatus = {state: 'stopped', port: 0}
    private readonly listeners = new Set<PacketListener>()

    get status(): ReceiverStatus {
        return this.current
    }

    onPacket(listener: PacketListener): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    start(port: number): Promise<ReceiverStatus> {
        this.close()
        return new Promise((resolve) => {
            const socket = createSocket('udp4')
            this.socket = socket

            socket.on('message', (message) => {
                for (const listener of this.listeners) listener(message)
            })

            socket.once('error', (error) => {
                if (this.socket === socket) {
                    this.socket = null
                    this.current = {state: 'error', port, error: error.message}
                }
                socket.close()
                resolve(this.current)
            })

            socket.once('listening', () => {
                this.current = {state: 'listening', port: socket.address().port}
                socket.on('error', (error) => {
                    this.current = {state: 'error', port: this.current.port, error: error.message}
                })
                resolve(this.current)
            })

            socket.bind(port, '0.0.0.0')
        })
    }

    stop(): void {
        this.close()
        this.current = {state: 'stopped', port: this.current.port}
    }

    private close(): void {
        const socket = this.socket
        this.socket = null
        if (!socket) return
        socket.removeAllListeners('message')
        socket.close()
    }
}

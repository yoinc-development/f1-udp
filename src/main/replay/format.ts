const MAGIC = Buffer.from('F1UDPREC', 'ascii')
const FORMAT_VERSION = 1
const RECORD_HEADER_SIZE = 6

export const MAX_HEADER_SIZE = MAGIC.length + 2 + 1 + 255 + 2 + 8
export const MAX_RECORD_SIZE = 0xffff
export const MAX_OFFSET_MS = 0xffffffff

export interface RecordingInfo {
    gameVersion: string
    port: number
    startedAt: number
}

export interface RecordedPacket {
    offsetMs: number
    data: Buffer
}

export function encodeHeader(info: RecordingInfo): Buffer {
    const version = Buffer.from(info.gameVersion, 'utf8')
    if (version.length > 255) throw new Error('Game version is too long')
    const buffer = Buffer.alloc(MAGIC.length + 2 + 1 + version.length + 2 + 8)
    let offset = MAGIC.copy(buffer)
    offset = buffer.writeUInt16LE(FORMAT_VERSION, offset)
    offset = buffer.writeUInt8(version.length, offset)
    offset += version.copy(buffer, offset)
    offset = buffer.writeUInt16LE(info.port, offset)
    buffer.writeDoubleLE(info.startedAt, offset)
    return buffer
}

export function parseHeader(buffer: Buffer): {info: RecordingInfo; size: number} {
    if (buffer.length < MAGIC.length + 3 || !buffer.subarray(0, MAGIC.length).equals(MAGIC)) {
        throw new Error('Not an f1-udp recording')
    }
    let offset = MAGIC.length
    const formatVersion = buffer.readUInt16LE(offset)
    offset += 2
    if (formatVersion !== FORMAT_VERSION) {
        throw new Error(`Unsupported recording format version ${formatVersion}`)
    }
    const versionLength = buffer.readUInt8(offset)
    offset += 1
    if (buffer.length < offset + versionLength + 2 + 8) {
        throw new Error('The recording header is incomplete')
    }
    const gameVersion = buffer.toString('utf8', offset, offset + versionLength)
    offset += versionLength
    const port = buffer.readUInt16LE(offset)
    offset += 2
    const startedAt = buffer.readDoubleLE(offset)
    offset += 8
    return {info: {gameVersion, port, startedAt}, size: offset}
}

export function encodeRecord(offsetMs: number, data: Buffer): Buffer {
    const buffer = Buffer.alloc(RECORD_HEADER_SIZE + data.length)
    buffer.writeUInt32LE(offsetMs, 0)
    buffer.writeUInt16LE(data.length, 4)
    data.copy(buffer, RECORD_HEADER_SIZE)
    return buffer
}

export class RecordParser {
    private pending: Buffer = Buffer.alloc(0)

    push(chunk: Buffer): RecordedPacket[] {
        const buffer = this.pending.length === 0 ? chunk : Buffer.concat([this.pending, chunk])
        const packets: RecordedPacket[] = []
        let offset = 0
        while (buffer.length - offset >= RECORD_HEADER_SIZE) {
            const length = buffer.readUInt16LE(offset + 4)
            const end = offset + RECORD_HEADER_SIZE + length
            if (end > buffer.length) break
            packets.push({
                offsetMs: buffer.readUInt32LE(offset),
                data: buffer.subarray(offset + RECORD_HEADER_SIZE, end)
            })
            offset = end
        }
        this.pending = buffer.subarray(offset)
        return packets
    }
}

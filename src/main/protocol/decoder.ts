import type {GameVersion} from '@shared/settings'
import {readStruct, type StructValue} from './reader'
import {VERSIONS} from './versions'

export interface DecodedPacket {
    header: StructValue
    packetId: number
    data: StructValue | null
}

export function decode(buffer: Buffer, gameVersion: GameVersion): DecodedPacket {
    const version = VERSIONS[gameVersion]
    const {value: header, offset} = readStruct(version.header, buffer)
    const packetId = Number(header.packetId)
    const schema = version.packets[packetId]
    if (!schema) return {header, packetId, data: null}
    return {header, packetId, data: readStruct(schema, buffer, offset).value}
}

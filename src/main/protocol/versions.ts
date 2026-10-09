import type {GameVersion} from '@shared/settings'
import {PacketHeader as PacketHeader2021} from './f1-2021/header'
import {PacketHeader as PacketHeader25} from './f1-25/header'
import {PacketHeader as PacketHeader26} from './f1-26/header'
import type {StructSchema} from './schema'

export interface VersionDefinition {
    label: string
    packetFormat: number
    header: StructSchema
    packets: Readonly<Record<number, StructSchema>>
}

export const VERSIONS: Readonly<Record<GameVersion, VersionDefinition>> = {
    'f1-2021': {label: 'F1 2021', packetFormat: 2021, header: PacketHeader2021, packets: {}},
    'f1-25': {label: 'F1 25', packetFormat: 2025, header: PacketHeader25, packets: {}},
    'f1-26': {label: 'F1 26', packetFormat: 2026, header: PacketHeader26, packets: {}}
}

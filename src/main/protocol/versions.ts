import type {GameVersion} from '@shared/settings'
import {PacketHeader as PacketHeader2021} from './f1-2021/header'
import {PacketHeader as PacketHeader25} from './f1-25/header'
import {PacketEventData as PacketEventData25} from './f1-25/event'
import {PacketCarSetupData as PacketCarSetupData25} from './f1-25/carsetups'
import {PacketCarTelemetryData as PacketCarTelemetryData25} from './f1-25/cartelemetry'
import {PacketCarStatusData as PacketCarStatusData25} from './f1-25/carstatus'
import {PacketFinalClassificationData as PacketFinalClassificationData25} from './f1-25/finalclassification'
import {PacketLobbyInfoData as PacketLobbyInfoData25} from './f1-25/lobbyinfo'
import {PacketCarDamageData as PacketCarDamageData25} from './f1-25/cardamage'
import {PacketSessionHistoryData as PacketSessionHistoryData25} from './f1-25/sessionhistory'
import {PacketLapData as PacketLapData25} from './f1-25/lapdata'
import {PacketParticipantsData as PacketParticipantsData25} from './f1-25/participants'
import {PacketMotionData as PacketMotionData25} from './f1-25/motion'
import {PacketSessionData as PacketSessionData25} from './f1-25/session'
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
    'f1-25': {
        label: 'F1 25',
        packetFormat: 2025,
        header: PacketHeader25,
        packets: {
            0: PacketMotionData25,
            1: PacketSessionData25,
            2: PacketLapData25,
            3: PacketEventData25,
            4: PacketParticipantsData25,
            5: PacketCarSetupData25,
            6: PacketCarTelemetryData25,
            7: PacketCarStatusData25,
            8: PacketFinalClassificationData25,
            9: PacketLobbyInfoData25,
            10: PacketCarDamageData25
            11: PacketSessionHistoryData25
        }
    },
    'f1-26': {label: 'F1 26', packetFormat: 2026, header: PacketHeader26, packets: {}}
}

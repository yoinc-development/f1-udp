import type {StructSchema} from '../schema'

export const FastestLap = [
    {name: 'vehicleIdx', type: 'uint8'},
    {name: 'lapTime', type: 'float'}
] as const satisfies StructSchema

export const Retirement = [
    {name: 'vehicleIdx', type: 'uint8'},
    {name: 'reason', type: 'uint8'}
] as const satisfies StructSchema

export const DRSDisabled = [{name: 'reason', type: 'uint8'}] as const satisfies StructSchema

export const TeamMateInPits = [{name: 'vehicleIdx', type: 'uint8'}] as const satisfies StructSchema

export const RaceWinner = [{name: 'vehicleIdx', type: 'uint8'}] as const satisfies StructSchema

export const Penalty = [
    {name: 'penaltyType', type: 'uint8'},
    {name: 'infringementType', type: 'uint8'},
    {name: 'vehicleIdx', type: 'uint8'},
    {name: 'otherVehicleIdx', type: 'uint8'},
    {name: 'time', type: 'uint8'},
    {name: 'lapNum', type: 'uint8'},
    {name: 'placesGained', type: 'uint8'}
] as const satisfies StructSchema

export const SpeedTrap = [
    {name: 'vehicleIdx', type: 'uint8'},
    {name: 'speed', type: 'float'},
    {name: 'isOverallFastestInSession', type: 'uint8'},
    {name: 'isDriverFastestInSession', type: 'uint8'},
    {name: 'fastestVehicleIdxInSession', type: 'uint8'},
    {name: 'fastestSpeedInSession', type: 'float'}
] as const satisfies StructSchema

export const StartLights = [{name: 'numLights', type: 'uint8'}] as const satisfies StructSchema

export const DriveThroughPenaltyServed = [
    {name: 'vehicleIdx', type: 'uint8'}
] as const satisfies StructSchema

export const StopGoPenaltyServed = [
    {name: 'vehicleIdx', type: 'uint8'},
    {name: 'stopTime', type: 'float'}
] as const satisfies StructSchema

export const Flashback = [
    {name: 'flashbackFrameIdentifier', type: 'uint32'},
    {name: 'flashbackSessionTime', type: 'float'}
] as const satisfies StructSchema

export const Buttons = [{name: 'buttonStatus', type: 'uint32'}] as const satisfies StructSchema

export const Overtake = [
    {name: 'overtakingVehicleIdx', type: 'uint8'},
    {name: 'beingOvertakenVehicleIdx', type: 'uint8'}
] as const satisfies StructSchema

export const SafetyCar = [
    {name: 'safetyCarType', type: 'uint8'},
    {name: 'eventType', type: 'uint8'}
] as const satisfies StructSchema

export const Collision = [
    {name: 'vehicle1Idx', type: 'uint8'},
    {name: 'vehicle2Idx', type: 'uint8'}
] as const satisfies StructSchema

export const EventDataDetails = {
    FTLP: FastestLap,
    RTMT: Retirement,
    DRSD: DRSDisabled,
    TMPT: TeamMateInPits,
    RCWN: RaceWinner,
    PENA: Penalty,
    SPTP: SpeedTrap,
    STLG: StartLights,
    DTSV: DriveThroughPenaltyServed,
    SGSV: StopGoPenaltyServed,
    FLBK: Flashback,
    BUTN: Buttons,
    OVTK: Overtake,
    SCAR: SafetyCar,
    COLL: Collision
} as const satisfies Record<string, StructSchema>

export const PacketEventData = [
    {name: 'eventStringCode', type: 'string', length: 4},
    {
        name: 'eventDetails',
        type: 'union',
        discriminator: 'eventStringCode',
        variants: EventDataDetails
    }
] as const satisfies StructSchema

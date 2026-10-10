import type {EnumObject, EnumValue} from '../enums'

export const ResultStatus = {
    invalid: 0,
    inactive: 1,
    active: 2,
    finished: 3,
    didNotFinish: 4,
    disqualified: 5,
    notClassified: 6,
    retired: 7
} as const satisfies EnumObject
export type ResultStatus = EnumValue<typeof ResultStatus>

export const ResultReason = {
    invalid: 0,
    retired: 1,
    finished: 2,
    terminalDamage: 3,
    inactive: 4,
    notEnoughLapsCompleted: 5,
    blackFlagged: 6,
    redFlagged: 7,
    mechanicalFailure: 8,
    sessionSkipped: 9,
    sessionSimulated: 10
} as const satisfies EnumObject
export type ResultReason = EnumValue<typeof ResultReason>

export const PitStatus = {none: 0, pitting: 1, inPitArea: 2} as const satisfies EnumObject
export type PitStatus = EnumValue<typeof PitStatus>

export const DriverStatus = {
    inGarage: 0,
    flyingLap: 1,
    inLap: 2,
    outLap: 3,
    onTrack: 4
} as const satisfies EnumObject
export type DriverStatus = EnumValue<typeof DriverStatus>

export const Sector = {sector1: 0, sector2: 1, sector3: 2} as const satisfies EnumObject
export type Sector = EnumValue<typeof Sector>

export const SafetyCarType = {
    none: 0,
    full: 1,
    virtual: 2,
    formationLap: 3
} as const satisfies EnumObject
export type SafetyCarType = EnumValue<typeof SafetyCarType>

export const SafetyCarEventType = {
    deployed: 0,
    returning: 1,
    returned: 2,
    resumeRace: 3
} as const satisfies EnumObject
export type SafetyCarEventType = EnumValue<typeof SafetyCarEventType>

export const SafetyCarStatus = {
    none: 0,
    full: 1,
    virtual: 2,
    formationLap: 3
} as const satisfies EnumObject
export type SafetyCarStatus = EnumValue<typeof SafetyCarStatus>

export const DrsDisabledReason = {
    wetTrack: 0,
    safetyCarDeployed: 1,
    redFlag: 2,
    minLapNotReached: 3
} as const satisfies EnumObject
export type DrsDisabledReason = EnumValue<typeof DrsDisabledReason>

export const Weather = {
    clear: 0,
    lightCloud: 1,
    overcast: 2,
    lightRain: 3,
    heavyRain: 4,
    storm: 5
} as const satisfies EnumObject
export type Weather = EnumValue<typeof Weather>

export const TemperatureChange = {up: 0, down: 1, noChange: 2} as const satisfies EnumObject
export type TemperatureChange = EnumValue<typeof TemperatureChange>

export const Flag = {
    invalid: -1,
    none: 0,
    green: 1,
    blue: 2,
    yellow: 3
} as const satisfies EnumObject
export type Flag = EnumValue<typeof Flag>

export const Formula = {
    f1Modern: 0,
    f1Classic: 1,
    f2: 2,
    f1Generic: 3,
    beta: 4,
    esports: 6,
    f1World: 8,
    f1Elimination: 9
} as const satisfies EnumObject
export type Formula = EnumValue<typeof Formula>

export const SessionLength = {
    none: 0,
    veryShort: 2,
    short: 3,
    medium: 4,
    mediumLong: 5,
    long: 6,
    full: 7
} as const satisfies EnumObject
export type SessionLength = EnumValue<typeof SessionLength>

export const ErsDeployMode = {
    none: 0,
    medium: 1,
    hotlap: 2,
    overtake: 3
} as const satisfies EnumObject
export type ErsDeployMode = EnumValue<typeof ErsDeployMode>

export const FuelMix = {lean: 0, standard: 1, rich: 2, max: 3} as const satisfies EnumObject
export type FuelMix = EnumValue<typeof FuelMix>

export const TractionControl = {off: 0, medium: 1, full: 2} as const satisfies EnumObject
export type TractionControl = EnumValue<typeof TractionControl>

export const ActualTyreCompound = {
    c5: 16,
    c4: 17,
    c3: 18,
    c2: 19,
    c1: 20,
    c0: 21,
    c6: 22,
    inter: 7,
    wet: 8,
    classicDry: 9,
    classicWet: 10,
    f2SuperSoft: 11,
    f2Soft: 12,
    f2Medium: 13,
    f2Hard: 14,
    f2Wet: 15
} as const satisfies EnumObject
export type ActualTyreCompound = EnumValue<typeof ActualTyreCompound>

export const VisualTyreCompound = {
    soft: 16,
    medium: 17,
    hard: 18,
    inter: 7,
    wet: 8,
    f2Wet: 15,
    f2SuperSoft: 19,
    f2Soft: 20,
    f2Medium: 21,
    f2Hard: 22
} as const satisfies EnumObject
export type VisualTyreCompound = EnumValue<typeof VisualTyreCompound>

export const Platform = {
    steam: 1,
    playStation: 3,
    xbox: 4,
    origin: 6,
    unknown: 255
} as const satisfies EnumObject
export type Platform = EnumValue<typeof Platform>

export const ReadyStatus = {notReady: 0, ready: 1, spectating: 2} as const satisfies EnumObject
export type ReadyStatus = EnumValue<typeof ReadyStatus>

export const MfdPanel = {
    closed: 255,
    carSetup: 0,
    pits: 1,
    damage: 2,
    engine: 3,
    temperatures: 4
} as const satisfies EnumObject
export type MfdPanel = EnumValue<typeof MfdPanel>

export const Gear = {
    reverse: -1,
    neutral: 0,
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8
} as const satisfies EnumObject
export type Gear = EnumValue<typeof Gear>

export const SuggestedGear = {
    none: 0,
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8
} as const satisfies EnumObject
export type SuggestedGear = EnumValue<typeof SuggestedGear>

export const NetworkGame = {offline: 0, online: 1} as const satisfies EnumObject
export type NetworkGame = EnumValue<typeof NetworkGame>

export const ForecastAccuracy = {perfect: 0, approximate: 1} as const satisfies EnumObject
export type ForecastAccuracy = EnumValue<typeof ForecastAccuracy>

export const SpeedUnits = {mph: 0, kph: 1} as const satisfies EnumObject
export type SpeedUnits = EnumValue<typeof SpeedUnits>

export const TemperatureUnits = {celsius: 0, fahrenheit: 1} as const satisfies EnumObject
export type TemperatureUnits = EnumValue<typeof TemperatureUnits>

export const BrakingAssist = {off: 0, low: 1, medium: 2, high: 3} as const satisfies EnumObject
export type BrakingAssist = EnumValue<typeof BrakingAssist>

export const GearboxAssist = {
    manual: 1,
    manualAndSuggestedGear: 2,
    auto: 3
} as const satisfies EnumObject
export type GearboxAssist = EnumValue<typeof GearboxAssist>

export const DynamicRacingLine = {off: 0, cornersOnly: 1, full: 2} as const satisfies EnumObject
export type DynamicRacingLine = EnumValue<typeof DynamicRacingLine>

export const DynamicRacingLineType = {twoD: 0, threeD: 1} as const satisfies EnumObject
export type DynamicRacingLineType = EnumValue<typeof DynamicRacingLineType>

export const RecoveryMode = {none: 0, flashbacks: 1, autoRecovery: 2} as const satisfies EnumObject
export type RecoveryMode = EnumValue<typeof RecoveryMode>

export const FlashbackLimit = {
    low: 0,
    medium: 1,
    high: 2,
    unlimited: 3
} as const satisfies EnumObject
export type FlashbackLimit = EnumValue<typeof FlashbackLimit>

export const SessionSurfaceType = {simplified: 0, realistic: 1} as const satisfies EnumObject
export type SessionSurfaceType = EnumValue<typeof SessionSurfaceType>

export const LowFuelMode = {easy: 0, hard: 1} as const satisfies EnumObject
export type LowFuelMode = EnumValue<typeof LowFuelMode>

export const RaceStarts = {manual: 0, assisted: 1} as const satisfies EnumObject
export type RaceStarts = EnumValue<typeof RaceStarts>

export const TyreTemperature = {surfaceOnly: 0, surfaceAndCarcass: 1} as const satisfies EnumObject
export type TyreTemperature = EnumValue<typeof TyreTemperature>

export const PitLaneTyreSim = {on: 0, off: 1} as const satisfies EnumObject
export type PitLaneTyreSim = EnumValue<typeof PitLaneTyreSim>

export const CarDamage = {
    off: 0,
    reduced: 1,
    standard: 2,
    simulation: 3
} as const satisfies EnumObject
export type CarDamage = EnumValue<typeof CarDamage>

export const CarDamageRate = {reduced: 0, standard: 1, simulation: 2} as const satisfies EnumObject
export type CarDamageRate = EnumValue<typeof CarDamageRate>

export const Collisions = {off: 0, playerToPlayerOff: 1, on: 2} as const satisfies EnumObject
export type Collisions = EnumValue<typeof Collisions>

export const MpUnsafePitRelease = {on: 0, off: 1} as const satisfies EnumObject
export type MpUnsafePitRelease = EnumValue<typeof MpUnsafePitRelease>

export const CornerCuttingStringency = {regular: 0, strict: 1} as const satisfies EnumObject
export type CornerCuttingStringency = EnumValue<typeof CornerCuttingStringency>

export const PitStopExperience = {
    automatic: 0,
    broadcast: 1,
    immersive: 2
} as const satisfies EnumObject
export type PitStopExperience = EnumValue<typeof PitStopExperience>

export const SafetyCarSetting = {
    off: 0,
    reduced: 1,
    standard: 2,
    increased: 3
} as const satisfies EnumObject
export type SafetyCarSetting = EnumValue<typeof SafetyCarSetting>

export const SafetyCarExperience = {broadcast: 0, immersive: 1} as const satisfies EnumObject
export type SafetyCarExperience = EnumValue<typeof SafetyCarExperience>

export const FormationLapExperience = {broadcast: 0, immersive: 1} as const satisfies EnumObject
export type FormationLapExperience = EnumValue<typeof FormationLapExperience>

export const RedFlagSetting = {
    off: 0,
    reduced: 1,
    standard: 2,
    increased: 3
} as const satisfies EnumObject
export type RedFlagSetting = EnumValue<typeof RedFlagSetting>

export const OffOn = {off: 0, on: 1} as const satisfies EnumObject
export type OffOn = EnumValue<typeof OffOn>

export const DisabledEnabled = {disabled: 0, enabled: 1} as const satisfies EnumObject
export type DisabledEnabled = EnumValue<typeof DisabledEnabled>

export const NoYes = {no: 0, yes: 1} as const satisfies EnumObject
export type NoYes = EnumValue<typeof NoYes>

export const OkFault = {ok: 0, fault: 1} as const satisfies EnumObject
export type OkFault = EnumValue<typeof OkFault>

export const InactiveActive = {inactive: 0, active: 1} as const satisfies EnumObject
export type InactiveActive = EnumValue<typeof InactiveActive>

export const DrsAllowed = {notAllowed: 0, allowed: 1} as const satisfies EnumObject
export type DrsAllowed = EnumValue<typeof DrsAllowed>

export const TelemetrySetting = {restricted: 0, public: 1} as const satisfies EnumObject
export type TelemetrySetting = EnumValue<typeof TelemetrySetting>

export const AiControlled = {human: 0, ai: 1} as const satisfies EnumObject
export type AiControlled = EnumValue<typeof AiControlled>

export const MyTeam = {otherwise: 0, myTeam: 1} as const satisfies EnumObject
export type MyTeam = EnumValue<typeof MyTeam>

export const CurrentLapValidity = {valid: 0, invalid: 1} as const satisfies EnumObject
export type CurrentLapValidity = EnumValue<typeof CurrentLapValidity>

export const TimeTrialValidity = {invalid: 0, valid: 1} as const satisfies EnumObject
export type TimeTrialValidity = EnumValue<typeof TimeTrialValidity>

export const CarPerformance = {realistic: 0, equal: 1} as const satisfies EnumObject
export type CarPerformance = EnumValue<typeof CarPerformance>

export const LapValidFlags = {
    lap: 0x01,
    sector1: 0x02,
    sector2: 0x04,
    sector3: 0x08
} as const satisfies EnumObject
export type LapValidFlags = EnumValue<typeof LapValidFlags>

export const REV_LIGHT_COUNT = 15

export const EventCode = {
    sessionStarted: 'SSTA',
    sessionEnded: 'SEND',
    fastestLap: 'FTLP',
    retirement: 'RTMT',
    drsEnabled: 'DRSE',
    drsDisabled: 'DRSD',
    teamMateInPits: 'TMPT',
    chequeredFlag: 'CHQF',
    raceWinner: 'RCWN',
    penaltyIssued: 'PENA',
    speedTrap: 'SPTP',
    startLights: 'STLG',
    lightsOut: 'LGOT',
    driveThroughServed: 'DTSV',
    stopGoServed: 'SGSV',
    flashback: 'FLBK',
    buttonStatus: 'BUTN',
    redFlag: 'RDFL',
    overtake: 'OVTK',
    safetyCar: 'SCAR',
    collision: 'COLL'
} as const satisfies Readonly<Record<string, string>>
export type EventCode = (typeof EventCode)[keyof typeof EventCode]

export const TYRE_STINT_CURRENT_END_LAP = 255
export const NO_TEAM_ID = 255
export const NETWORK_HUMAN_DRIVER_ID = 255
export const INVALID_CAR_INDEX = 255
export const SPEED_TRAP_LAP_NOT_SET = 255
export const TRACK_ID_UNKNOWN = -1

import type {StructSchema} from '../schema'

export const LapData = [
    {name: 'lastLapTimeInMS', type: 'uint32'},
    {name: 'currentLapTimeInMS', type: 'uint32'},
    {name: 'sector1TimeMSPart', type: 'uint16'},
    {name: 'sector1TimeMinutesPart', type: 'uint8'},
    {name: 'sector2TimeMSPart', type: 'uint16'},
    {name: 'sector2TimeMinutesPart', type: 'uint8'},
    {name: 'deltaToCarInFrontMSPart', type: 'uint16'},
    {name: 'deltaToCarInFrontMinutesPart', type: 'uint8'},
    {name: 'deltaToRaceLeaderMSPart', type: 'uint16'},
    {name: 'deltaToRaceLeaderMinutesPart', type: 'uint8'},
    {name: 'lapDistance', type: 'float'},
    {name: 'totalDistance', type: 'float'},
    {name: 'safetyCarDelta', type: 'float'},
    {name: 'carPosition', type: 'uint8'},
    {name: 'currentLapNum', type: 'uint8'},
    {name: 'pitStatus', type: 'uint8'},
    {name: 'numPitStops', type: 'uint8'},
    {name: 'sector', type: 'uint8'},
    {name: 'currentLapInvalid', type: 'uint8'},
    {name: 'penalties', type: 'uint8'},
    {name: 'totalWarnings', type: 'uint8'},
    {name: 'cornerCuttingWarnings', type: 'uint8'},
    {name: 'numUnservedDriveThroughPens', type: 'uint8'},
    {name: 'numUnservedStopGoPens', type: 'uint8'},
    {name: 'gridPosition', type: 'uint8'},
    {name: 'driverStatus', type: 'uint8'},
    {name: 'resultStatus', type: 'uint8'},
    {name: 'pitLaneTimerActive', type: 'uint8'},
    {name: 'pitLaneTimeInLaneInMS', type: 'uint16'},
    {name: 'pitStopTimerInMS', type: 'uint16'},
    {name: 'pitStopShouldServePen', type: 'uint8'},
    {name: 'speedTrapFastestSpeed', type: 'float'},
    {name: 'speedTrapFastestLap', type: 'uint8'}
] as const satisfies StructSchema

export const PacketLapData = [
    {name: 'lapData', type: 'array', length: 22, of: LapData},
    {name: 'timeTrialPBCarIdx', type: 'uint8'},
    {name: 'timeTrialRivalCarIdx', type: 'uint8'}
] as const satisfies StructSchema

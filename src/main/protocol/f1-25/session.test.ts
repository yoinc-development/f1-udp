import {describe, expect, it} from 'vitest'
import {decode} from '../decoder'
import {sizeOf} from '../schema'
import {PacketHeader} from './header'
import {MarshalZone, PacketSessionData, WeatherForecastSample} from './session'

const MARSHAL_ZONES = 48
const FORECAST_SAMPLES = 156
const AFTER_FORECAST = 668

function sessionPacket(): Buffer {
    const buffer = Buffer.alloc(753)
    buffer.writeUInt16LE(2025, 0)
    buffer.writeUInt8(25, 2)
    buffer.writeUInt8(1, 3)
    buffer.writeUInt8(7, 4)
    buffer.writeUInt8(1, 5)
    buffer.writeUInt8(1, 6)
    buffer.writeBigUInt64LE(987654321098765n, 7)
    buffer.writeFloatLE(34.25, 15)
    buffer.writeUInt32LE(5000, 19)
    buffer.writeUInt32LE(5100, 23)
    buffer.writeUInt8(4, 27)
    buffer.writeUInt8(255, 28)

    buffer.writeUInt8(3, 29)
    buffer.writeInt8(-5, 30)
    buffer.writeInt8(21, 31)
    buffer.writeUInt8(57, 32)
    buffer.writeUInt16LE(5303, 33)
    buffer.writeUInt8(15, 35)
    buffer.writeInt8(-1, 36)
    buffer.writeUInt8(9, 37)
    buffer.writeUInt16LE(3600, 38)
    buffer.writeUInt16LE(7200, 40)
    buffer.writeUInt8(80, 42)
    buffer.writeUInt8(1, 43)
    buffer.writeUInt8(1, 44)
    buffer.writeUInt8(11, 45)
    buffer.writeUInt8(1, 46)
    buffer.writeUInt8(2, 47)

    buffer.writeFloatLE(0.25, MARSHAL_ZONES)
    buffer.writeInt8(3, MARSHAL_ZONES + 4)
    buffer.writeFloatLE(0.75, MARSHAL_ZONES + 20 * 5)
    buffer.writeInt8(-1, MARSHAL_ZONES + 20 * 5 + 4)

    buffer.writeUInt8(2, 153)
    buffer.writeUInt8(1, 154)
    buffer.writeUInt8(2, 155)

    buffer.set([15, 10, 4, 30, 1, 22, 2, 80], FORECAST_SAMPLES)
    buffer.writeInt8(-3, FORECAST_SAMPLES + 63 * 8 + 3)
    buffer.writeUInt8(100, FORECAST_SAMPLES + 63 * 8 + 7)

    buffer.writeUInt8(1, AFTER_FORECAST)
    buffer.writeUInt8(110, AFTER_FORECAST + 1)
    buffer.writeUInt32LE(1001, 670)
    buffer.writeUInt32LE(2002, 674)
    buffer.writeUInt32LE(3003, 678)
    buffer.writeUInt8(18, 682)
    buffer.writeUInt8(24, 683)
    buffer.writeUInt8(7, 684)
    buffer.writeUInt8(1, 685)
    buffer.writeUInt8(3, 686)
    buffer.writeUInt8(3, 687)
    buffer.writeUInt8(1, 688)
    buffer.writeUInt8(1, 689)
    buffer.writeUInt8(1, 690)
    buffer.writeUInt8(1, 691)
    buffer.writeUInt8(2, 692)
    buffer.writeUInt8(1, 693)
    buffer.writeUInt8(5, 694)
    buffer.writeUInt8(6, 695)
    buffer.writeUInt32LE(870, 696)
    buffer.writeUInt8(7, 700)
    buffer.writeUInt8(1, 701)
    buffer.writeUInt8(1, 702)
    buffer.writeUInt8(0, 703)
    buffer.writeUInt8(1, 704)
    buffer.writeUInt8(2, 705)
    buffer.writeUInt8(3, 706)
    buffer.writeUInt8(4, 707)
    buffer.writeUInt8(1, 708)
    buffer.writeUInt8(1, 731)
    buffer.writeUInt8(3, 732)
    buffer.set([10, 11, 12], 733)
    buffer.writeUInt8(99, 744)
    buffer.writeFloatLE(1500.5, 745)
    buffer.writeFloatLE(3200.25, 749)
    return buffer
}

describe('f1-25 PacketSessionData', () => {
    it('is 753 bytes with the header as in the spec', () => {
        expect(sizeOf(MarshalZone)).toBe(5)
        expect(sizeOf(WeatherForecastSample)).toBe(8)
        expect(sizeOf(PacketHeader) + sizeOf(PacketSessionData)).toBe(753)
    })

    it('decodes a session packet', () => {
        const packet = decode(sessionPacket(), 'f1-25')

        expect(packet.packetId).toBe(1)
        expect(packet.data).toMatchObject({
            weather: 3,
            trackTemperature: -5,
            airTemperature: 21,
            totalLaps: 57,
            trackLength: 5303,
            sessionType: 15,
            trackId: -1,
            formula: 9,
            sessionTimeLeft: 3600,
            sessionDuration: 7200,
            pitSpeedLimit: 80,
            gamePaused: 1,
            isSpectating: 1,
            spectatorCarIndex: 11,
            sliProNativeSupport: 1,
            numMarshalZones: 2,
            safetyCarStatus: 2,
            networkGame: 1,
            numWeatherForecastSamples: 2,
            forecastAccuracy: 1,
            aiDifficulty: 110,
            seasonLinkIdentifier: 1001,
            weekendLinkIdentifier: 2002,
            sessionLinkIdentifier: 3003,
            pitStopWindowIdealLap: 18,
            pitStopWindowLatestLap: 24,
            pitStopRejoinPosition: 7,
            gameMode: 5,
            ruleSet: 6,
            timeOfDay: 870,
            sessionLength: 7,
            equalCarPerformance: 1,
            affectsLicenceLevelMP: 1,
            numSessionsInWeekend: 3,
            sector2LapDistanceStart: 1500.5,
            sector3LapDistanceStart: 3200.25
        })
    })

    it('decodes the nested arrays', () => {
        const data = decode(sessionPacket(), 'f1-25').data as {
            marshalZones: unknown[]
            weatherForecastSamples: unknown[]
            weekendStructure: number[]
        }

        expect(data.marshalZones).toHaveLength(21)
        expect(data.marshalZones[0]).toEqual({zoneStart: 0.25, zoneFlag: 3})
        expect(data.marshalZones[20]).toEqual({zoneStart: 0.75, zoneFlag: -1})
        expect(data.weatherForecastSamples).toHaveLength(64)
        expect(data.weatherForecastSamples[0]).toEqual({
            sessionType: 15,
            timeOffset: 10,
            weather: 4,
            trackTemperature: 30,
            trackTemperatureChange: 1,
            airTemperature: 22,
            airTemperatureChange: 2,
            rainPercentage: 80
        })
        expect(data.weatherForecastSamples[63]).toMatchObject({
            trackTemperature: -3,
            rainPercentage: 100
        })
        expect(data.weekendStructure).toHaveLength(12)
        expect(data.weekendStructure.slice(0, 3)).toEqual([10, 11, 12])
        expect(data.weekendStructure[11]).toBe(99)
    })
})

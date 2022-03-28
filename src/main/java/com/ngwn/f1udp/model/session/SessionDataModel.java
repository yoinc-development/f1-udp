package com.ngwn.f1udp.model.session;

import com.ngwn.f1udp.model.PacketModel;
import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;
import java.util.List;

/**
 * This class contains the data of a SessionData packet
 * @author jth
 */
public class SessionDataModel extends PacketModel {

    private int mWeather;
    private int mTrackTemperature;
    private int mAirTemperature;
    private int mTotalLaps;
    private int mTrackLength;
    private int mSessionType;

    private int mTrackId;
    private int mFormula;

    private int mSessionTimeLeft;
    private int mSessionDuration;
    private int mPitSpeedLimit;
    private int mGamePaused;
    private int mIsSpectating;
    private int mSpectatorCarIndex;
    private int mSliProNativeSupport;
    private int mNumMarshalZones;
    private List<MarshalZoneModel> mMarshalZones;
    private int mSafetyCarStatus;

    private int mNetworkGame;
    private int mNumWeatherForecastSamples;
    private List<WeatherForecastSampleModel> mWeatherForecastSamples;
    private int mForecastAccuracy;
    private int mAiDifficulty;

    //32er block
    private int mSeasonLinkIdentifier;
    private int mWeekendLinkIdentifier;
    private int mSessionLinkIdentifier;

    private int mPitStopWindowIdealLap;
    private int mPitStopWindowLatestLap;
    private int mPitStopRejoinPosition;
    private int mSteeringAssist;
    private int mBreakingAssist;
    private int mGearboxAssist;
    private int mPitAssist;
    private int mPitreleaseAssist;
    private int mERSAssist;
    private int mDRSAssist;
    private int mDynamicRacingLine;
    private int mDynamicRacingLineType;

    public SessionDataModel(byte[] packet) {
        super(packet);

        ByteBuffer superBuffer = super.getByteBuffer();

        mWeather = TypeConverter.convertUint8(superBuffer.get());
        mTrackTemperature = TypeConverter.convertUint8(superBuffer.get());
        mAirTemperature = TypeConverter.convertUint8(superBuffer.get());
        mTotalLaps = TypeConverter.convertUint8(superBuffer.get());
        mTrackLength = TypeConverter.convertUint8(superBuffer.get());
        mSessionType = TypeConverter.convertUint8(superBuffer.get());


        mTrackId = TypeConverter.convertUint8(superBuffer.get());
        mFormula = TypeConverter.convertUint8(superBuffer.get());



    }
}

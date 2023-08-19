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

    private long mSeasonLinkIdentifier;
    private long mWeekendLinkIdentifier;
    private long mSessionLinkIdentifier;

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

        mSessionTimeLeft = TypeConverter.convertUint16(superBuffer.getShort());
        mSessionDuration = TypeConverter.convertUint16(superBuffer.getShort());
        mPitSpeedLimit = TypeConverter.convertUint8(superBuffer.get());
        mGamePaused = TypeConverter.convertUint8(superBuffer.get());
        mIsSpectating = TypeConverter.convertUint8(superBuffer.get());
        mSpectatorCarIndex = TypeConverter.convertUint8(superBuffer.get());
        mSliProNativeSupport = TypeConverter.convertUint8(superBuffer.get());
        mNumMarshalZones = TypeConverter.convertUint8(superBuffer.get());
        for(int counter = 0; counter < getmNumMarshalZones(); counter++) {
            MarshalZoneModel marshalZoneModel = new MarshalZoneModel(superBuffer);
            mMarshalZones.add(marshalZoneModel);
        }
        mSafetyCarStatus = TypeConverter.convertUint8(superBuffer.get());

        mNetworkGame = TypeConverter.convertUint8(superBuffer.get());
        mNumWeatherForecastSamples = TypeConverter.convertUint8(superBuffer.get());
        for(int counter = 0; counter < getmNumWeatherForecastSamples(); counter++) {
            WeatherForecastSampleModel weatherForecastSampleModel = new WeatherForecastSampleModel(superBuffer);
            mWeatherForecastSamples.add(weatherForecastSampleModel);
        }
        mForecastAccuracy = TypeConverter.convertUint8(superBuffer.get());
        mAiDifficulty = TypeConverter.convertUint8(superBuffer.get());

        mSeasonLinkIdentifier = TypeConverter.convertUint32(superBuffer.get());
        mWeekendLinkIdentifier = TypeConverter.convertUint32(superBuffer.get());
        mSessionLinkIdentifier = TypeConverter.convertUint32(superBuffer.get());

        mPitStopWindowIdealLap = TypeConverter.convertUint8(superBuffer.get());
        mPitStopWindowLatestLap = TypeConverter.convertUint8(superBuffer.get());
        mPitStopRejoinPosition = TypeConverter.convertUint8(superBuffer.get());
        mSteeringAssist = TypeConverter.convertUint8(superBuffer.get());
        mBreakingAssist = TypeConverter.convertUint8(superBuffer.get());
        mGearboxAssist = TypeConverter.convertUint8(superBuffer.get());
        mPitAssist = TypeConverter.convertUint8(superBuffer.get());
        mPitreleaseAssist = TypeConverter.convertUint8(superBuffer.get());
        mERSAssist = TypeConverter.convertUint8(superBuffer.get());
        mDRSAssist = TypeConverter.convertUint8(superBuffer.get());
        mDynamicRacingLine = TypeConverter.convertUint8(superBuffer.get());
        mDynamicRacingLineType = TypeConverter.convertUint8(superBuffer.get());

    }

    public SessionDataModel() { }

    public ByteBuffer readData(ByteBuffer byteBuffer) {
        mWeather = TypeConverter.convertUint8(byteBuffer.get());
        mTrackTemperature = TypeConverter.convertUint8(byteBuffer.get());
        mAirTemperature = TypeConverter.convertUint8(byteBuffer.get());
        mTotalLaps = TypeConverter.convertUint8(byteBuffer.get());
        mTrackLength = TypeConverter.convertUint8(byteBuffer.get());
        mSessionType = TypeConverter.convertUint8(byteBuffer.get());

        mTrackId = TypeConverter.convertUint8(byteBuffer.get());
        mFormula = TypeConverter.convertUint8(byteBuffer.get());

        mSessionTimeLeft = TypeConverter.convertUint16(byteBuffer.getShort());
        mSessionDuration = TypeConverter.convertUint16(byteBuffer.getShort());
        mPitSpeedLimit = TypeConverter.convertUint8(byteBuffer.get());
        mGamePaused = TypeConverter.convertUint8(byteBuffer.get());
        mIsSpectating = TypeConverter.convertUint8(byteBuffer.get());
        mSpectatorCarIndex = TypeConverter.convertUint8(byteBuffer.get());
        mSliProNativeSupport = TypeConverter.convertUint8(byteBuffer.get());
        mNumMarshalZones = TypeConverter.convertUint8(byteBuffer.get());
        for(int counter = 0; counter < getmNumMarshalZones(); counter++) {
            MarshalZoneModel marshalZoneModel = new MarshalZoneModel(byteBuffer);
            mMarshalZones.add(marshalZoneModel);
        }
        mSafetyCarStatus = TypeConverter.convertUint8(byteBuffer.get());

        mNetworkGame = TypeConverter.convertUint8(byteBuffer.get());
        mNumWeatherForecastSamples = TypeConverter.convertUint8(byteBuffer.get());
        for(int counter = 0; counter < getmNumWeatherForecastSamples(); counter++) {
            WeatherForecastSampleModel weatherForecastSampleModel = new WeatherForecastSampleModel(byteBuffer);
            mWeatherForecastSamples.add(weatherForecastSampleModel);
        }
        mForecastAccuracy = TypeConverter.convertUint8(byteBuffer.get());
        mAiDifficulty = TypeConverter.convertUint8(byteBuffer.get());

        mSeasonLinkIdentifier = TypeConverter.convertUint32(byteBuffer.get());
        mWeekendLinkIdentifier = TypeConverter.convertUint32(byteBuffer.get());
        mSessionLinkIdentifier = TypeConverter.convertUint32(byteBuffer.get());

        mPitStopWindowIdealLap = TypeConverter.convertUint8(byteBuffer.get());
        mPitStopWindowLatestLap = TypeConverter.convertUint8(byteBuffer.get());
        mPitStopRejoinPosition = TypeConverter.convertUint8(byteBuffer.get());
        mSteeringAssist = TypeConverter.convertUint8(byteBuffer.get());
        mBreakingAssist = TypeConverter.convertUint8(byteBuffer.get());
        mGearboxAssist = TypeConverter.convertUint8(byteBuffer.get());
        mPitAssist = TypeConverter.convertUint8(byteBuffer.get());
        mPitreleaseAssist = TypeConverter.convertUint8(byteBuffer.get());
        mERSAssist = TypeConverter.convertUint8(byteBuffer.get());
        mDRSAssist = TypeConverter.convertUint8(byteBuffer.get());
        mDynamicRacingLine = TypeConverter.convertUint8(byteBuffer.get());
        mDynamicRacingLineType = TypeConverter.convertUint8(byteBuffer.get());

        return byteBuffer;
    }

    public int getmWeather() {
        return mWeather;
    }

    public void setmWeather(int mWeather) {
        this.mWeather = mWeather;
    }

    public int getmTrackTemperature() {
        return mTrackTemperature;
    }

    public void setmTrackTemperature(int mTrackTemperature) {
        this.mTrackTemperature = mTrackTemperature;
    }

    public int getmAirTemperature() {
        return mAirTemperature;
    }

    public void setmAirTemperature(int mAirTemperature) {
        this.mAirTemperature = mAirTemperature;
    }

    public int getmTotalLaps() {
        return mTotalLaps;
    }

    public void setmTotalLaps(int mTotalLaps) {
        this.mTotalLaps = mTotalLaps;
    }

    public int getmTrackLength() {
        return mTrackLength;
    }

    public void setmTrackLength(int mTrackLength) {
        this.mTrackLength = mTrackLength;
    }

    public int getmSessionType() {
        return mSessionType;
    }

    public void setmSessionType(int mSessionType) {
        this.mSessionType = mSessionType;
    }

    public int getmTrackId() {
        return mTrackId;
    }

    public void setmTrackId(int mTrackId) {
        this.mTrackId = mTrackId;
    }

    public int getmFormula() {
        return mFormula;
    }

    public void setmFormula(int mFormula) {
        this.mFormula = mFormula;
    }

    public int getmSessionTimeLeft() {
        return mSessionTimeLeft;
    }

    public void setmSessionTimeLeft(int mSessionTimeLeft) {
        this.mSessionTimeLeft = mSessionTimeLeft;
    }

    public int getmSessionDuration() {
        return mSessionDuration;
    }

    public void setmSessionDuration(int mSessionDuration) {
        this.mSessionDuration = mSessionDuration;
    }

    public int getmPitSpeedLimit() {
        return mPitSpeedLimit;
    }

    public void setmPitSpeedLimit(int mPitSpeedLimit) {
        this.mPitSpeedLimit = mPitSpeedLimit;
    }

    public int getmGamePaused() {
        return mGamePaused;
    }

    public void setmGamePaused(int mGamePaused) {
        this.mGamePaused = mGamePaused;
    }

    public int getmIsSpectating() {
        return mIsSpectating;
    }

    public void setmIsSpectating(int mIsSpectating) {
        this.mIsSpectating = mIsSpectating;
    }

    public int getmSpectatorCarIndex() {
        return mSpectatorCarIndex;
    }

    public void setmSpectatorCarIndex(int mSpectatorCarIndex) {
        this.mSpectatorCarIndex = mSpectatorCarIndex;
    }

    public int getmSliProNativeSupport() {
        return mSliProNativeSupport;
    }

    public void setmSliProNativeSupport(int mSliProNativeSupport) {
        this.mSliProNativeSupport = mSliProNativeSupport;
    }

    public int getmNumMarshalZones() {
        return mNumMarshalZones;
    }

    public void setmNumMarshalZones(int mNumMarshalZones) {
        this.mNumMarshalZones = mNumMarshalZones;
    }

    public List<MarshalZoneModel> getmMarshalZones() {
        return mMarshalZones;
    }

    public void setmMarshalZones(List<MarshalZoneModel> mMarshalZones) {
        this.mMarshalZones = mMarshalZones;
    }

    public int getmSafetyCarStatus() {
        return mSafetyCarStatus;
    }

    public void setmSafetyCarStatus(int mSafetyCarStatus) {
        this.mSafetyCarStatus = mSafetyCarStatus;
    }

    public int getmNetworkGame() {
        return mNetworkGame;
    }

    public void setmNetworkGame(int mNetworkGame) {
        this.mNetworkGame = mNetworkGame;
    }

    public int getmNumWeatherForecastSamples() {
        return mNumWeatherForecastSamples;
    }

    public void setmNumWeatherForecastSamples(int mNumWeatherForecastSamples) {
        this.mNumWeatherForecastSamples = mNumWeatherForecastSamples;
    }

    public List<WeatherForecastSampleModel> getmWeatherForecastSamples() {
        return mWeatherForecastSamples;
    }

    public void setmWeatherForecastSamples(List<WeatherForecastSampleModel> mWeatherForecastSamples) {
        this.mWeatherForecastSamples = mWeatherForecastSamples;
    }

    public int getmForecastAccuracy() {
        return mForecastAccuracy;
    }

    public void setmForecastAccuracy(int mForecastAccuracy) {
        this.mForecastAccuracy = mForecastAccuracy;
    }

    public int getmAiDifficulty() {
        return mAiDifficulty;
    }

    public void setmAiDifficulty(int mAiDifficulty) {
        this.mAiDifficulty = mAiDifficulty;
    }

    public long getmSeasonLinkIdentifier() {
        return mSeasonLinkIdentifier;
    }

    public void setmSeasonLinkIdentifier(long mSeasonLinkIdentifier) {
        this.mSeasonLinkIdentifier = mSeasonLinkIdentifier;
    }

    public long getmWeekendLinkIdentifier() {
        return mWeekendLinkIdentifier;
    }

    public void setmWeekendLinkIdentifier(long mWeekendLinkIdentifier) {
        this.mWeekendLinkIdentifier = mWeekendLinkIdentifier;
    }

    public long getmSessionLinkIdentifier() {
        return mSessionLinkIdentifier;
    }

    public void setmSessionLinkIdentifier(long mSessionLinkIdentifier) {
        this.mSessionLinkIdentifier = mSessionLinkIdentifier;
    }

    public int getmPitStopWindowIdealLap() {
        return mPitStopWindowIdealLap;
    }

    public void setmPitStopWindowIdealLap(int mPitStopWindowIdealLap) {
        this.mPitStopWindowIdealLap = mPitStopWindowIdealLap;
    }

    public int getmPitStopWindowLatestLap() {
        return mPitStopWindowLatestLap;
    }

    public void setmPitStopWindowLatestLap(int mPitStopWindowLatestLap) {
        this.mPitStopWindowLatestLap = mPitStopWindowLatestLap;
    }

    public int getmPitStopRejoinPosition() {
        return mPitStopRejoinPosition;
    }

    public void setmPitStopRejoinPosition(int mPitStopRejoinPosition) {
        this.mPitStopRejoinPosition = mPitStopRejoinPosition;
    }

    public int getmSteeringAssist() {
        return mSteeringAssist;
    }

    public void setmSteeringAssist(int mSteeringAssist) {
        this.mSteeringAssist = mSteeringAssist;
    }

    public int getmBreakingAssist() {
        return mBreakingAssist;
    }

    public void setmBreakingAssist(int mBreakingAssist) {
        this.mBreakingAssist = mBreakingAssist;
    }

    public int getmGearboxAssist() {
        return mGearboxAssist;
    }

    public void setmGearboxAssist(int mGearboxAssist) {
        this.mGearboxAssist = mGearboxAssist;
    }

    public int getmPitAssist() {
        return mPitAssist;
    }

    public void setmPitAssist(int mPitAssist) {
        this.mPitAssist = mPitAssist;
    }

    public int getmPitreleaseAssist() {
        return mPitreleaseAssist;
    }

    public void setmPitreleaseAssist(int mPitreleaseAssist) {
        this.mPitreleaseAssist = mPitreleaseAssist;
    }

    public int getmERSAssist() {
        return mERSAssist;
    }

    public void setmERSAssist(int mERSAssist) {
        this.mERSAssist = mERSAssist;
    }

    public int getmDRSAssist() {
        return mDRSAssist;
    }

    public void setmDRSAssist(int mDRSAssist) {
        this.mDRSAssist = mDRSAssist;
    }

    public int getmDynamicRacingLine() {
        return mDynamicRacingLine;
    }

    public void setmDynamicRacingLine(int mDynamicRacingLine) {
        this.mDynamicRacingLine = mDynamicRacingLine;
    }

    public int getmDynamicRacingLineType() {
        return mDynamicRacingLineType;
    }

    public void setmDynamicRacingLineType(int mDynamicRacingLineType) {
        this.mDynamicRacingLineType = mDynamicRacingLineType;
    }

    @Override
    public String toString(){

        StringBuilder marshalZones = new StringBuilder();
        for(MarshalZoneModel z : getmMarshalZones()) {
            marshalZones.append(z.toString());
            marshalZones.append("\n");
        }

        StringBuilder weatherForecastSamples = new StringBuilder();
        for(WeatherForecastSampleModel w : getmWeatherForecastSamples()) {
            weatherForecastSamples.append(w.toString());
            weatherForecastSamples.append("\n");
        }

        return "Weather: " + getmWeather() + "\n"
                + "Track Temperature: " + getmTrackTemperature() + "\n"
                + "Air Temperature: " + getmAirTemperature() + "\n"
                + "Total Laps: " + getmTotalLaps() + "\n"
                + "Track Length: " + getmTrackLength() + "\n"
                + "Session Type: " + getmSessionType() + "\n"
                + "Track Id: " + getmTrackId() + "\n"
                + "Formula: " + getmFormula() + "\n"
                + "Session Time Left: " + getmSessionTimeLeft() + "\n"
                + "Session Duration: " + getmSessionDuration() + "\n"
                + "Pitspeed Limit: " + getmPitSpeedLimit() + "\n"
                + "Game Paused: " + getmGamePaused() + "\n"
                + "Is Spectating: " + getmIsSpectating() + "\n"
                + "Spectator Car Index: " + getmSpectatorCarIndex() + "\n"
                + "SliProNativeSupport: " + getmSliProNativeSupport() + "\n"
                + "Num Marshal Zones: " + getmNumMarshalZones() + "\n"
                + "Marshal Zones: ( " + marshalZones.toString() + " )\n"
                + "Safety Car Status: " + getmSafetyCarStatus() + "\n"
                + "Network Game: " + getmNetworkGame() + "\n"
                + "Num Weather Forecast Samples: " + getmNumWeatherForecastSamples() + "\n"
                + "Weather Forecast Samples: ( " + weatherForecastSamples.toString() + " )\n"
                + "Forecast Accuracy: " + getmForecastAccuracy() + "\n"
                + "AI Difficulty: " + getmAiDifficulty() + "\n"
                + "Season Link Identifier: " + getmSeasonLinkIdentifier() + "\n"
                + "Weekend Link Identifier: " + getmWeekendLinkIdentifier() + "\n"
                + "Session Link Identifier: " + getmSessionLinkIdentifier() + "\n"
                + "Pit Stop Window Ideal Lap: " + getmPitStopWindowIdealLap() + "\n"
                + "Pit Stop Window Lastest Lap: " + getmPitStopWindowLatestLap() + "\n"
                + "Pit Stop Rejoin Position: " + getmPitStopRejoinPosition() + "\n"
                + "Steering Assist: " + getmSteeringAssist() + "\n"
                + "Breaking Assist: " + getmBreakingAssist() + "\n"
                + "Gearbox Assist: " + getmGearboxAssist() + "\n"
                + "Pit Assist: " + getmPitAssist() + "\n"
                + "Pit Release Assist: " + getmPitreleaseAssist() + "\n"
                + "ERS Assist: " + getmERSAssist() + "\n"
                + "DRS Assist: " + getmDRSAssist() + "\n"
                + "Dynamic Racing Line: " + getmDynamicRacingLine() + "\n"
                + "Dynamic Racing Line Type: " + getmDynamicRacingLineType() + "\n";
    }
}

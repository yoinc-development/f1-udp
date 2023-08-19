package com.ngwn.f1udp.model.session;

import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;

/**
 * This class contains the data of a WeatherForecastSample attribute
 * @author jth
 */
public class WeatherForecastSampleModel {

    private int mSessionType;
    private int mTimeOffset;
    private int mWeather;
    private int mTrackTemperature;
    private int mTrackTemperatureChange;
    private int mAirTemperature;
    private int mAirTemperatureChange;
    private int mRainPercentage;

    public WeatherForecastSampleModel(ByteBuffer superBuffer) {
        mSessionType = TypeConverter.convertUint8(superBuffer.get());
        mTimeOffset = TypeConverter.convertUint8(superBuffer.get());
        mWeather = TypeConverter.convertUint8(superBuffer.get());
        mTrackTemperature = TypeConverter.convertUint8(superBuffer.get());
        mTrackTemperatureChange = TypeConverter.convertUint8(superBuffer.get());
        mAirTemperature = TypeConverter.convertUint8(superBuffer.get());
        mAirTemperatureChange = TypeConverter.convertUint8(superBuffer.get());
        mRainPercentage = TypeConverter.convertUint8(superBuffer.get());
    }

    public WeatherForecastSampleModel() { }

    public ByteBuffer readData(ByteBuffer superBuffer) {
        mSessionType = TypeConverter.convertUint8(superBuffer.get());
        mTimeOffset = TypeConverter.convertUint8(superBuffer.get());
        mWeather = TypeConverter.convertUint8(superBuffer.get());
        mTrackTemperature = TypeConverter.convertUint8(superBuffer.get());
        mTrackTemperatureChange = TypeConverter.convertUint8(superBuffer.get());
        mAirTemperature = TypeConverter.convertUint8(superBuffer.get());
        mAirTemperatureChange = TypeConverter.convertUint8(superBuffer.get());
        mRainPercentage = TypeConverter.convertUint8(superBuffer.get());
        return superBuffer;
    }

    public int getmSessionType() {
        return mSessionType;
    }

    public void setmSessionType(int mSessionType) {
        this.mSessionType = mSessionType;
    }

    public int getmTimeOffset() {
        return mTimeOffset;
    }

    public void setmTimeOffset(int mTimeOffset) {
        this.mTimeOffset = mTimeOffset;
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

    public int getmTrackTemperatureChange() {
        return mTrackTemperatureChange;
    }

    public void setmTrackTemperatureChange(int mTrackTemperatureChange) {
        this.mTrackTemperatureChange = mTrackTemperatureChange;
    }

    public int getmAirTemperature() {
        return mAirTemperature;
    }

    public void setmAirTemperature(int mAirTemperature) {
        this.mAirTemperature = mAirTemperature;
    }

    public int getmAirTemperatureChange() {
        return mAirTemperatureChange;
    }

    public void setmAirTemperatureChange(int mAirTemperatureChange) {
        this.mAirTemperatureChange = mAirTemperatureChange;
    }

    public int getmRainPercentage() {
        return mRainPercentage;
    }

    public void setmRainPercentage(int mRainPercentage) {
        this.mRainPercentage = mRainPercentage;
    }

    @Override
    public String toString(){

        return "Session Type: " + getmSessionType() + "\n"
                + "Time Offset: " + getmTimeOffset() + "\n"
                + "Weather: " + getmWeather() + "\n"
                + "Track Temperature: " + getmTrackTemperature() + "\n"
                + "Track Temperature Change: " + getmTrackTemperatureChange() + "\n"
                + "Air Temperature: " + getmAirTemperature() + "\n"
                + "Air Temperature Change: " + getmAirTemperatureChange() + "\n"
                + "Rain Percentage: " + getmRainPercentage() + "\n";
    }
}

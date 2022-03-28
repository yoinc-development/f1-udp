package com.ngwn.f1udp.model.session;

import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;

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
}

package com.ngwn.f1udp.model.lapdata;

import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;

public class LapDataModel {
    int   mLastLapTimeInMS;
    int   mCurrentLapTimeInMS;
    int   mSector1TimeInMS;
    int   mSector2TimeInMS;
    float    mLapDistance;
    float    mTotalDistance;
    float    mSafetyCarDelta;
    short    mCarPosition;
    short    mCurrentLapNum;
    short    mPitStatus;
    short    mNumPitStops;
    short    mSector;
    short    mCurrentLapInvalid;
    short    mPenalties;
    short    mWarnings;
    short    mNumUnservedDriveThroughPens;
    short    mNumUnservedStopGoPens;
    short    mGridPosition;
    short    mDriverStatus;
    short    mResultStatus;
    short    mPitLaneTimerActive;
    int   mPitLaneTimeInLaneInMS;
    int   mPitStopTimerInMS;
    short    mPitStopShouldServePen;

    public LapDataModel(ByteBuffer superBuffer) {
        mLastLapTimeInMS = superBuffer.getInt();
        mCurrentLapTimeInMS = superBuffer.getInt();
        mSector1TimeInMS = TypeConverter.convertUint16(superBuffer.getShort());
        mSector2TimeInMS = TypeConverter.convertUint16(superBuffer.getShort());
        mLapDistance = superBuffer.getFloat();
        mTotalDistance = superBuffer.getFloat();
        mSafetyCarDelta = superBuffer.getFloat();
        mCarPosition = TypeConverter.convertUint8(superBuffer.get());
        mCurrentLapNum = TypeConverter.convertUint8(superBuffer.get());
        mPitStatus = TypeConverter.convertUint8(superBuffer.get());
        mNumPitStops = TypeConverter.convertUint8(superBuffer.get());
        mSector = TypeConverter.convertUint8(superBuffer.get());
        mCurrentLapInvalid = TypeConverter.convertUint8(superBuffer.get());
        mPenalties = TypeConverter.convertUint8(superBuffer.get());
        mWarnings = TypeConverter.convertUint8(superBuffer.get());
        mNumUnservedDriveThroughPens = TypeConverter.convertUint8(superBuffer.get());
        mNumUnservedStopGoPens = TypeConverter.convertUint8(superBuffer.get());
        mGridPosition = TypeConverter.convertUint8(superBuffer.get());
        mDriverStatus = TypeConverter.convertUint8(superBuffer.get());
        mResultStatus = TypeConverter.convertUint8(superBuffer.get());
        mPitLaneTimerActive = TypeConverter.convertUint8(superBuffer.get());
        mPitLaneTimeInLaneInMS = TypeConverter.convertUint16(superBuffer.getShort());
        mPitStopTimerInMS = TypeConverter.convertUint16(superBuffer.getShort());
        mPitStopShouldServePen = TypeConverter.convertUint8(superBuffer.get());
    }

    public int getmLastLapTimeInMS() {
        return mLastLapTimeInMS;
    }

    public int getmCurrentLapTimeInMS() {
        return mCurrentLapTimeInMS;
    }

    public int getmSector1TimeInMS() {
        return mSector1TimeInMS;
    }

    public int getmSector2TimeInMS() {
        return mSector2TimeInMS;
    }

    public float getmLapDistance() {
        return mLapDistance;
    }

    public float getmTotalDistance() {
        return mTotalDistance;
    }

    public float getmSafetyCarDelta() {
        return mSafetyCarDelta;
    }

    public short getmCarPosition() {
        return mCarPosition;
    }

    public short getmCurrentLapNum() {
        return mCurrentLapNum;
    }

    public short getmPitStatus() {
        return mPitStatus;
    }

    public short getmNumPitStops() {
        return mNumPitStops;
    }

    public short getmSector() {
        return mSector;
    }

    public short getmCurrentLapInvalid() {
        return mCurrentLapInvalid;
    }

    public short getmPenalties() {
        return mPenalties;
    }

    public short getmWarnings() {
        return mWarnings;
    }

    public short getmNumUnservedDriveThroughPens() {
        return mNumUnservedDriveThroughPens;
    }

    public short getmNumUnservedStopGoPens() {
        return mNumUnservedStopGoPens;
    }

    public short getmGridPosition() {
        return mGridPosition;
    }

    public short getmDriverStatus() {
        return mDriverStatus;
    }

    public short getmResultStatus() {
        return mResultStatus;
    }

    public short getmPitLaneTimerActive() {
        return mPitLaneTimerActive;
    }

    public int getmPitLaneTimeInLaneInMS() {
        return mPitLaneTimeInLaneInMS;
    }

    public int getmPitStopTimerInMS() {
        return mPitStopTimerInMS;
    }

    public short getmPitStopShouldServePen() {
        return mPitStopShouldServePen;
    }
    @Override
    public String toString() {
        return "lastLapTime: " + getmLastLapTimeInMS() + "\n"
                + "currentLapTime: " + getmCurrentLapTimeInMS() + "\n"
                + "sector1Time: " + getmSector1TimeInMS() + "\n"
                + "sector2Time: " + getmSector2TimeInMS() + "\n"
                + "lapDistance: " + getmLapDistance() + "\n"
                + "totalDistance: " + getmTotalDistance() + "\n"
                + "safetyCarDelta: " + getmSafetyCarDelta() + "\n"
                + "carPosition: " + getmCarPosition() + "\n"
                + "currentLapNum: " + getmCurrentLapNum() + "\n"
                + "pitStatus: " + getmPitStatus() + "\n"
                + "numPitStops: " + getmNumPitStops() + "\n"
                + "sector: " + getmSector() + "\n"
                + "currentLapInvalid: " + getmCurrentLapInvalid() + "\n"
                + "penalties: " + getmPenalties() + "\n"
                + "warnings: " + getmWarnings() + "\n"
                + "numUnservedDriveThroughPens: " + getmNumUnservedDriveThroughPens() + "\n"
                + "numUnservedStopGoPens: " + getmNumUnservedStopGoPens() + "\n"
                + "gridPosition: " + getmGridPosition() + "\n"
                + "driverStatus: " + getmDriverStatus() + "\n"
                + "resultStatus: " + getmResultStatus() + "\n"
                + "pitLaneTimerActive: " + getmPitLaneTimerActive() + "\n"
                + "pitLaneTimeInLane: " + getmPitLaneTimeInLaneInMS() + "\n"
                + "pitStopTimer: " + getmPitStopTimerInMS() + "\n"
                + "pitStopShouldServePen: " + getmPitStopShouldServePen() + "\n";
    }
}

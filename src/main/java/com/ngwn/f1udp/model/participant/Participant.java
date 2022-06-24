package com.ngwn.f1udp.model.participant;

import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;

/**
 * This class contains the data of a Participant
 * @author aatha-sivas
 */
public class Participant {
    public int mAIcontrolled;
    public int mDriverId;
    public int mNetworkId;
    public int mTeamId;
    public int mMyTeam;
    public int mRaceNumber;
    public int mNationality;
    public String mName;
    public int mTelemetry;

    public static final int NAME_BYTE_LENGTH = 48;

    /**
     * Class constructor, reads all data from the ByteBuffer
     * @param superBuffer bytebuffer - The same ByteBuffer after reading the header data
     */
    public Participant(ByteBuffer superBuffer) {
        mAIcontrolled = TypeConverter.convertUint8(superBuffer.get());
        mDriverId = TypeConverter.convertUint8(superBuffer.get());
        mNetworkId = TypeConverter.convertUint8(superBuffer.get());
        mTeamId = TypeConverter.convertUint8(superBuffer.get());
        mMyTeam = TypeConverter.convertUint8(superBuffer.get());
        mRaceNumber = TypeConverter.convertUint8(superBuffer.get());
        mNationality = TypeConverter.convertUint8(superBuffer.get());
        mName = computeName(superBuffer);
        mTelemetry = TypeConverter.convertUint8(superBuffer.get());
    }

    /**
     * Computes the name from the next {@link Participant#NAME_BYTE_LENGTH} bytes
     * @param superBuffer ByteBuffer - which is at the correct position
     * @return {@link Participant#mName} - the name of the participant
     */
    private String computeName(ByteBuffer superBuffer) {
        byte[] stringByte = new byte[NAME_BYTE_LENGTH];

        for (int i = 0; i < NAME_BYTE_LENGTH; i++) {
            stringByte[i] = superBuffer.get();
        }

        return new String(stringByte).trim();
    }

    public int getmAIcontrolled() {
        return mAIcontrolled;
    }

    public void setmAIcontrolled(int mAIcontrolled) {
        this.mAIcontrolled = mAIcontrolled;
    }

    public int getmDriverId() {
        return mDriverId;
    }

    public void setmDriverId(int mDriverId) {
        this.mDriverId = mDriverId;
    }

    public int getmNetworkId() {
        return mNetworkId;
    }

    public void setmNetworkId(int mNetworkId) {
        this.mNetworkId = mNetworkId;
    }

    public int getmTeamId() {
        return mTeamId;
    }

    public void setmTeamId(int mTeamId) {
        this.mTeamId = mTeamId;
    }

    public int getmMyTeam() {
        return mMyTeam;
    }

    public void setmMyTeam(int mMyTeam) {
        this.mMyTeam = mMyTeam;
    }

    public int getmRaceNumber() {
        return mRaceNumber;
    }

    public void setmRaceNumber(int mRaceNumber) {
        this.mRaceNumber = mRaceNumber;
    }

    public int getmNationality() {
        return mNationality;
    }

    public void setmNationality(int mNationality) {
        this.mNationality = mNationality;
    }

    public String getmName() {
        return mName;
    }

    public void setmName(String mName) {
        this.mName = mName;
    }

    public int getmTelemetry() {
        return mTelemetry;
    }

    public void setmTelemetry(int mTelemetry) {
        this.mTelemetry = mTelemetry;
    }

    @Override
    public String toString(){
        return "AI: " + getmAIcontrolled() + "\n"
                + "DriverId: " + getmDriverId() + "\n"
                + "TeamId: " + getmTeamId() + "\n"
                + "MyTeam: " + getmMyTeam() + "\n"
                + "RaceNumber: " + getmRaceNumber() + "\n"
                + "Nationality: " + getmNationality() + "\n"
                + "Name: " + getmName() + "\n";
    }
}

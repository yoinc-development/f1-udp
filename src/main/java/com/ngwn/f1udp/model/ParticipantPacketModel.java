package com.ngwn.f1udp.model;

import com.ngwn.f1udp.utils.TypeConverter;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Arrays;

public class ParticipantPacketModel extends PacketModel {

    public int mAIcontrolled;
    public int mDriverId;
    public int mNetworkId;
    public int mTeamId;
    public int mMyTeam;
    public int mRaceNumber;
    public int mNationality;
    public String mName;
    public int mTelemetry;

    public ParticipantPacketModel(byte[] packet) {
        super(packet);
        ByteBuffer superBuffer = super.getByteBuffer();

        mAIcontrolled = TypeConverter.convertUint8(superBuffer.get());
        mDriverId = TypeConverter.convertUint8(superBuffer.get());
        mNetworkId = TypeConverter.convertUint8(superBuffer.get());
        mTeamId = TypeConverter.convertUint8(superBuffer.get());
        mMyTeam = TypeConverter.convertUint8(superBuffer.get());
        mRaceNumber = TypeConverter.convertUint8(superBuffer.get());
        mNationality = TypeConverter.convertUint8(superBuffer.get());
        try {
            //TODO fix this.
            String tempName = new String(Arrays.copyOfRange(packet, 40, 53), "UTF-8");
            int preNameLength = tempName.split("O")[0].length();
            mName = tempName.substring(preNameLength);
        } catch (UnsupportedEncodingException ex) {
            mName = "unknown";
        }
        mTelemetry = TypeConverter.convertUint8(superBuffer.get());

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
        return "DriverId: " + getmDriverId() + "\n"
            + "TeamId: " + getmTeamId() + "\n"
            + "MyTeam: " + getmMyTeam() + "\n"
            + "RaceNumber: " + getmRaceNumber() + "\n"
            + "Nationality: " + getmNationality() + "\n"
            + "Name: " + getmName() + "\n";
    }
}

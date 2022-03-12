package com.ngwn.f1udp.model;

import com.ngwn.f1udp.utils.TypeConverter;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class PacketModel {

    public static int HEADER_SIZE = 21;
    public static int PACKET_FORMAT = 2018;

    private ByteBuffer byteBuffer;
    private int mPacketFormat;
    private short mGameMajorVersion;
    private short mGameMinorVersion;
    private short mPacketVersion;
    private short mPacketId;
    private BigInteger mSessionUID;
    private float mSessionTime;
    private short mFrameIdentifier;
    private short mPlayerCarIndex;
    private short mSecondaryCarIndex;

    public PacketModel(byte[] packet) {
        byteBuffer = ByteBuffer.wrap(packet);
        byteBuffer.order(ByteOrder.LITTLE_ENDIAN);

        mPacketFormat = TypeConverter.convertUint16(byteBuffer.getShort());
        mGameMajorVersion = TypeConverter.convertUint8(byteBuffer.get());
        mGameMinorVersion = TypeConverter.convertUint8(byteBuffer.get());
        mPacketVersion = TypeConverter.convertUint8(byteBuffer.get());
        mPacketId = TypeConverter.convertUint8(byteBuffer.get());
        mSessionUID = TypeConverter.convertUint64(byteBuffer.getLong());
        mSessionTime = TypeConverter.convertUint8(byteBuffer.get());
        //mFrameIdentifier = TypeConverter.convertUint32(byteBuffer.get());
        mPlayerCarIndex = TypeConverter.convertUint8(byteBuffer.get());
        mSecondaryCarIndex = TypeConverter.convertUint8(byteBuffer.get());

    }

    public int getmPacketFormat() {
        return mPacketFormat;
    }

    public void setmPacketFormat(int mPacketFormat) {
        this.mPacketFormat = mPacketFormat;
    }

    public int getmGameMajorVersion() {
        return mGameMajorVersion;
    }

    public void setmGameMajorVersion(short mGameMajorVersion) {
        this.mGameMajorVersion = mGameMajorVersion;
    }

    public short getmGameMinorVersion() {
        return mGameMinorVersion;
    }

    public void setmGameMinorVersion(short mGameMinorVersion) {
        this.mGameMinorVersion = mGameMinorVersion;
    }

    public short getmPacketVersion() {
        return mPacketVersion;
    }

    public void setmPacketVersion(short mPacketVersion) {
        this.mPacketVersion = mPacketVersion;
    }

    public short getmPacketId() {
        return mPacketId;
    }

    public void setmPacketId(short mPacketId) {
        this.mPacketId = mPacketId;
    }

    public BigInteger getmSessionUID() {
        return mSessionUID;
    }

    public void setmSessionUID(BigInteger mSessionUID) {
        this.mSessionUID = mSessionUID;
    }

    public float getmSessionTime() {
        return mSessionTime;
    }

    public void setmSessionTime(float mSessionTime) {
        this.mSessionTime = mSessionTime;
    }

    public short getmFrameIdentifier() {
        return mFrameIdentifier;
    }

    public void setmFrameIdentifier(short mFrameIdentifier) {
        this.mFrameIdentifier = mFrameIdentifier;
    }

    public short getmPlayerCarIndex() {
        return mPlayerCarIndex;
    }

    public void setmPlayerCarIndex(short mPlayerCarIndex) {
        this.mPlayerCarIndex = mPlayerCarIndex;
    }

    public ByteBuffer getByteBuffer() {
        return byteBuffer;
    }

    public void setByteBuffer(ByteBuffer byteBuffer) {
        this.byteBuffer = byteBuffer;
    }

    public short getmSecondaryCarIndex() {
        return mSecondaryCarIndex;
    }

    public void setmSecondaryCarIndex(short mSecondaryCarIndex) {
        this.mSecondaryCarIndex = mSecondaryCarIndex;
    }
}

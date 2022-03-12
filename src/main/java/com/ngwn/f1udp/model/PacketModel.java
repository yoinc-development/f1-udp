package com.ngwn.f1udp.model;

import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class PacketModel {

    public static int HEADER_SIZE = 21;
    public static int PACKET_FORMAT = 2018;

    public int mPacketFormat;
    public int mGameMajorVersion;
    public int mGameMinorVersion;
    public int mPacketVersion;
    public int mPacketId;
    public int mSessionUID;
    public float mSessionTime;
    public int mFrameIdentifier;
    public int mPlayerCarIndex;

    public PacketModel(byte[] packet) {
        ByteBuffer byteBuffer = ByteBuffer.wrap(packet);
        byteBuffer.order(ByteOrder.LITTLE_ENDIAN);

        mPacketFormat = TypeConverter.convertUint16(byteBuffer.getShort());
        mGameMajorVersion = byteBuffer.get();
        mGameMinorVersion = byteBuffer.get();
        mPacketVersion = byteBuffer.get();
        mPacketId = byteBuffer.get();
        mSessionUID = TypeConverter.convertUint64(byteBuffer.getShort());
        mSessionTime = byteBuffer.getFloat();
        mFrameIdentifier = byteBuffer.get();
        mPlayerCarIndex = byteBuffer.get();

    }
}

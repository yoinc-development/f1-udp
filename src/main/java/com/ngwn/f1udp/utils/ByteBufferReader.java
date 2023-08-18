package com.ngwn.f1udp.utils;

import java.math.BigInteger;
import java.nio.ByteBuffer;

public class ByteBufferReader {

    /**
     * Reads the next eight bytes at the buffer's current position,
     * composing them into a {@link BigInteger} value according to the little endian byte order,
     * and then increments the position by eight.
     * @param byteBuffer ByteBuffer - which is at the correct position
     * @return The BigInteger converted from the eight bytes
     */
    public static BigInteger readUint64(ByteBuffer byteBuffer) {
        byte[] byteArray = new byte[8];
        byteBuffer.get(byteArray);
        return TypeConverter.convertUint64(byteArray);
    }
}

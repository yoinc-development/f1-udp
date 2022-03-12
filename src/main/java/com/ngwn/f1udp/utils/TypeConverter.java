package com.ngwn.f1udp.utils;

import java.math.BigInteger;

public abstract class TypeConverter {

    public static short convertUint8(byte number)  {
        return number;
    }

    public static int convertUint16(short number)  {
        return (short) (number & 0xffff);
    }

    public static BigInteger convertUint64(long number)  {
        BigInteger result = BigInteger.valueOf(number);
        return result;
    }

    public static void convertUint32(byte number)  {
        //TODO this
    }

}

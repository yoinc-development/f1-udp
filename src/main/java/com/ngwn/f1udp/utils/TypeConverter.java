package com.ngwn.f1udp.utils;

import java.math.BigInteger;

public abstract class TypeConverter {

    public static short convertUint8(byte number)  {
        return number;
    }

    public static int convertUint16(short number)  {
        return (short) (number & 0xffff);
    }

    public static BigInteger convertUint64(byte[] byteArray)  {
        byte[] result = new byte[byteArray.length + 1];
        for (int i = 0, j = byteArray.length; j > 0; i++, j--)
            result[j] = byteArray[i];
        return new BigInteger(result);
    }


    public static void convertUint32(byte number)  {
        //TODO this
    }
}

package com.ngwn.f1udp.utils;

public abstract class TypeConverter {

    public static int convertUint16(short number)  {
        return (number & 0xffff);
    }

    public static int convertUint64(short number)  {
        return (number & 0xffff);
    }

}

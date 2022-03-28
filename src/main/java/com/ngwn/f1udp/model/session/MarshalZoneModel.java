package com.ngwn.f1udp.model.session;

import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;

/**
 * This class contains the data of a MarshalZone attribute
 * @author jth
 */
public class MarshalZoneModel {

    private float mZoneStart;
    private int mZoneFlag;

    public MarshalZoneModel(ByteBuffer superBuffer) {
        mZoneStart = superBuffer.getFloat();
        mZoneFlag = TypeConverter.convertUint8(superBuffer.get());
    }
}

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

    public MarshalZoneModel() { }

    public ByteBuffer readData(ByteBuffer superBuffer) {
        mZoneStart = superBuffer.getFloat();
        mZoneFlag = TypeConverter.convertUint8(superBuffer.get());
        return superBuffer;
    }

    public float getmZoneStart() {
        return mZoneStart;
    }

    public void setmZoneStart(float mZoneStart) {
        this.mZoneStart = mZoneStart;
    }

    public int getmZoneFlag() {
        return mZoneFlag;
    }

    public void setmZoneFlag(int mZoneFlag) {
        this.mZoneFlag = mZoneFlag;
    }

    @Override
    public String toString(){
        return "Zone Start: " + getmZoneStart() + "\n"
                + "Zone Flag: " + getmZoneFlag() + "\n";
    }
}

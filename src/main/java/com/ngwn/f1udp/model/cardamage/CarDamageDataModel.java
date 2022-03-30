package com.ngwn.f1udp.model.cardamage;

import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;

public class CarDamageDataModel {

    private float mTyresWear;
    private int mTyresDamage;
    private int mBrakesDamage;
    private int mFrontLeftWingDamage;
    private int mFrontRightWingDamage;
    private int mRearWingDamage;
    private int mFloorDamage;
    private int mDiffuserDamage;
    private int mSidepodDamage;
    private int mDrsFault;
    private int mGearBoxDamage;
    private int mEngineDamage;
    private int mEngineMGUHWear;
    private int mEngineESWear;
    private int mEngineCEWear;
    private int mEngineICEWear;
    private int mEngineMGUKWear;
    private int mEngineTCWear;

    public CarDamageDataModel(ByteBuffer superBuffer) {
        mTyresWear = superBuffer.getFloat();
        mTyresDamage = TypeConverter.convertUint8(superBuffer.get());
        mBrakesDamage = TypeConverter.convertUint8(superBuffer.get());
        mFrontLeftWingDamage = TypeConverter.convertUint8(superBuffer.get());
        mFrontRightWingDamage = TypeConverter.convertUint8(superBuffer.get());
        mRearWingDamage = TypeConverter.convertUint8(superBuffer.get());
        mFloorDamage = TypeConverter.convertUint8(superBuffer.get());
        mDiffuserDamage = TypeConverter.convertUint8(superBuffer.get());
        mSidepodDamage = TypeConverter.convertUint8(superBuffer.get());
        mDrsFault = TypeConverter.convertUint8(superBuffer.get());
        mGearBoxDamage = TypeConverter.convertUint8(superBuffer.get());
        mEngineDamage = TypeConverter.convertUint8(superBuffer.get());
        mEngineMGUHWear = TypeConverter.convertUint8(superBuffer.get());
        mEngineESWear = TypeConverter.convertUint8(superBuffer.get());
        mEngineCEWear = TypeConverter.convertUint8(superBuffer.get());
        mEngineICEWear = TypeConverter.convertUint8(superBuffer.get());
        mEngineMGUKWear = TypeConverter.convertUint8(superBuffer.get());
        mEngineTCWear = TypeConverter.convertUint8(superBuffer.get());
    }

    public float getmTyresWear() {
        return mTyresWear;
    }

    public void setmTyresWear(float mTyresWear) {
        this.mTyresWear = mTyresWear;
    }

    public int getmTyresDamage() {
        return mTyresDamage;
    }

    public void setmTyresDamage(int mTyresDamage) {
        this.mTyresDamage = mTyresDamage;
    }

    public int getmBrakesDamage() {
        return mBrakesDamage;
    }

    public void setmBrakesDamage(int mBrakesDamage) {
        this.mBrakesDamage = mBrakesDamage;
    }

    public int getmFrontLeftWingDamage() {
        return mFrontLeftWingDamage;
    }

    public void setmFrontLeftWingDamage(int mFrontLeftWingDamage) {
        this.mFrontLeftWingDamage = mFrontLeftWingDamage;
    }

    public int getmFrontRightWingDamage() {
        return mFrontRightWingDamage;
    }

    public void setmFrontRightWingDamage(int mFrontRightWingDamage) {
        this.mFrontRightWingDamage = mFrontRightWingDamage;
    }

    public int getmRearWingDamage() {
        return mRearWingDamage;
    }

    public void setmRearWingDamage(int mRearWingDamage) {
        this.mRearWingDamage = mRearWingDamage;
    }

    public int getmFloorDamage() {
        return mFloorDamage;
    }

    public void setmFloorDamage(int mFloorDamage) {
        this.mFloorDamage = mFloorDamage;
    }

    public int getmDiffuserDamage() {
        return mDiffuserDamage;
    }

    public void setmDiffuserDamage(int mDiffuserDamage) {
        this.mDiffuserDamage = mDiffuserDamage;
    }

    public int getmSidepodDamage() {
        return mSidepodDamage;
    }

    public void setmSidepodDamage(int mSidepodDamage) {
        this.mSidepodDamage = mSidepodDamage;
    }

    public int getmDrsFault() {
        return mDrsFault;
    }

    public void setmDrsFault(int mDrsFault) {
        this.mDrsFault = mDrsFault;
    }

    public int getmGearBoxDamage() {
        return mGearBoxDamage;
    }

    public void setmGearBoxDamage(int mGearBoxDamage) {
        this.mGearBoxDamage = mGearBoxDamage;
    }

    public int getmEngineDamage() {
        return mEngineDamage;
    }

    public void setmEngineDamage(int mEngineDamage) {
        this.mEngineDamage = mEngineDamage;
    }

    public int getmEngineMGUHWear() {
        return mEngineMGUHWear;
    }

    public void setmEngineMGUHWear(int mEngineMGUHWear) {
        this.mEngineMGUHWear = mEngineMGUHWear;
    }

    public int getmEngineESWear() {
        return mEngineESWear;
    }

    public void setmEngineESWear(int mEngineESWear) {
        this.mEngineESWear = mEngineESWear;
    }

    public int getmEngineCEWear() {
        return mEngineCEWear;
    }

    public void setmEngineCEWear(int mEngineCEWear) {
        this.mEngineCEWear = mEngineCEWear;
    }

    public int getmEngineICEWear() {
        return mEngineICEWear;
    }

    public void setmEngineICEWear(int mEngineICEWear) {
        this.mEngineICEWear = mEngineICEWear;
    }

    public int getmEngineMGUKWear() {
        return mEngineMGUKWear;
    }

    public void setmEngineMGUKWear(int mEngineMGUKWear) {
        this.mEngineMGUKWear = mEngineMGUKWear;
    }

    public int getmEngineTCWear() {
        return mEngineTCWear;
    }

    public void setmEngineTCWear(int mEngineTCWear) {
        this.mEngineTCWear = mEngineTCWear;
    }

    @Override
    public String toString(){
        return "Tyres Wear: " + getmTyresWear() + "\n"
                + "Tyres Damage: " + getmTyresDamage() + "\n"
                + "Brakes Damage: " + getmBrakesDamage() + "\n"
                + "Front-left Damage: " + getmFrontLeftWingDamage() + "\n"
                + "Front-right Damage: " + getmFrontRightWingDamage() + "\n"
                + "Rear Wing Damage: " + getmRearWingDamage() + "\n"
                + "Floor Damage: " + getmFloorDamage() + "\n"
                + "Diffuser Damage: " + getmDiffuserDamage() + "\n"
                + "Sidepod Damage: " + getmSidepodDamage() + "\n"
                + "DRS Fault: " + getmDrsFault() + "\n"
                + "Gearbox Damage: " + getmGearBoxDamage() + "\n"
                + "Engine Damage: " + getmEngineDamage() + "\n"
                + "Engine MGUH Wear: " + getmEngineMGUHWear() + "\n"
                + "Engine ES Wear: " + getmEngineESWear() + "\n"
                + "Engine CE Wear: " + getmEngineCEWear() + "\n"
                + "Engine ICE Wear: " + getmEngineICEWear() + "\n"
                + "Engine MGUK Wear: " + getmEngineMGUKWear() + "\n"
                + "Engine TC Wear: " + getmEngineTCWear() + "\n";
    }
}

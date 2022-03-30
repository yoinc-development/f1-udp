package com.ngwn.f1udp.model.cardamage;

import com.ngwn.f1udp.model.PacketModel;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

public class CarDamageDataCollectionModel extends PacketModel {

    private List<CarDamageDataModel> carDamageDataModelList;

    public CarDamageDataCollectionModel(byte[] packet) {
        super(packet);

        ByteBuffer superBuffer = super.getByteBuffer();
        carDamageDataModelList = new ArrayList<CarDamageDataModel>();
        for (int counter = 0; counter < PacketModel.NUMBER_OF_CARS; counter++) {
            carDamageDataModelList.add(new CarDamageDataModel(superBuffer));
        }
    }

    public List<CarDamageDataModel> getCarDamageDataModelList() {
        return carDamageDataModelList;
    }

    public void setCarDamageDataModelList(List<CarDamageDataModel> carDamageDataModelList) {
        this.carDamageDataModelList = carDamageDataModelList;
    }

    @Override
    public String toString(){

        StringBuilder carDamageDataModel = new StringBuilder();
        for(CarDamageDataModel z : getCarDamageDataModelList()) {
            carDamageDataModel.append(z.toString());
            carDamageDataModel.append("\n");
        }

        return "Car Damage Data: ( " + carDamageDataModel + " )\n";
    }
}

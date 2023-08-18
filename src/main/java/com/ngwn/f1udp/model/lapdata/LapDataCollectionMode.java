package com.ngwn.f1udp.model.lapdata;

import com.ngwn.f1udp.model.PacketModel;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

public class LapDataCollectionMode extends PacketModel {

    private List<LapDataModel> lapDataList;

    public LapDataCollectionMode(byte[] packet) {
        super(packet);
        lapDataList = new ArrayList<>();
        ByteBuffer superBuffer = super.getByteBuffer();
        for (int index = 0; index < PacketModel.NUMBER_OF_CARS; index++) {
            lapDataList.add(new LapDataModel(superBuffer));
        }
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        for (LapDataModel lapDataModel : lapDataList) {
            result.append(lapDataModel.toString());
            result.append("\n");
        }
        return result.toString();
    }

}

package com.ngwn.f1udp.model.participant;

import com.ngwn.f1udp.model.PacketModel;
import com.ngwn.f1udp.utils.TypeConverter;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

public class ParticipantPacketModel extends PacketModel {

    public int mNumActiveCars;

    private List<Participant> participantList = new ArrayList<>();


    public ParticipantPacketModel(byte[] packet) {
        super(packet);
        //header
        ByteBuffer superBuffer = super.getByteBuffer();
        // mNumActiveCars
        mNumActiveCars = TypeConverter.convertUint8(superBuffer.get());
        // mParticipants[22]
        for (int i = 0; i < NUMBER_OF_CARS; i++) {
            Participant participant = new Participant(superBuffer);
            participantList.add(participant);
            //Debug
            //System.out.println(participant);
        }
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        for (Participant participant : participantList) {
            result.append(participant.toString());
            result.append("\n");
        }
        return result.toString();
    }



}

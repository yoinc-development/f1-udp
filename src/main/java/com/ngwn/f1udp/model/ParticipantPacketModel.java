package com.ngwn.f1udp.model;

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
        for (int i = 0; i < 22; i++) {
            Participant participant = new Participant(superBuffer);
            participantList.add(participant);
            //Debug
            //System.out.println(participant);
        }
    }



}

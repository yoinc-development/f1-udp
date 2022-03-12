package com.ngwn.f1udp.controller;

import com.ngwn.f1udp.model.PacketModel;
import com.ngwn.f1udp.model.ParticipantPacketModel;
import com.ngwn.f1udp.net.Receiver;

import java.util.ArrayList;

public class DataController {

    public Receiver receiver;

    public DataController() {
        receiver = new Receiver(this);
        receiver.execute();
    }

    public synchronized void handlePacket(byte[] packet) {
        PacketModel packetModel = new PacketModel(packet);

        if(packetModel != null) {
            switch (packetModel.getmPacketId()) {
                case 4:
                    ParticipantPacketModel participantPacketModel = new ParticipantPacketModel(packet);
                    System.out.println(participantPacketModel.toString());
                    break;
            }
        }
    }
}

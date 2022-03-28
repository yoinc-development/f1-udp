package com.ngwn.f1udp.controller;

import com.ngwn.f1udp.model.PacketModel;
import com.ngwn.f1udp.model.participant.ParticipantPacketModel;
import com.ngwn.f1udp.model.session.SessionDataModel;
import com.ngwn.f1udp.net.Receiver;

import java.util.Set;

public class DataController {

    public Receiver receiver;

    public DataController() {
        receiver = new Receiver(this);
        new Thread(receiver).start();

        //TODO: remove. This is just for testing purposes.
        Set<Thread> threads = Thread.getAllStackTraces().keySet();
        System.out.printf("%-15s \t %-15s \t %-15s \t %s\n", "Name", "State", "Priority", "isDaemon");
        for (Thread t : threads) {
            System.out.printf("%-15s \t %-15s \t %-15d \t %s\n", t.getName(), t.getState(), t.getPriority(), t.isDaemon());
        }
    }

    public synchronized void handlePacket(byte[] packet) {
        PacketModel packetModel = new PacketModel(packet);

        if(packetModel != null) {
            switch (packetModel.getmPacketId()) {
                case 1:
                    SessionDataModel sessionDataModel = new SessionDataModel(packet);
                    System.out.println(sessionDataModel.toString());
                    break;
                case 4:
                    ParticipantPacketModel participantPacketModel = new ParticipantPacketModel(packet);
                    System.out.println(participantPacketModel.toString());
                    break;
            }
        }
    }
}

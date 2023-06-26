package com.ngwn.f1udp.controller;

import com.ngwn.f1udp.model.PacketModel;
import com.ngwn.f1udp.model.participant.ParticipantPacketModel;
import com.ngwn.f1udp.model.session.SessionDataModel;
import com.ngwn.f1udp.net.Receiver;

import java.util.Set;

public class DataController {

    public Receiver receiver;

    public DataController() {
        receiver = new Receiver();

        //TODO: remove. This is just for testing purposes.
        Set<Thread> threads = Thread.getAllStackTraces().keySet();
        System.out.printf("%-15s \t %-15s \t %-15s \t %s\n", "Name", "State", "Priority", "isDaemon");
        for (Thread t : threads) {
            System.out.printf("%-15s \t %-15s \t %-15d \t %s\n", t.getName(), t.getState(), t.getPriority(), t.isDaemon());
        }
    }

    public void startReceiver(){
        new Thread(receiver).start();
    }

    public void shutDown() {
        receiver.shutDown();
    }
}

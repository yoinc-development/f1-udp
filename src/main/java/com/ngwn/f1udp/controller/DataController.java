package com.ngwn.f1udp.controller;

import com.ngwn.f1udp.model.PacketModel;
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
    }
}

package com.ngwn.f1udp.net;

import com.ngwn.f1udp.model.PacketModel;
import com.ngwn.f1udp.utils.PacketDataCollection;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.nio.ByteBuffer;

public class Receiver implements Runnable {

    private final int port = 4445;
    private static final int MAX_BUFFER = 2048;
    private boolean is_running;
    DatagramSocket socket = null;
    PacketDataCollection packetDataCollection;

    public Receiver() {
        this.is_running = true;
        this.packetDataCollection = new PacketDataCollection();
        try {
            this.socket = new DatagramSocket(port);
        } catch (IOException ex) {
            System.out.println("Port is in use.");
        }
    }

    public void run() {
        System.out.println("Start receiving packets...");
        while(is_running) {
            byte[] buffer = new byte[MAX_BUFFER];
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            if (socket != null) {
                try {
                    socket.receive(packet);
                    handlePacket(buffer);
                    packet.setLength((buffer.length));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public void shutDown() {
        this.is_running = false;
    }

    private synchronized void handlePacket(byte[] packet) {
        PacketModel packetModel = new PacketModel();
        ByteBuffer superBuffer = packetModel.readData(packet);

        switch (packetModel.getmPacketId()) {
            case 1:
                packetDataCollection.updateSessionData(superBuffer);
                System.out.println(packetDataCollection.getSessionDataModel().toString());
                break;
            case 2:
                packetDataCollection.updateLapDataCollection(superBuffer);
                System.out.println(packetDataCollection.getLapDataCollectionModel().toString());
                break;
            case 4:
                packetDataCollection.updateParticipantCollection(superBuffer);
                System.out.println(packetDataCollection.getParticipantCollectionModel().toString());
                break;
            case 5:
                System.out.println("Packet 5: Not implemented.");
                break;
            case 6:
                System.out.println("Packet 6: Not implemented.");
                break;
            case 7:
                System.out.println("Packet 7: Not implemented.");
                break;
            case 8:
                System.out.println("Packet 8: Not implemented.");
                break;
            case 9:
                System.out.println("Packet 9: Not implemented.");
                break;
            case 10:
                System.out.println("Packet 10: Not implemented.");
                break;
            case 11:
                System.out.println("Packet 11: Not implemented.");
                break;
        }
    }

}

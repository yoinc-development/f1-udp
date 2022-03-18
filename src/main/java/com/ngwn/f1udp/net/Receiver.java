package com.ngwn.f1udp.net;

import com.ngwn.f1udp.controller.DataController;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class Receiver extends Thread {

    private int port = 4445;
    private DataController controller;
    private static int MAX_BUFFER = 2048;
    private boolean is_running;
    int counter = 01;

    public Receiver(DataController controller) {
        this.controller = controller;
        this.is_running = true;
    }

    public void run() {
        System.out.println("Been here:" + counter);

        try {
            DatagramSocket socket = new DatagramSocket(port);
            byte[] buffer = new byte[MAX_BUFFER];
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

            socket.receive(packet);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    controller.handlePacket(buffer);
                }
            }).run();

            packet.setLength(buffer.length);


        } catch (IOException ex) {
            System.out.println("Check port: '" + port + "' or packet.");
        }
    }
}

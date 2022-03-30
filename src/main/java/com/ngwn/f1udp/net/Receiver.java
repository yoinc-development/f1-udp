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
    DatagramSocket socket = null;

    public Receiver(DataController controller) {
        this.controller = controller;
        this.is_running = true;
        try {
            this.socket = new DatagramSocket(port);
        } catch (IOException ex) {
            System.out.println("Port is in use.");
        }
    }

    public void run() {

        byte[] buffer = new byte[MAX_BUFFER];
        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

        if (socket != null) {
            try {
                socket.receive(packet);
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        controller.handlePacket(buffer);
                    }
                }).run();

                packet.setLength(buffer.length);
                while (is_running) {
                    run();
                }
            } catch (IOException ex) {
                System.out.println("Check package.");
            }
        }

    }
}

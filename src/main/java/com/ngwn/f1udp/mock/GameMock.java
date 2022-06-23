package com.ngwn.f1udp.mock;

import java.io.IOException;
import java.net.*;

public class GameMock {

    public static void main(String[] args) {

        try {
            DatagramSocket clientSocket = new DatagramSocket();
            InetAddress IPAddress = InetAddress.getByName("127.0.0.1");
            byte[] sendData = returnParticipantData();
            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, IPAddress, 4445);
            clientSocket.send(sendPacket);
            clientSocket.close();
        } catch (SocketException ex) {
            System.out.println("Error with creating a DatagramSocket.");
        } catch (UnknownHostException ex) {
            System.out.println("Error with given host.");
        } catch (IOException ex) {
            System.out.println("Error with sending the packet.");
        }
    }

    private static byte[] returnParticipantData() {

        byte[] result = new byte[2048];

        returnHeaderData(result);

        //TODO add participant data

        return result;
    }

    private static void returnHeaderData(byte[] result) {

        Float sessionTime = 12893922.1f;

        //TODO finish header data

        result[0] = (byte)(2021 & 0xff);
        result[1] = (byte)((2021 >> 8) & 0xff);
        result[2] = (byte)(20 & 0xff);
        result[3] = (byte)(10 & 0xff);
        result[4] = (byte)(1 & 0xff);
        result[5] = (byte)(4 & 0xff); //Packet ID
        result[6] = (byte)((2147483647 >> 32) & 0xff); //SessionUID

    }
}

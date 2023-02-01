package com.ngwn.f1udp.controller;

import com.ngwn.f1udp.utils.StageBuilder;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;

import java.io.IOException;


public class StartupController {

    private DataController controller;

    @FXML
    protected void spectatorButtonClick(ActionEvent event) {

        try {
            StageBuilder.buildStageFromButton("F1 2021 - Spectator View", "spectator.fxml", 300, 100, event).show();
        } catch (IOException io) {
            System.out.println("Error creating stage.");
        }
        //controller = new DataController();
    }

    @FXML
    protected void playerButtonClick() {
        controller = new DataController();
        controller.startReceiver();
    }

    //TODO: Add shutdown button

}
package com.ngwn.f1udp.controller;

import javafx.fxml.FXML;
import javafx.scene.control.Label;


public class StartupController {

    private DataController controller;

    @FXML
    protected void spectatorButtonClick() {

        controller = new DataController();

    }

    @FXML
    protected void playerButtonClick() {

        controller = new DataController();

    }

}
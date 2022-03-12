package com.ngwn.f1udp.controller;

import javafx.fxml.FXML;
import javafx.scene.control.Label;


public class HelloController {

    private DataController controller;

    @FXML
    private Label welcomeText;

    @FXML
    protected void onHelloButtonClick() {
        welcomeText.setText("Welcome to JavaFX Application!");

        controller = new DataController();

    }

}
package com.ngwn.f1udp;

import com.ngwn.f1udp.utils.StageBuilder;
import javafx.application.Application;
import javafx.stage.Stage;

import java.io.IOException;

public class Startup extends Application {
    @Override
    public void start(Stage stage) {

        try {
            StageBuilder.buildStage("F1 2021 - Telemetry Tool", "startup.fxml", 300, 100, stage).show();
        } catch (IOException io) {
            System.out.println("Error creating stage.");
        }
    }

    public static void main(String[] args) {
        launch();
    }
}
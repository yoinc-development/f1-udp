package com.ngwn.f1udp.utils;

import com.ngwn.f1udp.Startup;
import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.stage.Stage;

import java.io.IOException;

public abstract class StageBuilder {

    private static FXMLLoader fxmlLoader = null;
    private static Scene scene = null;

    public static Stage buildStageFromButton(String windowName, String resource, int v, int v1, ActionEvent event) throws IOException {
        Stage resultStage = ((Stage) ((Button) event.getTarget()).getScene().getWindow());

        fxmlLoader = new FXMLLoader(Startup.class.getResource(resource));
        scene = new Scene(fxmlLoader.load(), v, v1);

        resultStage.setTitle(windowName);
        resultStage.setScene(scene);
        resultStage.setResizable(false);

        return resultStage;
    }

    public static Stage buildStage(String windowName, String resource, int v, int v1, Stage stage) throws IOException {

        fxmlLoader = new FXMLLoader(Startup.class.getResource(resource));
        scene = new Scene(fxmlLoader.load(), v, v1);

        stage.setTitle(windowName);
        stage.setScene(scene);
        stage.setResizable(false);

        return stage;
    }

}

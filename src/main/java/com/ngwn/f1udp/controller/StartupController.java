package com.ngwn.f1udp.controller;

import com.ngwn.f1udp.utils.StageBuilder;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.ListView;
import javafx.stage.Stage;

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
    protected void playerButtonClick(ActionEvent event) {

        controller = new DataController();

        try {
            Stage stage = StageBuilder.buildStageFromButton("F1 2021 - Player View", "player.fxml", 640, 373, event);

            ListView listView = (ListView) stage.getScene().lookup("#fp1_list");
            addPeopleToList(listView);

            listView = (ListView) stage.getScene().lookup("#fp2_list");
            addPeopleToList(listView);

            listView = (ListView) stage.getScene().lookup("#fp3_list");
            addPeopleToList(listView);

            listView = (ListView) stage.getScene().lookup("#quali_list");
            addPeopleToList(listView);

            listView = (ListView) stage.getScene().lookup("#race_list");
            addPeopleToList(listView);

            stage.show();
        } catch (IOException io) {
            System.out.println("Error creating stage.");
        }

    }

    /**
     * add mock data to a listview for testing purposes
     * @param listView
     */
    private void addPeopleToList(ListView listView) {
        listView.getItems().add("1. Firstname Lastname");
        listView.getItems().add("2. Firstname Lastname");
        listView.getItems().add("3. Firstname Lastname");
        listView.getItems().add("4. Firstname Lastname");
        listView.getItems().add("5. Firstname Lastname");
        listView.getItems().add("6. Firstname Lastname");
        listView.getItems().add("7. Firstname Lastname");
        listView.getItems().add("8. Firstname Lastname");
        listView.getItems().add("9. Firstname Lastname");
        listView.getItems().add("10. Firstname Lastname");
    }

}
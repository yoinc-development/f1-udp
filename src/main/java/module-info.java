module com.ngwn.f1udp {
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.web;

    requires org.controlsfx.controls;
    requires com.dlsc.formsfx;
    requires validatorfx;
    requires org.kordamp.ikonli.javafx;
    requires org.kordamp.bootstrapfx.core;
    requires eu.hansolo.tilesfx;

    opens com.ngwn.f1udp to javafx.fxml;
    exports com.ngwn.f1udp;
    opens com.ngwn.f1udp.controller to javafx.fxml;
    exports com.ngwn.f1udp.controller;
}
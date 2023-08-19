package com.ngwn.f1udp.utils;

import com.ngwn.f1udp.model.lapdata.LapDataCollectionModel;
import com.ngwn.f1udp.model.participant.ParticipantCollectionModel;
import com.ngwn.f1udp.model.session.MarshalZoneModel;
import com.ngwn.f1udp.model.session.SessionDataModel;
import com.ngwn.f1udp.model.session.WeatherForecastSampleModel;

import java.nio.ByteBuffer;

public class PacketDataCollection {
    private LapDataCollectionModel lapDataCollectionModel;
    private ParticipantCollectionModel participantCollectionModel;
    private MarshalZoneModel marshalZoneModel;
    private SessionDataModel sessionDataModel;
    private WeatherForecastSampleModel weatherForecastSampleModel;

    public PacketDataCollection() {
        this.lapDataCollectionModel = new LapDataCollectionModel();
        this.participantCollectionModel = new ParticipantCollectionModel();
        this.marshalZoneModel = new MarshalZoneModel();
        this.sessionDataModel = new SessionDataModel();
        this.weatherForecastSampleModel = new WeatherForecastSampleModel();
    }

    public void updateLapDataCollection(ByteBuffer byteBuffer) {
        this.lapDataCollectionModel.readData(byteBuffer);
    }

    public void updateParticipantCollection(ByteBuffer byteBuffer) {
        this.participantCollectionModel.readData(byteBuffer);
    }

    public void updateMarshalZone(ByteBuffer byteBuffer) {
        this.marshalZoneModel.readData(byteBuffer);
    }

    public void updateWeatherForecast(ByteBuffer byteBuffer) {
        this.weatherForecastSampleModel.readData(byteBuffer);
    }

    public void updateSessionData(ByteBuffer byteBuffer) {
        this.sessionDataModel.readData(byteBuffer);
    }

    // TODO: Getters need to handle parallelization
    public LapDataCollectionModel getLapDataCollectionModel() {
        return this.lapDataCollectionModel;
    }

    public ParticipantCollectionModel getParticipantCollectionModel() {
        return this.participantCollectionModel;
    }

    public MarshalZoneModel getMarshalZoneModel() {
        return this.marshalZoneModel;
    }

    public SessionDataModel getSessionDataModel() {
        return this.sessionDataModel;
    }

    public WeatherForecastSampleModel getWeatherForecastSampleModel() {
        return this.weatherForecastSampleModel;
    }


}

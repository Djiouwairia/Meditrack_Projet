package com.meditrack.dto;

public class UpdateStatutRequest {
    private String statut;

    public UpdateStatutRequest() {}

    public UpdateStatutRequest(String statut) {
        this.statut = statut;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}
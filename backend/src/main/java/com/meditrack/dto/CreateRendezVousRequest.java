package com.meditrack.dto;

import java.time.LocalDateTime;

public class CreateRendezVousRequest {
    private Long patientId;
    private Long medecinId;
    private LocalDateTime dateHeure;
    private Integer duree;
    private String motif;
    private String notes;

    // Constructeurs
    public CreateRendezVousRequest() {}

    // Getters et Setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getMedecinId() { return medecinId; }
    public void setMedecinId(Long medecinId) { this.medecinId = medecinId; }

    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }

    public Integer getDuree() { return duree; }
    public void setDuree(Integer duree) { this.duree = duree; }

    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
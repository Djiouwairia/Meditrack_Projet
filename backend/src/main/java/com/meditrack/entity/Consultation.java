package com.meditrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rendez_vous_id")
    private Long rendezVousId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "medecin_id", nullable = false)
    private Long medecinId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String motif;

    @Column(columnDefinition = "TEXT")
    private String examenClinique;

    @Column(columnDefinition = "TEXT")
    private String diagnostic;

    @Column(name = "notes_privees", columnDefinition = "TEXT")
    private String notesPrivees;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

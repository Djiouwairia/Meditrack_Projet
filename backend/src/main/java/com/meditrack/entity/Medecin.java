package com.meditrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("MEDECIN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Medecin extends User {
    @Column(nullable = false)
    private String specialite;

    @Column(nullable = false, unique = true)
    private String numeroIdentification;

    @Column(nullable = false)
    private String adresseCabinet;

    @Column(name = "tarif_consultation")
    private Double tarifConsultation;
}

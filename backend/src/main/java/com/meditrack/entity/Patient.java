package com.meditrack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("PATIENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Patient extends User {
    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "numero_securite_sociale")
    private String numeroSecuriteSociale;

    @Column(length = 500)
    private String adresse;

    @Column(name = "medecin_traitant_id")
    private Long medecinTraitantId;

    @Column(name = "groupe_sanguin", length = 10)
    private String groupeSanguin;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;
}

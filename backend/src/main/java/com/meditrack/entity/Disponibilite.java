package com.meditrack.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "disponibilites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Disponibilite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medecin_id", nullable = false)
    private Long medecinId; // ID du Medecin associé

    // 1=Lundi, 7=Dimanche (Correspond au standard ISO ou DayOfWeek Java, que nous allons mapper à 1-7)
    // Côté React, vous utilisez 1-5 pour Lundi-Vendredi, 0 pour Dimanche. Nous allons utiliser l'ID du jour de semaine (1-7)
    @Column(name = "jour_semaine", nullable = false)
    private Integer jourSemaine;

    @Column(name = "heure_debut", nullable = false, length = 5) // Ex: "09:00"
    private String heureDebut;

    @Column(name = "heure_fin", nullable = false, length = 5) // Ex: "17:00"
    private String heureFin;

    @Column(name = "duree_creneaux", nullable = false) // En minutes (Ex: 30)
    private Integer dureeCreneaux;
}
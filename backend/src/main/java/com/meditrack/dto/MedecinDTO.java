package com.meditrack.dto;

import lombok.Data;

@Data
public class MedecinDTO {
    private Long id;
    private String prenom;
    private String nom;
    private String email;
    private String telephone;
    private String specialite;
    private String adresseCabinet;
}
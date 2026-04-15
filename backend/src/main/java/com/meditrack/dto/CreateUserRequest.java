package com.meditrack.dto;

import com.meditrack.entity.UserRole;
import java.time.LocalDate;

public class CreateUserRequest {
    private String email;
    private String password;
    private String nom;
    private String prenom;
    private String telephone;
    private UserRole role;

    // Champs spécifiques à Patient
    private LocalDate dateNaissance;
    private String numeroSecuriteSociale;
    private String adresse;
    private Long medecinTraitantId;
    private String groupeSanguin;
    private String allergies;

    // Champs spécifiques à Medecin
    private String specialite;
    private String numeroIdentification;
    private String adresseCabinet;
    private Double tarifConsultation;

    // Champs spécifiques à Admin
    private String departement;

    // Constructeurs
    public CreateUserRequest() {}

    // Constructeur pour les tests
    public CreateUserRequest(String email, String password, String nom, String prenom,
                             String telephone, UserRole role) {
        this.email = email;
        this.password = password;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.role = role;
    }

    // Getters et Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public String getNumeroSecuriteSociale() { return numeroSecuriteSociale; }
    public void setNumeroSecuriteSociale(String numeroSecuriteSociale) { this.numeroSecuriteSociale = numeroSecuriteSociale; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public Long getMedecinTraitantId() { return medecinTraitantId; }
    public void setMedecinTraitantId(Long medecinTraitantId) { this.medecinTraitantId = medecinTraitantId; }

    public String getGroupeSanguin() { return groupeSanguin; }
    public void setGroupeSanguin(String groupeSanguin) { this.groupeSanguin = groupeSanguin; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getNumeroIdentification() { return numeroIdentification; }
    public void setNumeroIdentification(String numeroIdentification) { this.numeroIdentification = numeroIdentification; }

    public String getAdresseCabinet() { return adresseCabinet; }
    public void setAdresseCabinet(String adresseCabinet) { this.adresseCabinet = adresseCabinet; }

    public Double getTarifConsultation() { return tarifConsultation; }
    public void setTarifConsultation(Double tarifConsultation) { this.tarifConsultation = tarifConsultation; }

    public String getDepartement() { return departement; }
    public void setDepartement(String departement) { this.departement = departement; }

    // Méthode utilitaire pour le débogage
    @Override
    public String toString() {
        return "CreateUserRequest{" +
                "email='" + email + '\'' +
                ", nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", role=" + role +
                '}';
    }
}
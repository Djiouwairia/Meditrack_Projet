package com.meditrack.dto;

import com.meditrack.entity.UserRole;
import java.time.LocalDateTime;

public class UserDisplayDTO {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private UserRole role;
    private String status;
    private LocalDateTime createdAt;

    public UserDisplayDTO() {}

    public UserDisplayDTO(Long id, String email, String nom, String prenom, String telephone, UserRole role, String status, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
package com.meditrack.controller;

import com.meditrack.dto.CreateUserRequest;
import com.meditrack.dto.UserDisplayDTO;
import com.meditrack.dto.ErrorResponse;
import com.meditrack.entity.UserRole;
import com.meditrack.entity.Patient;
import com.meditrack.entity.Medecin;
import com.meditrack.entity.Admin;
import com.meditrack.entity.User;
import com.meditrack.service.PatientService;
import com.meditrack.service.MedecinService;
import com.meditrack.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AdminController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private MedecinService medecinService;

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDisplayDTO>> getAllUsersForAdmin() {
        List<UserDisplayDTO> users = new ArrayList<>();

        // 1. Récupérer et mapper les Patients
        List<Patient> patients = patientService.getAllPatients();
        users.addAll(patients.stream()
                .map(this::mapPatientToDTO)
                .collect(Collectors.toList()));

        // 2. Récupérer et mapper les Médecins
        List<Medecin> medecins = medecinService.getAllMedecins();
        users.addAll(medecins.stream()
                .map(this::mapMedecinToDTO)
                .collect(Collectors.toList()));

        // 3. Ajouter l'Admin (si non géré en DB)
        users.add(createAdminDTO());

        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest createRequest) {
        try {
            System.out.println("🔄 Création d'un nouvel utilisateur: " + createRequest.getEmail());

            // Validation basique
            if (createRequest.getEmail() == null || createRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("VALIDATION_ERROR", "L'email est obligatoire"));
            }

            if (createRequest.getPassword() == null || createRequest.getPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("VALIDATION_ERROR", "Le mot de passe doit contenir au moins 6 caractères"));
            }

            if (createRequest.getNom() == null || createRequest.getNom().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("VALIDATION_ERROR", "Le nom est obligatoire"));
            }

            if (createRequest.getPrenom() == null || createRequest.getPrenom().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("VALIDATION_ERROR", "Le prénom est obligatoire"));
            }

            if (createRequest.getTelephone() == null || createRequest.getTelephone().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("VALIDATION_ERROR", "Le téléphone est obligatoire"));
            }

            // Validation spécifique selon le rôle
            if (createRequest.getRole() == UserRole.MEDECIN) {
                if (createRequest.getSpecialite() == null || createRequest.getSpecialite().trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("VALIDATION_ERROR", "La spécialité est obligatoire pour un médecin"));
                }
                if (createRequest.getNumeroIdentification() == null || createRequest.getNumeroIdentification().trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("VALIDATION_ERROR", "Le numéro d'identification est obligatoire pour un médecin"));
                }
                if (createRequest.getAdresseCabinet() == null || createRequest.getAdresseCabinet().trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("VALIDATION_ERROR", "L'adresse du cabinet est obligatoire pour un médecin"));
                }
            }

            UserDisplayDTO createdUser;

            switch (createRequest.getRole()) {
                case PATIENT:
                    createdUser = createPatient(createRequest);
                    break;
                case MEDECIN:
                    createdUser = createMedecin(createRequest);
                    break;
                case ADMIN:
                    createdUser = createAdmin(createRequest);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("VALIDATION_ERROR", "Rôle invalide"));
            }

            System.out.println("✅ Utilisateur créé avec succès: " + createdUser.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);

        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la création de l'utilisateur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("INTERNAL_ERROR", "Erreur serveur: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody CreateUserRequest updateRequest) {
        try {
            System.out.println("🔄 Mise à jour de l'utilisateur ID: " + id);

            // Récupérer l'utilisateur existant
            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("NOT_FOUND", "Utilisateur non trouvé avec l'ID: " + id));
            }

            UserDisplayDTO updatedUser;

            // Mettre à jour selon le type d'utilisateur
            switch (existingUser.getRole()) {
                case PATIENT:
                    updatedUser = updatePatient((Patient) existingUser, updateRequest);
                    break;
                case MEDECIN:
                    updatedUser = updateMedecin((Medecin) existingUser, updateRequest);
                    break;
                case ADMIN:
                    updatedUser = updateAdmin((Admin) existingUser, updateRequest);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("VALIDATION_ERROR", "Rôle invalide"));
            }

            System.out.println("✅ Utilisateur mis à jour avec succès: " + updatedUser.getEmail());
            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la mise à jour de l'utilisateur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("INTERNAL_ERROR", "Erreur serveur: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            System.out.println("🗑️ Suppression de l'utilisateur ID: " + id);

            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("NOT_FOUND", "Utilisateur non trouvé avec l'ID: " + id));
            }

            // Supprimer l'utilisateur selon son type
            switch (existingUser.getRole()) {
                case PATIENT:
                    patientService.deletePatient(id);
                    break;
                case MEDECIN:
                    medecinService.deleteMedecin(id);
                    break;
                case ADMIN:
                    userService.deleteUser(id);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("VALIDATION_ERROR", "Rôle invalide"));
            }

            System.out.println("✅ Utilisateur supprimé avec succès");
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la suppression de l'utilisateur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("INTERNAL_ERROR", "Erreur serveur: " + e.getMessage()));
        }
    }

    // --- Méthodes de création sans cryptage ---

    private UserDisplayDTO createPatient(CreateUserRequest request) {
        Patient patient = new Patient();
        // Champs de base User
        patient.setEmail(request.getEmail());
        patient.setPassword(request.getPassword());
        patient.setNom(request.getNom());
        patient.setPrenom(request.getPrenom());
        patient.setTelephone(request.getTelephone());
        patient.setRole(UserRole.PATIENT);

        // Champs spécifiques Patient (optionnels)
        patient.setDateNaissance(request.getDateNaissance());
        patient.setNumeroSecuriteSociale(request.getNumeroSecuriteSociale());
        patient.setAdresse(request.getAdresse());
        patient.setMedecinTraitantId(request.getMedecinTraitantId());
        patient.setGroupeSanguin(request.getGroupeSanguin());
        patient.setAllergies(request.getAllergies());

        Patient savedPatient = patientService.savePatient(patient);
        return mapPatientToDTO(savedPatient);
    }

    private UserDisplayDTO createMedecin(CreateUserRequest request) {
        Medecin medecin = new Medecin();
        // Champs de base User
        medecin.setEmail(request.getEmail());
        medecin.setPassword(request.getPassword());
        medecin.setNom(request.getNom());
        medecin.setPrenom(request.getPrenom());
        medecin.setTelephone(request.getTelephone());
        medecin.setRole(UserRole.MEDECIN);

        // Champs spécifiques Medecin
        medecin.setSpecialite(request.getSpecialite());
        medecin.setNumeroIdentification(request.getNumeroIdentification());
        medecin.setAdresseCabinet(request.getAdresseCabinet());
        medecin.setTarifConsultation(request.getTarifConsultation());

        Medecin savedMedecin = medecinService.saveMedecin(medecin);
        return mapMedecinToDTO(savedMedecin);
    }

    private UserDisplayDTO createAdmin(CreateUserRequest request) {
        Admin admin = new Admin();
        // Champs de base User
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        admin.setNom(request.getNom());
        admin.setPrenom(request.getPrenom());
        admin.setTelephone(request.getTelephone());
        admin.setRole(UserRole.ADMIN);

        // Champs spécifiques Admin
        admin.setDepartement(request.getDepartement() != null ? request.getDepartement() : "Administration");

        // Sauvegarder via UserService
        Admin savedAdmin = (Admin) userService.saveUser(admin);
        return mapAdminToDTO(savedAdmin);
    }

    // 🔥 MÉTHODES DE MISE À JOUR

    private UserDisplayDTO updatePatient(Patient existing, CreateUserRequest request) {
        // Champs de base
        if (request.getEmail() != null) existing.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existing.setPassword(request.getPassword());
        }
        if (request.getNom() != null) existing.setNom(request.getNom());
        if (request.getPrenom() != null) existing.setPrenom(request.getPrenom());
        if (request.getTelephone() != null) existing.setTelephone(request.getTelephone());

        // Champs spécifiques Patient
        if (request.getDateNaissance() != null) existing.setDateNaissance(request.getDateNaissance());
        if (request.getNumeroSecuriteSociale() != null) existing.setNumeroSecuriteSociale(request.getNumeroSecuriteSociale());
        if (request.getAdresse() != null) existing.setAdresse(request.getAdresse());
        if (request.getMedecinTraitantId() != null) existing.setMedecinTraitantId(request.getMedecinTraitantId());
        if (request.getGroupeSanguin() != null) existing.setGroupeSanguin(request.getGroupeSanguin());
        if (request.getAllergies() != null) existing.setAllergies(request.getAllergies());

        Patient updated = patientService.savePatient(existing);
        return mapPatientToDTO(updated);
    }

    private UserDisplayDTO updateMedecin(Medecin existing, CreateUserRequest request) {
        // Champs de base
        if (request.getEmail() != null) existing.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existing.setPassword(request.getPassword());
        }
        if (request.getNom() != null) existing.setNom(request.getNom());
        if (request.getPrenom() != null) existing.setPrenom(request.getPrenom());
        if (request.getTelephone() != null) existing.setTelephone(request.getTelephone());

        // Champs spécifiques Medecin
        if (request.getSpecialite() != null) existing.setSpecialite(request.getSpecialite());
        if (request.getNumeroIdentification() != null) existing.setNumeroIdentification(request.getNumeroIdentification());
        if (request.getAdresseCabinet() != null) existing.setAdresseCabinet(request.getAdresseCabinet());
        if (request.getTarifConsultation() != null) existing.setTarifConsultation(request.getTarifConsultation());

        Medecin updated = medecinService.saveMedecin(existing);
        return mapMedecinToDTO(updated);
    }

    private UserDisplayDTO updateAdmin(Admin existing, CreateUserRequest request) {
        // Champs de base
        if (request.getEmail() != null) existing.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existing.setPassword(request.getPassword());
        }
        if (request.getNom() != null) existing.setNom(request.getNom());
        if (request.getPrenom() != null) existing.setPrenom(request.getPrenom());
        if (request.getTelephone() != null) existing.setTelephone(request.getTelephone());

        // Champs spécifiques Admin
        if (request.getDepartement() != null) existing.setDepartement(request.getDepartement());

        Admin updated = (Admin) userService.saveUser(existing);
        return mapAdminToDTO(updated);
    }

    // --- Fonctions de mapping existantes ---

    private UserDisplayDTO mapPatientToDTO(Patient p) {
        return new UserDisplayDTO(
                p.getId(),
                p.getEmail(),
                p.getNom(),
                p.getPrenom(),
                p.getTelephone(),
                UserRole.PATIENT,
                "ACTIF",
                p.getCreatedAt()
        );
    }

    private UserDisplayDTO mapMedecinToDTO(Medecin m) {
        return new UserDisplayDTO(
                m.getId(),
                m.getEmail(),
                m.getNom(),
                m.getPrenom(),
                m.getTelephone(),
                UserRole.MEDECIN,
                "ACTIF",
                m.getCreatedAt()
        );
    }

    private UserDisplayDTO mapAdminToDTO(Admin a) {
        return new UserDisplayDTO(
                a.getId(),
                a.getEmail(),
                a.getNom(),
                a.getPrenom(),
                a.getTelephone(),
                UserRole.ADMIN,
                "ACTIF",
                a.getCreatedAt()
        );
    }

    private UserDisplayDTO createAdminDTO() {
        return new UserDisplayDTO(
                999L,
                "admin@meditrack.com",
                "Système",
                "Admin",
                "+221 33 123 45 67",
                UserRole.ADMIN,
                "ACTIF",
                LocalDateTime.of(2024, 1, 1, 0, 0)
        );
    }
}
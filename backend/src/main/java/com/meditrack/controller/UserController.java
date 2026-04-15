package com.meditrack.controller;

import com.meditrack.entity.Medecin;
import com.meditrack.entity.Patient;
import com.meditrack.service.MedecinService;
import com.meditrack.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class UserController {

    @Autowired
    private MedecinService medecinService;

    @Autowired
    private PatientService patientService;

    // Récupérer tous les médecins
    @GetMapping("/medecins")
    public ResponseEntity<List<Medecin>> getAllMedecins() {
        try {
            List<Medecin> medecins = medecinService.getAllMedecins();
            return ResponseEntity.ok(medecins);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Récupérer tous les patients
    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        try {
            List<Patient> patients = patientService.getAllPatients();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Récupérer un médecin par ID
    @GetMapping("/medecins/{id}")
    public ResponseEntity<?> getMedecinById(@PathVariable Long id) {
        try {
            Medecin medecin = medecinService.getMedecinById(id);
            if (medecin != null) {
                return ResponseEntity.ok(medecin);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthController.ErrorResponse("Médecin non trouvé"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

    // Récupérer un patient par ID
    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        try {
            Patient patient = patientService.getPatientById(id);
            if (patient != null) {
                return ResponseEntity.ok(patient);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthController.ErrorResponse("Patient non trouvé"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

    // UserController.java - AJOUTER CES MÉTHODES
    @PutMapping("/medecins/{id}")
    public ResponseEntity<?> updateMedecin(@PathVariable Long id, @RequestBody Medecin medecin) {
        try {
            Medecin updated = medecinService.updateMedecin(id, medecin);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthController.ErrorResponse("Médecin non trouvé"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Erreur lors de la mise à jour: " + e.getMessage()));
        }
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        try {
            Patient updated = patientService.updatePatient(id, patient);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthController.ErrorResponse("Patient non trouvé"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Erreur lors de la mise à jour: " + e.getMessage()));
        }
    }
}
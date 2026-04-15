// Controller/DossierMedicalController.java - VERSION CORRIGÉE
package com.meditrack.controller;

import com.meditrack.entity.DossierMedical;
import com.meditrack.service.DossierMedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/dossiers-medicaux")
@CrossOrigin(origins = "http://localhost:3000")
public class DossierMedicalController {

    @Autowired
    private DossierMedicalService dossierMedicalService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getDossierByPatientId(@PathVariable Long patientId) {
        try {
            Optional<DossierMedical> dossier = dossierMedicalService.getDossierByPatientId(patientId);
            if (dossier.isPresent()) {
                return ResponseEntity.ok(dossier.get());
            } else {
                // Retourner un dossier vide au lieu de 404
                DossierMedical emptyDossier = new DossierMedical();
                emptyDossier.setPatientId(patientId);
                emptyDossier.setAntecedentsMedicaux("");
                emptyDossier.setAllergies("");
                emptyDossier.setTraitementEnCours("");
                return ResponseEntity.ok(emptyDossier);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de la récupération du dossier médical");
        }
    }

    @PostMapping
    public ResponseEntity<?> createDossier(@RequestBody DossierMedical dossier) {
        try {
            DossierMedical savedDossier = dossierMedicalService.saveDossier(dossier);
            return ResponseEntity.ok(savedDossier);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création du dossier médical");
        }
    }

    @PutMapping("/patient/{patientId}")
    public ResponseEntity<?> updateDossier(@PathVariable Long patientId, @RequestBody DossierMedical dossier) {
        try {
            dossier.setPatientId(patientId);
            DossierMedical updatedDossier = dossierMedicalService.updateDossier(patientId, dossier);
            return ResponseEntity.ok(updatedDossier);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour du dossier médical");
        }
    }
}
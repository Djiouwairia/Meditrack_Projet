package com.meditrack.controller;

import com.meditrack.entity.Consultation;
import com.meditrack.service.ConsultationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/consultations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class ConsultationController {

    @Autowired
    private ConsultationService consultationService;

    @GetMapping
    public ResponseEntity<List<Consultation>> getAllConsultations() {
        return ResponseEntity.ok(consultationService.getAllConsultations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getConsultationById(@PathVariable Long id) {
        Consultation consultation = consultationService.getConsultationById(id);
        if (consultation != null) {
            return ResponseEntity.ok(consultation);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Consultation non trouvée"));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Consultation>> getConsultationsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(consultationService.getConsultationsByPatient(patientId));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<Consultation>> getConsultationsByMedecin(@PathVariable Long medecinId) {
        return ResponseEntity.ok(consultationService.getConsultationsByMedecin(medecinId));
    }

    @PostMapping
    public ResponseEntity<Consultation> createConsultation(@RequestBody Consultation consultation) {
        Consultation created = consultationService.saveConsultation(consultation);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateConsultation(@PathVariable Long id, @RequestBody Consultation consultation) {
        Consultation updated = consultationService.updateConsultation(id, consultation);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Consultation non trouvée"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConsultation(@PathVariable Long id) {
        if (consultationService.deleteConsultation(id)) {
            return ResponseEntity.ok(new AuthController.MessageResponse("Consultation supprimée"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Consultation non trouvée"));
    }
}

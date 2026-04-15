package com.meditrack.controller;

import com.meditrack.entity.Patient;
import com.meditrack.service.ConsultationService;
import com.meditrack.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/patients")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private ConsultationService consultationService;

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        Patient patient = patientService.getPatientById(id);
        if (patient != null) {
            return ResponseEntity.ok(patient);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Patient non trouvé"));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<Patient>> getPatientsByMedecin(@PathVariable Long medecinId) {
        return ResponseEntity.ok(patientService.getPatientsByMedecin(medecinId));
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Patient created = patientService.savePatient(patient);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        Patient updated = patientService.updatePatient(id, patient);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Patient non trouvé"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        if (patientService.deletePatient(id)) {
            return ResponseEntity.ok(new AuthController.MessageResponse("Patient supprimé"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Patient non trouvé"));
    }

    // 🔥 CORRECTION : Récupérer les patients qui ont eu des consultations avec un médecin
    @GetMapping("/medecin-consultations/{medecinId}")
    public ResponseEntity<List<Patient>> getPatientsByMedecinConsultations(@PathVariable Long medecinId) {
        try {
            // 🔥 CORRECTION : Utiliser la méthode du service au lieu d'appeler directement ConsultationService
            List<Patient> patients = patientService.getPatientsByMedecinConsultations(medecinId);
            return ResponseEntity.ok(patients);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
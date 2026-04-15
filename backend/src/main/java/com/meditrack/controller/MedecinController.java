package com.meditrack.controller;

import com.meditrack.entity.Medecin;
import com.meditrack.service.MedecinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/medecins")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class MedecinController {

    @Autowired
    private MedecinService medecinService;

    @GetMapping
    public ResponseEntity<List<Medecin>> getAllMedecins() {
        return ResponseEntity.ok(medecinService.getAllMedecins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMedecinById(@PathVariable Long id) {
        Medecin medecin = medecinService.getMedecinById(id);
        if (medecin != null) {
            return ResponseEntity.ok(medecin);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Médecin non trouvé"));
    }



    @GetMapping("/specialite/{specialite}")
    public ResponseEntity<List<Medecin>> getMedecinsBySpecialite(@PathVariable String specialite) {
        return ResponseEntity.ok(medecinService.getMedecinsBySpecialite(specialite));
    }

    @PostMapping
    public ResponseEntity<Medecin> createMedecin(@RequestBody Medecin medecin) {
        Medecin created = medecinService.saveMedecin(medecin);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedecin(@PathVariable Long id, @RequestBody Medecin medecin) {
        Medecin updated = medecinService.updateMedecin(id, medecin);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Médecin non trouvé"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedecin(@PathVariable Long id) {
        if (medecinService.deleteMedecin(id)) {
            return ResponseEntity.ok(new AuthController.MessageResponse("Médecin supprimé"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Médecin non trouvé"));
    }
}

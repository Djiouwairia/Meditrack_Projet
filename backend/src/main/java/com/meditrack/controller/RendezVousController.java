package com.meditrack.controller;

import com.meditrack.dto.RendezVousDTO;
import com.meditrack.dto.CreateRendezVousRequest;
import com.meditrack.dto.UpdateStatutRequest;
import com.meditrack.entity.RendezVous;
import com.meditrack.service.RendezVousService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/rendez-vous")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class RendezVousController {

    @Autowired
    private RendezVousService rendezVousService;

    // Convertir Entity vers DTO
    private RendezVousDTO convertToDTO(RendezVous rendezVous) {
        return new RendezVousDTO(
                rendezVous.getId(),
                rendezVous.getPatientId(),
                rendezVous.getMedecinId(),
                rendezVous.getDateHeure(),
                rendezVous.getDuree(),
                rendezVous.getStatut().name(),
                rendezVous.getMotif(),
                rendezVous.getNotes(),
                rendezVous.getCreatedAt(),
                rendezVous.getUpdatedAt()
        );
    }

    @GetMapping
    public ResponseEntity<List<RendezVousDTO>> getAllRendezVous() {
        List<RendezVousDTO> rdvDTOs = rendezVousService.getAllRendezVous()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rdvDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRendezVousById(@PathVariable Long id) {
        RendezVous rendezVous = rendezVousService.getRendezVousById(id);
        if (rendezVous != null) {
            return ResponseEntity.ok(convertToDTO(rendezVous));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Rendez-vous non trouvé"));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RendezVousDTO>> getRendezVousByPatient(@PathVariable Long patientId) {
        List<RendezVousDTO> rdvDTOs = rendezVousService.getRendezVousByPatient(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rdvDTOs);
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<RendezVousDTO>> getRendezVousByMedecin(@PathVariable Long medecinId) {
        List<RendezVousDTO> rdvDTOs = rendezVousService.getRendezVousByMedecin(medecinId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rdvDTOs);
    }

    @PostMapping
    public ResponseEntity<?> createRendezVous(@RequestBody CreateRendezVousRequest request) {
        try {
            RendezVous rendezVous = new RendezVous();
            rendezVous.setPatientId(request.getPatientId());
            rendezVous.setMedecinId(request.getMedecinId());
            rendezVous.setDateHeure(request.getDateHeure());
            rendezVous.setDuree(request.getDuree());
            rendezVous.setMotif(request.getMotif());
            rendezVous.setNotes(request.getNotes());

            RendezVous created = rendezVousService.saveRendezVous(rendezVous);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Erreur lors de la création: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRendezVous(@PathVariable Long id, @RequestBody CreateRendezVousRequest request) {
        try {
            RendezVous existing = rendezVousService.getRendezVousById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthController.ErrorResponse("Rendez-vous non trouvé"));
            }

            existing.setPatientId(request.getPatientId());
            existing.setMedecinId(request.getMedecinId());
            existing.setDateHeure(request.getDateHeure());
            existing.setDuree(request.getDuree());
            existing.setMotif(request.getMotif());
            existing.setNotes(request.getNotes());

            RendezVous updated = rendezVousService.saveRendezVous(existing);
            return ResponseEntity.ok(convertToDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Erreur lors de la modification: " + e.getMessage()));
        }
    }

    // 🔥 CORRECTION : Maintenant on accepte un objet UpdateStatutRequest au lieu d'une String
    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody UpdateStatutRequest request) {
        try {
            RendezVous existing = rendezVousService.getRendezVousById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AuthController.ErrorResponse("Rendez-vous non trouvé"));
            }

            existing.setStatut(com.meditrack.entity.StatutRendezVous.valueOf(request.getStatut()));
            RendezVous updated = rendezVousService.saveRendezVous(existing);
            return ResponseEntity.ok(convertToDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthController.ErrorResponse("Erreur lors du changement de statut: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRendezVous(@PathVariable Long id) {
        if (rendezVousService.deleteRendezVous(id)) {
            return ResponseEntity.ok(new AuthController.MessageResponse("Rendez-vous supprimé"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new AuthController.ErrorResponse("Rendez-vous non trouvé"));
    }
}
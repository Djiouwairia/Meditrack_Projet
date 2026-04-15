 package com.meditrack.controller;

import com.meditrack.entity.Disponibilite;
import com.meditrack.service.DisponibiliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/disponibilites")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class DisponibiliteController {

    @Autowired
    private DisponibiliteService disponibiliteService;

    // GET /api/disponibilites/medecin/{medecinId}
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<Disponibilite>> getDisponibilitesByMedecin(@PathVariable Long medecinId) {
        List<Disponibilite> disponibilites = disponibiliteService.getDisponibilitesByMedecin(medecinId);
        return ResponseEntity.ok(disponibilites);
    }

    // POST /api/disponibilites/medecin/{medecinId}
    // Cette méthode gère à la fois la création et la mise à jour (remplacement complet)
    @PostMapping("/medecin/{medecinId}")
    public ResponseEntity<List<Disponibilite>> saveDisponibilites(
            @PathVariable Long medecinId,
            @RequestBody List<Disponibilite> disponibilites) {

        List<Disponibilite> savedDisponibilites = disponibiliteService.saveAllDisponibilites(medecinId, disponibilites);
        return ResponseEntity.ok(savedDisponibilites);
    }
}
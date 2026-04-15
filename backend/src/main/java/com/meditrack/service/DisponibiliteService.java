package com.meditrack.service;

import com.meditrack.entity.Disponibilite;
import com.meditrack.repository.DisponibiliteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DisponibiliteService {

    @Autowired
    private DisponibiliteRepository disponibiliteRepository;

    public List<Disponibilite> getDisponibilitesByMedecin(Long medecinId) {
        return disponibiliteRepository.findByMedecinId(medecinId);
    }

    /**
     * Met à jour l'ensemble des disponibilités d'un médecin.
     * Cette méthode supprime tous les anciens créneaux et enregistre les nouveaux.
     */
    @Transactional
    public List<Disponibilite> saveAllDisponibilites(Long medecinId, List<Disponibilite> nouvellesDisponibilites) {
        // 1. Supprimer les anciennes disponibilités
        disponibiliteRepository.deleteByMedecinId(medecinId);

        // 2. Assurer que chaque nouvelle dispo est liée à l'ID du médecin
        nouvellesDisponibilites.forEach(d -> d.setMedecinId(medecinId));

        // 3. Enregistrer les nouvelles
        return disponibiliteRepository.saveAll(nouvellesDisponibilites);
    }
}
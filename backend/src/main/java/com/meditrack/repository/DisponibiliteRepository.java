package com.meditrack.repository;

import com.meditrack.entity.Disponibilite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {
    // Méthode pour récupérer toutes les disponibilités d'un médecin
    List<Disponibilite> findByMedecinId(Long medecinId);

    // Méthode pour supprimer toutes les disponibilités d'un médecin (utile lors de l'enregistrement)
    void deleteByMedecinId(Long medecinId);
}
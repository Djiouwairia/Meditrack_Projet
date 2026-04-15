package com.meditrack.repository;

import com.meditrack.entity.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {
    Optional<Medecin> findByEmail(String email);
    Optional<Medecin> findByNumeroIdentification(String numeroIdentification);
    List<Medecin> findBySpecialite(String specialite);
}

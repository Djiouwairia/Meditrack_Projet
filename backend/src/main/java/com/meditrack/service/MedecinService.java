package com.meditrack.service;

import com.meditrack.entity.Medecin;
import com.meditrack.repository.MedecinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MedecinService {

    @Autowired
    private MedecinRepository medecinRepository;

    public Medecin getMedecinById(Long id) {
        return medecinRepository.findById(id).orElse(null);
    }

    public List<Medecin> getAllMedecins() {
        return medecinRepository.findAll();
    }

    public List<Medecin> getMedecinsBySpecialite(String specialite) {
        return medecinRepository.findBySpecialite(specialite);
    }

    public Medecin saveMedecin(Medecin medecin) {
        return medecinRepository.save(medecin);
    }

    public Medecin updateMedecin(Long id, Medecin medecin) {
        Optional<Medecin> existing = medecinRepository.findById(id);
        if (existing.isPresent()) {
            medecin.setId(id);
            return medecinRepository.save(medecin);
        }
        return null;
    }

    public boolean deleteMedecin(Long id) {
        if (medecinRepository.existsById(id)) {
            medecinRepository.deleteById(id);
            return true;
        }
        return false;
    }


}

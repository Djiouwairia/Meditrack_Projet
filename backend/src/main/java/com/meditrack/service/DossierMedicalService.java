// Service/DossierMedicalService.java
package com.meditrack.service;

import com.meditrack.entity.DossierMedical;
import com.meditrack.repository.DossierMedicalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class DossierMedicalService {

    @Autowired
    private DossierMedicalRepository dossierMedicalRepository;

    public Optional<DossierMedical> getDossierByPatientId(Long patientId) {
        return dossierMedicalRepository.findByPatientId(patientId);
    }

    public DossierMedical saveDossier(DossierMedical dossier) {
        return dossierMedicalRepository.save(dossier);
    }

    public DossierMedical updateDossier(Long patientId, DossierMedical dossier) {
        Optional<DossierMedical> existing = dossierMedicalRepository.findByPatientId(patientId);
        if (existing.isPresent()) {
            dossier.setId(existing.get().getId());
            return dossierMedicalRepository.save(dossier);
        }
        return dossierMedicalRepository.save(dossier);
    }
}
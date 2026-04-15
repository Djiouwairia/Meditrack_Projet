package com.meditrack.service;

import com.meditrack.entity.Patient;
import com.meditrack.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired  // 🔥 AJOUT : Injection de ConsultationService
    private ConsultationService consultationService;

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public List<Patient> getPatientsByMedecin(Long medecinId) {
        return patientRepository.findByMedecinTraitantId(medecinId);
    }

    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient patient) {
        Optional<Patient> existing = patientRepository.findById(id);
        if (existing.isPresent()) {
            patient.setId(id);
            return patientRepository.save(patient);
        }
        return null;
    }

    public boolean deletePatient(Long id) {
        if (patientRepository.existsById(id)) {
            patientRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // 🔥 CORRECTION : Récupérer les patients par consultations d'un médecin
    public List<Patient> getPatientsByMedecinConsultations(Long medecinId) {
        // Récupérer toutes les consultations du médecin
        var consultations = consultationService.getConsultationsByMedecin(medecinId); // 🔥 Utilisation de l'instance

        // Extraire les IDs des patients uniques
        var patientIds = consultations.stream()
                .map(consultation -> consultation.getPatientId())
                .distinct()
                .collect(Collectors.toList());

        // Récupérer les patients correspondants
        return patientIds.stream()
                .map(patientId -> getPatientById(patientId))
                .filter(patient -> patient != null)
                .collect(Collectors.toList());
    }
}
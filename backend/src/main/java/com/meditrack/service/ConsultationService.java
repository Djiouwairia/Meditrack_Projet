package com.meditrack.service;

import com.meditrack.entity.Consultation;
import com.meditrack.repository.ConsultationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ConsultationService {

    @Autowired
    private ConsultationRepository consultationRepository;

    public Consultation getConsultationById(Long id) {
        return consultationRepository.findById(id).orElse(null);
    }

    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }

    public List<Consultation> getConsultationsByPatient(Long patientId) {
        return consultationRepository.findByPatientId(patientId);
    }

    public List<Consultation> getConsultationsByMedecin(Long medecinId) {
        return consultationRepository.findByMedecinId(medecinId);
    }

    public Consultation saveConsultation(Consultation consultation) {
        return consultationRepository.save(consultation);
    }

    public Consultation updateConsultation(Long id, Consultation consultation) {
        Optional<Consultation> existing = consultationRepository.findById(id);
        if (existing.isPresent()) {
            consultation.setId(id);
            return consultationRepository.save(consultation);
        }
        return null;
    }

    public boolean deleteConsultation(Long id) {
        if (consultationRepository.existsById(id)) {
            consultationRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

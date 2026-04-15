import type { Patient, Medecin, RendezVous, Consultation } from "./types"

// Données de test pour le développement
export const mockPatients: (Patient & { password: string })[] = [
  {
    id: "3",
    email: "patient@test.com",
    password: "test123",
    role: "PATIENT",
    nom: "Sow",
    prenom: "Fatou",
    telephone: "+221 77 345 6789",
    dateNaissance: new Date("1990-05-15"),
    numeroSecuriteSociale: "190050012345",
    adresse: "123 Avenue Cheikh Anta Diop, Dakar",
    groupeSanguin: "A+",
    allergies: ["Pénicilline", "Arachides"],
    createdAt: new Date(),
  },
  {
    id: "4",
    email: "marie.fall@email.com",
    password: "test123",
    role: "PATIENT",
    nom: "Fall",
    prenom: "Marie",
    telephone: "+221 77 456 7890",
    dateNaissance: new Date("1985-08-22"),
    numeroSecuriteSociale: "185082234567",
    adresse: "45 Rue de la République, Dakar",
    groupeSanguin: "O+",
    allergies: [],
    createdAt: new Date(),
  },
]

export const mockMedecins: (Medecin & { password: string })[] = [
  {
    id: "2",
    email: "dr.diallo@meditrack.com",
    password: "test123",
    role: "MEDECIN",
    nom: "Diallo",
    prenom: "Dr. Amadou",
    telephone: "+221 77 234 5678",
    specialite: "Médecine Générale",
    numeroIdentification: "MED2024001",
    adresseCabinet: "Cabinet Médical Point E, Dakar",
    disponibilites: [
      {
        id: "d1",
        medecinId: "2",
        jourSemaine: 1, // Lundi
        heureDebut: "09:00",
        heureFin: "17:00",
        dureeCreneaux: 30,
      },
      {
        id: "d2",
        medecinId: "2",
        jourSemaine: 2, // Mardi
        heureDebut: "09:00",
        heureFin: "17:00",
        dureeCreneaux: 30,
      },
      {
        id: "d3",
        medecinId: "2",
        jourSemaine: 3, // Mercredi
        heureDebut: "09:00",
        heureFin: "17:00",
        dureeCreneaux: 30,
      },
      {
        id: "d4",
        medecinId: "2",
        jourSemaine: 4, // Jeudi
        heureDebut: "09:00",
        heureFin: "17:00",
        dureeCreneaux: 30,
      },
      {
        id: "d5",
        medecinId: "2",
        jourSemaine: 5, // Vendredi
        heureDebut: "09:00",
        heureFin: "13:00",
        dureeCreneaux: 30,
      },
    ],
    tarifConsultation: 15000,
    createdAt: new Date(),
  },
  {
    id: "5",
    email: "dr.ndiaye@meditrack.com",
    password: "test123",
    role: "MEDECIN",
    nom: "Ndiaye",
    prenom: "Dr. Aissatou",
    telephone: "+221 77 567 8901",
    specialite: "Pédiatrie",
    numeroIdentification: "MED2024002",
    adresseCabinet: "Clinique des Enfants, Plateau",
    disponibilites: [
      {
        id: "d6",
        medecinId: "5",
        jourSemaine: 1,
        heureDebut: "08:00",
        heureFin: "16:00",
        dureeCreneaux: 30,
      },
      {
        id: "d7",
        medecinId: "5",
        jourSemaine: 3,
        heureDebut: "08:00",
        heureFin: "16:00",
        dureeCreneaux: 30,
      },
      {
        id: "d8",
        medecinId: "5",
        jourSemaine: 5,
        heureDebut: "08:00",
        heureFin: "16:00",
        dureeCreneaux: 30,
      },
    ],
    tarifConsultation: 18000,
    createdAt: new Date(),
  },
]

export const mockRendezVous: RendezVous[] = [
  {
    id: "rdv1",
    patientId: "3",
    medecinId: "2",
    dateHeure: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
    duree: 30,
    statut: "CONFIRME",
    motif: "Consultation de suivi",
    notes: "Contrôle après traitement",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "rdv2",
    patientId: "4",
    medecinId: "5",
    dateHeure: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
    duree: 30,
    statut: "DEMANDE",
    motif: "Vaccination enfant",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockConsultations: Consultation[] = [
  {
    id: "cons1",
    rendezVousId: "rdv1",
    patientId: "3",
    medecinId: "2",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
    motif: "Douleurs abdominales",
    examenClinique: "Température: 37.2°C, Tension: 120/80, Palpation abdominale normale",
    diagnostic: "Gastrite légère",
    prescriptions: [
      {
        id: "presc1",
        consultationId: "cons1",
        medicament: "Oméprazole",
        dosage: "20mg",
        frequence: "1 fois par jour",
        duree: "14 jours",
        instructions: "À prendre le matin à jeun",
      },
    ],
    notesPrivees: "Patient stressé, recommander gestion du stress",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
]

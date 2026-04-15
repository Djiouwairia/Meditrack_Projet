// Types pour MediTrack Pro

export type UserRole = "PATIENT" | "MEDECIN" | "ADMIN"

export interface User {
  id: string
  email: string
  role: UserRole
  nom: string
  prenom: string
  telephone: string
  createdAt: Date
}

export interface Patient extends User {
  role: "PATIENT"
  dateNaissance: Date
  numeroSecuriteSociale: string
  adresse: string
  medecinTraitantId?: string
  groupeSanguin?: string
  allergies?: string[]
}

// lib/types.ts - CORRIGER POUR CORRESPONDRE À L'API
export interface Medecin {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    specialite: string;
    adresseCabinet: string;
    numeroIdentification?: string;
    tarifConsultation?: number;
    role?: UserRole;
    createdAt?: string;
    // Rendre disponibilites optionnel car il n'est pas dans la réponse API
    disponibilites?: Disponibilite[];
}

export interface Admin extends User {
  role: "ADMIN"
  departement: string
}

export interface Disponibilite {
  id: string
  medecinId: string
  jourSemaine: number // 0-6 (Dimanche-Samedi)
  heureDebut: string // "09:00"
  heureFin: string // "17:00"
  dureeCreneaux: number // en minutes
}

export type StatutRendezVous = "DEMANDE" | "CONFIRME" | "ANNULE" | "TERMINE"

export interface RendezVous {
  id: string
  patientId: string
  medecinId: string
  dateHeure: Date
  duree: number // en minutes
  statut: StatutRendezVous
  motif: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Consultation {
  id: string
  rendezVousId: string
  patientId: string
  medecinId: string
  date: Date
  motif: string
  examenClinique: string
  diagnostic: string
  prescriptions: Prescription[]
  notesPrivees?: string
  createdAt: Date
}

export interface Prescription {
  id: string
  consultationId: string
  medicament: string
  dosage: string
  frequence: string
  duree: string
  instructions?: string
}

export interface DossierMedical {
  id: string
  patientId: string
  antecedentsMedicaux: string[]
  allergies: string[]
  traitementEnCours: string[]
  consultations: Consultation[]
  documentsIds: string[]
  updatedAt: Date
}

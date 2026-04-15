// lib/api-client.ts (AJOUT DES DISPONIBILITÉS)
const API_BASE_URL = "http://localhost:8080/api"

// --- TYPES EXISTANTS ---
type UserRole = 'PATIENT' | 'MEDECIN' | 'ADMIN';

export interface UserDTO {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    role: UserRole;
    status?: string;
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse extends UserDTO {}

// lib/types.ts - CORRIGER POUR CORRESPONDRE À L'API
export interface Medecin {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    password: string; // 🔥 AJOUTER CE CHAMP
    role: UserRole;   // 🔥 AJOUTER CE CHAMP
    specialite: string;
    numeroIdentification?: string;
    adresseCabinet: string;
    tarifConsultation?: number;
    createdAt?: string;
    updatedAt?: string;
    // Rendre disponibilites optionnel car il n'est pas dans la réponse API
    disponibilites?: Disponibilite[];
}

// Dans lib/api-client.ts - CORRIGER LE TYPE Patient
// Et aussi corriger le type Patient pour être cohérent
export interface Patient {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    password: string; // 🔥 AJOUTER CE CHAMP
    role: UserRole;   // 🔥 AJOUTER CE CHAMP
    dateNaissance?: string;
    numeroSecuriteSociale?: string;
    adresse?: string;
    groupeSanguin?: string;
    allergies?: string;
    medecinTraitantId?: number;
    createdAt?: string;
    updatedAt?: string;
}// --- NOUVEAUX TYPES POUR LES DISPONIBILITÉS ---
export interface Disponibilite {
    id: number;
    medecinId: number;
    jourSemaine: number; // 1-7 (Lundi=1, Dimanche=7)
    heureDebut: string; // HH:mm
    heureFin: string; // HH:mm
    dureeCreneaux: number;
}

export interface CreneauDisponible {
    date: string; // YYYY-MM-DD
    heure: string; // HH:mm
    medecinId: number;
    duree: number;
    medecinNom: string;
    medecinSpecialite: string;
}

export interface DossierMedical {
    id: number;
    patientId: number;
    antecedentsMedicaux: string;
    allergies: string;
    traitementEnCours: string;
    updatedAt: string;
}

export interface CreateDossierMedicalRequest {
    patientId: number;
    antecedentsMedicaux?: string;
    allergies?: string;
    traitementEnCours?: string;
}

// --------------------------------------------------

async function fetchApi<T = any>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: any
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const options: RequestInit = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
    }

    console.log(`🌐 [API] ${method} ${url}`, data ? { data } : '')

    try {
        const response = await fetch(url, options)

        console.log(`📡 [API Response] Status: ${response.status} ${response.statusText}`)

        if (!response.ok) {
            let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`

            try {
                const errorText = await response.text()
                if (errorText) {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.message || errorData.error || errorMessage
                }
            } catch (e) {
                console.error("❌ Failed to parse API error response:", e)
            }

            throw new Error(errorMessage)
        }

        const text = await response.text()
        if (!text) {
            console.log("✅ [API] Empty response")
            return {} as T
        }

        const parsedData = JSON.parse(text)
        console.log("✅ [API] Success response:", parsedData)
        return parsedData as T

    } catch (error) {
        console.error("💥 [API Fetch Fatal Error]", error)
        throw error
    }
}

export const apiClient = {
    get: <T>(endpoint: string) => fetchApi<T>(endpoint, "GET"),
    post: <T>(endpoint: string, data: any) => fetchApi<T>(endpoint, "POST", data),
    put: <T>(endpoint: string, data: any) => fetchApi<T>(endpoint, "PUT", data),
    delete: <T>(endpoint: string) => fetchApi<T>(endpoint, "DELETE"),
}

// Types pour les rendez-vous
export interface RendezVous {
    id: number;
    patientId: number;
    medecinId: number;
    dateHeure: string;
    duree: number;
    statut: string;
    motif: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateRendezVousRequest {
    patientId: number;
    medecinId: number;
    dateHeure: string;
    duree: number;
    motif: string;
    notes?: string;
}

export interface UpdateStatutRequest {
    statut: string;
}

// Méthodes pour les rendez-vous
export const rendezVousApi = {
    getAll: (): Promise<RendezVous[]> =>
        apiClient.get<RendezVous[]>('/rendez-vous'),

    getById: (id: number): Promise<RendezVous> =>
        apiClient.get<RendezVous>(`/rendez-vous/${id}`),

    getByPatient: (patientId: number): Promise<RendezVous[]> =>
        apiClient.get<RendezVous[]>(`/rendez-vous/patient/${patientId}`),

    getByMedecin: (medecinId: number): Promise<RendezVous[]> =>
        apiClient.get<RendezVous[]>(`/rendez-vous/medecin/${medecinId}`),

    create: (data: CreateRendezVousRequest): Promise<RendezVous> =>
        apiClient.post<RendezVous>('/rendez-vous', data),

    update: (id: number, data: CreateRendezVousRequest): Promise<RendezVous> =>
        apiClient.put<RendezVous>(`/rendez-vous/${id}`, data),

    updateStatut: (id: number, statut: string): Promise<RendezVous> =>
        apiClient.put<RendezVous>(`/rendez-vous/${id}/statut`, { statut }),

    delete: (id: number): Promise<void> =>
        apiClient.delete(`/rendez-vous/${id}`),
};

// --- NOUVEAU : MÉTHODES POUR LES DISPONIBILITÉS ---
export const disponibilitesApi = {
    getByMedecin: (medecinId: number): Promise<Disponibilite[]> =>
        apiClient.get<Disponibilite[]>(`/disponibilites/medecin/${medecinId}`),

    saveAll: (medecinId: number, disponibilites: Disponibilite[]): Promise<Disponibilite[]> =>
        apiClient.post<Disponibilite[]>(`/disponibilites/medecin/${medecinId}`, disponibilites),
};

// --- NOUVEAU : SERVICE POUR LES CRÉNEAUX DISPONIBLES ---
export const creneauxApi = {
    getCreneauxDisponibles: async (medecinId: number, medecin: Medecin): Promise<CreneauDisponible[]> => {
        try {
            // 🔥 CORRECTION : Récupérer les disponibilités réelles du médecin
            const disponibilites = await disponibilitesApi.getByMedecin(medecinId);

            if (disponibilites.length === 0) {
                return [];
            }

            // 🔥 CORRECTION : Générer les créneaux à partir des disponibilités réelles
            return genererCreneauxFromDisponibilites(disponibilites, medecin);
        } catch (error) {
            console.error("Erreur récupération créneaux:", error);
            return [];
        }
    },
};


// Fonction utilitaire pour générer les créneaux à partir des disponibilités
const genererCreneauxFromDisponibilites = (disponibilites: Disponibilite[], medecin: Medecin): CreneauDisponible[] => {
    const creneaux: CreneauDisponible[] = [];
    const aujourdhui = new Date();

    // Générer pour les 14 prochains jours
    for (let i = 1; i <= 14; i++) {
        const date = new Date(aujourdhui);
        date.setDate(aujourdhui.getDate() + i);

        const jourSemaine = date.getDay() === 0 ? 7 : date.getDay(); // Convertir en 1-7 (Lundi=1)

        // Trouver les disponibilités pour ce jour
        const disposDuJour = disponibilites.filter(d => d.jourSemaine === jourSemaine);

        for (const dispo of disposDuJour) {
            const creneauxDuJour = genererCreneauxPourJour(date, dispo, medecin);
            creneaux.push(...creneauxDuJour);
        }
    }

    return creneaux.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.heure}`);
        const dateB = new Date(`${b.date}T${b.heure}`);
        return dateA.getTime() - dateB.getTime();
    });
};


const genererCreneauxPourJour = (date: Date, dispo: Disponibilite, medecin: Medecin): CreneauDisponible[] => {
    const creneaux: CreneauDisponible[] = [];
    const dateStr = date.toISOString().split('T')[0];

    const [debutHeures, debutMinutes] = dispo.heureDebut.split(':').map(Number);
    const [finHeures, finMinutes] = dispo.heureFin.split(':').map(Number);

    let heureActuelle = new Date(date);
    heureActuelle.setHours(debutHeures, debutMinutes, 0, 0);

    const heureFin = new Date(date);
    heureFin.setHours(finHeures, finMinutes, 0, 0);

    // Générer les créneaux selon la durée configurée
    while (heureActuelle < heureFin) {
        const heureStr = heureActuelle.toTimeString().slice(0, 5);

        creneaux.push({
            medecinId: medecin.id,
            date: dateStr,
            heure: heureStr,
            duree: dispo.dureeCreneaux,
            medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
            medecinSpecialite: medecin.specialite
        });

        // Avancer de la durée du créneau
        heureActuelle = new Date(heureActuelle.getTime() + dispo.dureeCreneaux * 60000);
    }

    return creneaux;
};

// lib/api-client.ts - CORRECTION DES URLS PATIENT

// Méthodes pour les utilisateurs - GARDER /api pour les listes
export const usersApi = {
    getMedecins: (): Promise<Medecin[]> =>
        apiClient.get<Medecin[]>('/api/medecins'),

    getPatients: (): Promise<Patient[]> =>
        apiClient.get<Patient[]>('/api/patients'),

    getMedecinById: (id: number): Promise<Medecin> =>
        apiClient.get<Medecin>(`/api/medecins/${id}`),

    getPatientById: (id: number): Promise<Patient> =>
        apiClient.get<Patient>(`/api/patients/${id}`), // 🔥 UserController

    getMedecin: (id: number): Promise<Medecin> =>
        apiClient.get<Medecin>(`/api/medecins/${id}`),

    getPatient: (id: number): Promise<Patient> =>
        apiClient.get<Patient>(`/api/patients/${id}`), // 🔥 UserController


    // Dans usersApi, ajoutez:
    updateMedecin: (id: number, data: Partial<Medecin>): Promise<Medecin> =>
        apiClient.put<Medecin>(`/api/medecins/${id}`, data),

    updatePatient: (id: number, data: Partial<Patient>): Promise<Patient> =>
        apiClient.put<Patient>(`/api/patients/${id}`, data),

    getPatientsByMedecinConsultations: (medecinId: number): Promise<Patient[]> =>
        apiClient.get<Patient[]>(`/patients/medecin-consultations/${medecinId}`), // 🔥 PatientController
};

// Méthodes d'authentification
export const authApi = {
    login: (data: LoginRequest): Promise<LoginResponse> =>
        apiClient.post<LoginResponse>('/auth/login', data),

    getProfile: (id: number): Promise<UserDTO> =>
        apiClient.get<UserDTO>(`/auth/profile/${id}`),
};

// Méthodes pour l'administration
export const adminApi = {
    getUsers: (): Promise<UserDTO[]> =>
        apiClient.get<UserDTO[]>('/admin/users'),

    createUser: (data: any): Promise<UserDTO> =>
        apiClient.post<UserDTO>('/admin/users', data),

    updateUser: (id: number, data: any): Promise<UserDTO> =>
        apiClient.put<UserDTO>(`/admin/users/${id}`, data),

    deleteUser: (id: number): Promise<void> =>
        apiClient.delete(`/admin/users/${id}`),
};

// Types pour les consultations
export interface Consultation {
    id: number;
    rendezVousId?: number;
    patientId: number;
    medecinId: number;
    date: string;
    motif: string;
    examenClinique?: string;
    diagnostic?: string;
    notesPrivees?: string;
    createdAt: string;
}

export interface CreateConsultationRequest {
    rendezVousId?: number;
    patientId: number;
    medecinId: number;
    date: string;
    motif: string;
    examenClinique?: string;
    diagnostic?: string;
    notesPrivees?: string;
}

// Méthodes pour les consultations
export const consultationsApi = {
    getAll: (): Promise<Consultation[]> =>
        apiClient.get<Consultation[]>('/consultations'),

    getById: (id: number): Promise<Consultation> =>
        apiClient.get<Consultation>(`/consultations/${id}`),

    getByPatient: (patientId: number): Promise<Consultation[]> =>
        apiClient.get<Consultation[]>(`/consultations/patient/${patientId}`),

    getByMedecin: (medecinId: number): Promise<Consultation[]> =>
        apiClient.get<Consultation[]>(`/consultations/medecin/${medecinId}`),

    create: (data: CreateConsultationRequest): Promise<Consultation> =>
        apiClient.post<Consultation>('/consultations', data),

    update: (id: number, data: CreateConsultationRequest): Promise<Consultation> =>
        apiClient.put<Consultation>(`/consultations/${id}`, data),

    delete: (id: number): Promise<void> =>
        apiClient.delete(`/consultations/${id}`),
};

// DOSSIERS MÉDICAUX
export const dossiersMedicauxApi = {
    getByPatient: (patientId: number): Promise<DossierMedical> =>
        apiClient.get<DossierMedical>(`/api/dossiers-medicaux/patient/${patientId}`),

    create: (data: CreateDossierMedicalRequest): Promise<DossierMedical> =>
        apiClient.post<DossierMedical>('/api/dossiers-medicaux', data),

    update: (patientId: number, data: CreateDossierMedicalRequest): Promise<DossierMedical> =>
        apiClient.put<DossierMedical>(`/api/dossiers-medicaux/patient/${patientId}`, data),
};

// Fonction de test pour vérifier la connexion API
export const testApiConnection = async () => {
    console.log("🔍 Test de connexion API...");

    try {
        console.log("🩺 Test endpoint /api/medecins...");
        const medecins = await apiClient.get('/api/medecins');
        console.log("✅ Médecins chargés:", medecins);

        console.log("👤 Test endpoint /api/patients...");
        const patients = await apiClient.get('/api/patients');
        console.log("✅ Patients chargés:", patients);

        return { medecins, patients };
    } catch (error: any) {
        console.error("❌ Erreur de connexion API:", error);
        throw error;
    }
};

// CORRECTION dans lib/api-client.ts
export const patientsApi = {
    getPatientProfile: (patientId: number): Promise<Patient> =>
        apiClient.get<Patient>(`/api/patients/${patientId}`), // 🔥 AJOUTER /api/

    updatePatient: (patientId: number, data: Partial<Patient>): Promise<Patient> =>
        apiClient.put<Patient>(`/api/patients/${patientId}`, data), // 🔥 AJOUTER /api/
};
// lib/creneaux-service.ts
import { apiClient } from "./api-client";

export interface CreneauDisponible {
    id?: number;
    medecinId: number;
    date: string; // YYYY-MM-DD
    heure: string; // HH:mm
    duree: number;
    medecinNom: string;
    medecinSpecialite: string;
}

export interface Disponibilite {
    id: number;
    medecinId: number;
    jourSemaine: number; // 1-7 (Lundi=1, Dimanche=7)
    heureDebut: string; // HH:mm
    heureFin: string; // HH:mm
    dureeCreneaux: number;
}

export const creneauxService = {
    // Récupérer les disponibilités d'un médecin
    getDisponibilitesByMedecin: async (medecinId: number): Promise<Disponibilite[]> => {
        return await apiClient.get<Disponibilite[]>(`/disponibilites/medecin/${medecinId}`);
    },

    // Générer les créneaux disponibles pour un médecin
    getCreneauxDisponibles: async (medecinId: number, medecin: any): Promise<CreneauDisponible[]> => {
        try {
            // 1. Récupérer les disponibilités du médecin
            const disponibilites = await creneauxService.getDisponibilitesByMedecin(medecinId);

            if (disponibilites.length === 0) {
                return [];
            }

            // 2. Générer les créneaux pour les 14 prochains jours
            return creneauxService.genererCreneauxFromDisponibilites(disponibilites, medecin);
        } catch (error) {
            console.error("Erreur récupération créneaux:", error);
            return [];
        }
    },

    // Générer les créneaux à partir des disponibilités
    genererCreneauxFromDisponibilites: (disponibilites: Disponibilite[], medecin: any): CreneauDisponible[] => {
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
                const creneauxDuJour = creneauxService.genererCreneauxPourJour(
                    date,
                    dispo,
                    medecin
                );
                creneaux.push(...creneauxDuJour);
            }
        }

        return creneaux.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.heure}`);
            const dateB = new Date(`${b.date}T${b.heure}`);
            return dateA.getTime() - dateB.getTime();
        });
    },

    // Générer les créneaux pour une journée spécifique
    genererCreneauxPourJour: (date: Date, dispo: Disponibilite, medecin: any): CreneauDisponible[] => {
        const creneaux: CreneauDisponible[] = [];
        const dateStr = date.toISOString().split('T')[0];

        const [debutHeures, debutMinutes] = dispo.heureDebut.split(':').map(Number);
        const [finHeures, finMinutes] = dispo.heureFin.split(':').map(Number);

        let heureActuelle = new Date(date);
        heureActuelle.setHours(debutHeures, debutMinutes, 0, 0);

        const heureFin = new Date(date);
        heureFin.setHours(finHeures, finMinutes, 0, 0);

        // Générer les créneaux toutes les 30 minutes (ou selon la durée configurée)
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
    }
};
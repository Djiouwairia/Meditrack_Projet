"use client"

// Suppression de l'importation de "@/lib/auth-context" pour éviter l'erreur de compilation
// import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText, Activity } from "lucide-react"

// --- Définitions Locales pour Résoudre l'Erreur de Compilation ---
type UserRole = 'ADMIN' | 'MEDECIN' | 'PATIENT';

interface UserDTO {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    role: UserRole;
    createdAt?: string;
}

/**
 * Version simplifiée de useAuth() pour fournir un utilisateur ADMIN par défaut.
 * REMPLACER CECI par votre véritable hook useAuth lorsque l'importation sera corrigée.
 */
const useAuth = () => {
    const mockUser: UserDTO = {
        id: 1,
        email: "admin.mock@meditrack.fr",
        prenom: "Marie",
        nom: "Dupont",
        telephone: "0102030405",
        role: 'ADMIN'
    };
    return { user: mockUser };
};
// -------------------------------------------------------------------

export default function DashboardPage() {
    // Le hook useAuth() utilise maintenant la version locale simulée
    const { user } = useAuth()

    const getWelcomeMessage = () => {
        switch (user?.role) {
            case "ADMIN":
                return "Bienvenue dans votre espace administrateur"
            case "MEDECIN":
                return "Bienvenue dans votre espace médecin"
            case "PATIENT":
                return "Bienvenue dans votre espace patient"
            default:
                return "Bienvenue"
        }
    }

    const getDashboardStats = () => {
        switch (user?.role) {
            case "ADMIN":
                return [
                    { title: "Total Patients", value: "1,234", icon: Users, color: "text-blue-600" },
                    { title: "Médecins Actifs", value: "45", icon: Activity, color: "text-green-600" },
                    { title: "RDV Aujourd'hui", value: "67", icon: Calendar, color: "text-purple-600" },
                    { title: "Consultations", value: "89", icon: FileText, color: "text-orange-600" },
                ]
            case "MEDECIN":
                return [
                    { title: "Mes Patients", value: "156", icon: Users, color: "text-blue-600" },
                    { title: "RDV Aujourd'hui", value: "12", icon: Calendar, color: "text-purple-600" },
                    { title: "Consultations Mois", value: "234", icon: FileText, color: "text-green-600" },
                    { title: "En Attente", value: "8", icon: Activity, color: "text-orange-600" },
                ]
            case "PATIENT":
                return [
                    { title: "Prochain RDV", value: "2 jours", icon: Calendar, color: "text-purple-600" },
                    { title: "Consultations", value: "5", icon: FileText, color: "text-blue-600" },
                    { title: "Médecin Traitant", value: "Assigné", icon: Activity, color: "text-green-600" },
                    { title: "Dossier Médical", value: "À jour", icon: Users, color: "text-orange-600" },
                ]
            default:
                return []
        }
    }

    const stats = getDashboardStats()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Bonjour, {user?.prenom} {user?.nom}
                </h1>
                <p className="text-muted-foreground">{getWelcomeMessage()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <Icon className={`w-4 h-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bienvenue sur MediTrack Pro</CardTitle>
                    <CardDescription>Votre système de gestion hospitalière complet</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Cette application vous permet de gérer efficacement tous les aspects de votre activité médicale :
                            patients, rendez-vous, consultations et dossiers médicaux.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="p-4 bg-accent rounded-lg">
                                <h3 className="font-semibold mb-2">Gestion des Patients</h3>
                                <p className="text-sm text-muted-foreground">Suivi complet des dossiers médicaux et historiques</p>
                            </div>
                            <div className="p-4 bg-accent rounded-lg">
                                <h3 className="font-semibold mb-2">Rendez-vous</h3>
                                <p className="text-sm text-muted-foreground">Planning intelligent et gestion des créneaux</p>
                            </div>
                            <div className="p-4 bg-accent rounded-lg">
                                <h3 className="font-semibold mb-2">Consultations</h3>
                                <p className="text-sm text-muted-foreground">Saisie et traçabilité des diagnostics et prescriptions</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
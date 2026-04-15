"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import type { Disponibilite } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

// --- Types et Conventions Locales ---

// Interface pour le DTO venant du backend (Long = number en TS)
interface DisponibiliteAPIDTO {
    id: number | undefined; // L'ID peut être non défini lors de la création
    medecinId: number;
    jourSemaine: number; // 1-7
    heureDebut: string;
    heureFin: string;
    dureeCreneaux: number;
}

const joursMapping: Record<number, string> = {
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi",
    0: "Dimanche", // Convention Frontend (0)
    7: "Dimanche", // Convention Backend (7)
}

// Convertit 0 (dimanche) en 7 pour l'API Spring, sinon le jour reste le même.
const toApiDay = (clientDay: number): number => clientDay === 0 ? 7 : clientDay;

// Convertit 7 (dimanche API) en 0 pour le frontend, sinon le jour reste le même.
const fromApiDay = (apiDay: number): number => apiDay === 7 ? 0 : apiDay;


export default function DisponibilitesPage() {
    // userId est number | null
    const { user, userId, isAuthenticated } = useAuth()
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [isLoadingDispos, setIsLoadingDispos] = useState(true)

    const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([])

    const [newDisponibilite, setNewDisponibilite] = useState<Partial<Disponibilite>>({
        jourSemaine: 1,
        heureDebut: "09:00",
        heureFin: "17:00",
        dureeCreneaux: 30,
    })

    // --- 1. Chargement des Disponibilités au démarrage ---
    useEffect(() => {
        // userId doit être de type number à l'intérieur de la fonction
        if (!isAuthenticated || user?.role !== "MEDECIN" || typeof userId !== 'number') {
            setIsLoadingDispos(false);
            return;
        }

        const fetchDisponibilites = async () => {
            setIsLoadingDispos(true);
            try {
                // GET /api/disponibilites/medecin/{medecinId}
                const response = await apiClient.get<DisponibiliteAPIDTO[]>(`/disponibilites/medecin/${userId}`);

                // Mappage des données de l'API (number) vers l'état interne React (string)
                const clientDispos: Disponibilite[] = response.map(d => ({
                    // Conversion de number en string
                    id: d.id!.toString(), // On suppose que l'ID est présent lors du chargement
                    medecinId: d.medecinId.toString(),
                    jourSemaine: fromApiDay(d.jourSemaine),
                    heureDebut: d.heureDebut,
                    heureFin: d.heureFin,
                    dureeCreneaux: d.dureeCreneaux,
                }));

                setDisponibilites(clientDispos);
                setError("");
            } catch (e) {
                console.error("Erreur de chargement des disponibilités:", e);
                setError("Impossible de charger les disponibilités.");
                setDisponibilites([]);
            } finally {
                setIsLoadingDispos(false);
            }
        };

        fetchDisponibilites();
    }, [isAuthenticated, user?.role, userId]);


    const handleAdd = () => {
        if (!newDisponibilite.jourSemaine || !newDisponibilite.heureDebut || !newDisponibilite.heureFin) {
            setError("Veuillez remplir tous les champs")
            return
        }

        // FIX : Conversion explicite de user?.id en string pour respecter Disponibilite.medecinId: string
        const medecinIdString = user?.id ? String(user.id) : "";

        const newDispo: Disponibilite = {
            id: `d${Date.now()}`,
            medecinId: medecinIdString, // Utilisation de la valeur garantie string
            jourSemaine: newDisponibilite.jourSemaine,
            heureDebut: newDisponibilite.heureDebut,
            heureFin: newDisponibilite.heureFin,
            dureeCreneaux: newDisponibilite.dureeCreneaux || 30,
        }

        setDisponibilites([...disponibilites, newDispo])
        setNewDisponibilite({
            jourSemaine: 1,
            heureDebut: "09:00",
            heureFin: "17:00",
            dureeCreneaux: 30,
        })
        setError("")
    }

    const handleDelete = (id: string) => {
        setDisponibilites(disponibilites.filter((d) => d.id !== id))
    }

    // --- 2. Fonction de sauvegarde ---
    const handleSave = async () => {
        setError("")
        setSuccess(false)

        // Vérification du type pour que TypeScript sache que userId est un number ici
        if (typeof userId !== 'number') {
            setError("ID du médecin non disponible ou invalide pour la sauvegarde.");
            return;
        }

        // 1. Préparer les données en DTO pour l'API (AVEC CAST EXPLICITE)
        const dataToSend: DisponibiliteAPIDTO[] = disponibilites.map(d => ({
            // Laissez l'ID undefined si c'est un nouvel élément généré localement (e.g. 'd1234')
            id: d.id.startsWith('d') ? undefined : Number.parseInt(d.id),
            // userId est maintenant garanti d'être un number
            medecinId: userId,
            // Conversion du jour de la semaine (0 > 7)
            jourSemaine: toApiDay(d.jourSemaine),
            heureDebut: d.heureDebut,
            heureFin: d.heureFin,
            dureeCreneaux: d.dureeCreneaux,
        }));

        try {
            // POST /api/disponibilites/medecin/{medecinId}
            const savedDispos = await apiClient.post<DisponibiliteAPIDTO[]>(
                `/disponibilites/medecin/${userId}`,
                dataToSend
            );

            // 2. Mettre à jour l'état avec les données renvoyées par l'API (avec les vrais IDs générés)
            const clientDispos: Disponibilite[] = savedDispos.map(d => ({
                // Retour à string pour l'état local
                id: d.id!.toString(), // On suppose que l'ID est généré par le backend
                medecinId: d.medecinId.toString(),
                jourSemaine: fromApiDay(d.jourSemaine),
                heureDebut: d.heureDebut,
                heureFin: d.heureFin,
                dureeCreneaux: d.dureeCreneaux,
            }));

            setDisponibilites(clientDispos);

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (e) {
            console.error("Erreur de sauvegarde des disponibilités:", e);
            setError("Échec de l'enregistrement des disponibilités. Veuillez vérifier la console.");
        }
    }


    // Affichage du loader pendant le chargement initial
    if (isLoadingDispos && isAuthenticated && user?.role === "MEDECIN") {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-700">Chargement des créneaux...</span>
            </div>
        )
    }

    // Vérification des droits d'accès
    if (user?.role !== "MEDECIN") {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Cette page est réservée aux médecins.</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-balance">Mes Disponibilités</h1>
                <p className="text-muted-foreground">Gérez vos créneaux de consultation</p>
            </div>

            {success && (
                <Alert className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Vos disponibilités ont été enregistrées avec succès!</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une disponibilité</CardTitle>
                    <CardDescription>Définissez vos horaires de consultation pour chaque jour de la semaine</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Jour de la semaine</Label>
                            <Select
                                value={newDisponibilite.jourSemaine?.toString()}
                                onValueChange={(value) =>
                                    setNewDisponibilite({ ...newDisponibilite, jourSemaine: Number.parseInt(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Affichage trié et sans le 7 pour la sélection */}
                                    {Object.entries(joursMapping)
                                        .filter(([key]) => key !== '7')
                                        .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
                                        .map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Heure de début</Label>
                            <Input
                                type="time"
                                value={newDisponibilite.heureDebut}
                                onChange={(e) => setNewDisponibilite({ ...newDisponibilite, heureDebut: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Heure de fin</Label>
                            <Input
                                type="time"
                                value={newDisponibilite.heureFin}
                                onChange={(e) => setNewDisponibilite({ ...newDisponibilite, heureFin: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Durée créneaux (min)</Label>
                            <Select
                                value={newDisponibilite.dureeCreneaux?.toString()}
                                onValueChange={(value) =>
                                    setNewDisponibilite({ ...newDisponibilite, dureeCreneaux: Number.parseInt(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 min</SelectItem>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="45">45 min</SelectItem>
                                    <SelectItem value="60">60 min</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={handleAdd} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Créneaux configurés</CardTitle>
                        <CardDescription>Liste de vos disponibilités par jour</CardDescription>
                    </div>
                    <Button onClick={handleSave} disabled={disponibilites.length === 0}>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                    </Button>
                </CardHeader>
                <CardContent>
                    {disponibilites.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune disponibilité configurée</p>
                            <p className="text-sm">Ajoutez vos premiers créneaux de consultation</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {disponibilites
                                .sort((a, b) => a.jourSemaine - b.jourSemaine)
                                .map((dispo) => (
                                    <div
                                        key={dispo.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="font-medium">{joursMapping[dispo.jourSemaine]}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    {dispo.heureDebut} - {dispo.heureFin}
                                                    <Badge variant="outline" className="ml-2">
                                                        {dispo.dureeCreneaux} min
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dispo.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
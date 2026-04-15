"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { rendezVousApi, usersApi, RendezVous, Medecin } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Plus, CheckCircle, XCircle, AlertCircle, Loader2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interface pour les créneaux disponibles
interface CreneauDisponible {
    date: string;
    heure: string;
    medecinId: number;
    medecinNom: string;
    medecinSpecialite: string;
    duree: number;
}

export default function MesRendezVousPage() {
    const { user } = useAuth()
    const [rendezVous, setRendezVous] = useState<RendezVous[]>([])
    const [medecins, setMedecins] = useState<Medecin[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMedecins, setLoadingMedecins] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)
    const [creneauxDisponibles, setCreneauxDisponibles] = useState<CreneauDisponible[]>([])
    const [loadingCreneaux, setLoadingCreneaux] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVous | null>(null)

    // États pour le formulaire
    const [formData, setFormData] = useState({
        medecinId: "",
        dateHeure: "",
        duree: "30",
        motif: "",
        notes: ""
    })

    // 🔥 CORRECTION : Fonction pour formater la date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(date)
        } catch (e) {
            return "Date invalide"
        }
    }

    // Test de connexion API
    useEffect(() => {
        console.log("🔄 Initialisation MesRendezVousPage...");
        console.log("👤 User:", user);
        testApiConnection();
    }, []);

    const testApiConnection = async () => {
        console.log("🔍 Test de connexion API...");
        try {
            console.log("🩺 Test endpoint /medecins...");
            const medecinsData = await usersApi.getMedecins();
            console.log("✅ Médecins chargés:", medecinsData);

            if (user?.id) {
                console.log("📅 Test endpoint rendez-vous patient...");
                const rdvData = await rendezVousApi.getByPatient(user.id);
                console.log("✅ Rendez-vous chargés:", rdvData);
            }
        } catch (error: any) {
            console.error("❌ Erreur de connexion API:", error);
            setError("Impossible de se connecter au serveur. Vérifiez que le backend est démarré.");
        }
    }

    // Charger les créneaux disponibles pour un médecin
    const loadCreneauxDisponibles = async (medecinId: string) => {
        if (!medecinId) {
            setCreneauxDisponibles([]);
            return;
        }

        try {
            setLoadingCreneaux(true);
            setError(null);

            const creneaux = await fetchCreneauxDisponibles(parseInt(medecinId));
            setCreneauxDisponibles(creneaux);

            if (creneaux.length > 0) {
                const premierCreneau = creneaux[0];
                setFormData(prev => ({
                    ...prev,
                    dateHeure: `${premierCreneau.date}T${premierCreneau.heure}`,
                    duree: premierCreneau.duree.toString()
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    dateHeure: ""
                }));
            }
        } catch (err: any) {
            console.error("❌ Erreur chargement créneaux:", err);
            setError("Erreur lors du chargement des créneaux disponibles");
        } finally {
            setLoadingCreneaux(false);
        }
    }

    // Fonction pour récupérer les créneaux disponibles
    const fetchCreneauxDisponibles = async (medecinId: number): Promise<CreneauDisponible[]> => {
        try {
            const medecin = medecins.find(m => m.id === medecinId);
            if (!medecin) return [];
            return genererCreneauxFictifs(medecinId);
        } catch (error) {
            console.error("Erreur fetch créneaux:", error);
            return genererCreneauxFictifs(medecinId);
        }
    }

    // Génération de créneaux fictifs
    const genererCreneauxFictifs = (medecinId: number): CreneauDisponible[] => {
        const medecin = medecins.find(m => m.id === medecinId);
        if (!medecin) return [];

        const creneaux: CreneauDisponible[] = [];
        const aujourdhui = new Date();

        // Générer des créneaux pour les 3 prochains jours
        for (let i = 1; i <= 3; i++) {
            const date = new Date(aujourdhui);
            date.setDate(aujourdhui.getDate() + i);

            if (date.getDay() === 0 || date.getDay() === 6) continue;

            const dateStr = date.toISOString().split('T')[0];

            // Créneaux du matin (9h-12h)
            for (let heure = 9; heure <= 12; heure++) {
                creneaux.push({
                    date: dateStr,
                    heure: `${heure.toString().padStart(2, '0')}:00`,
                    medecinId,
                    medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
                    medecinSpecialite: medecin.specialite,
                    duree: 30
                });
            }

            // Créneaux de l'après-midi (14h-17h)
            for (let heure = 14; heure <= 17; heure++) {
                creneaux.push({
                    date: dateStr,
                    heure: `${heure.toString().padStart(2, '0')}:00`,
                    medecinId,
                    medecinNom: `Dr. ${medecin.prenom} ${medecin.nom}`,
                    medecinSpecialite: medecin.specialite,
                    duree: 30
                });
            }
        }

        return creneaux;
    }

    // Charger les médecins
    const loadMedecins = async () => {
        try {
            setLoadingMedecins(true)
            setError(null)
            console.log("🩺 Chargement des médecins...")

            const data = await usersApi.getMedecins()
            console.log("✅ Médecins chargés:", data)
            setMedecins(data)
        } catch (err: any) {
            console.error("❌ Erreur chargement médecins:", err)
            setError("Erreur lors du chargement de la liste des médecins: " + (err.message || "Serveur inaccessible"))
        } finally {
            setLoadingMedecins(false)
        }
    }

    // Charger les rendez-vous
    const loadRendezVous = async () => {
        if (!user?.id) {
            console.log("❌ Aucun user ID disponible")
            return
        }

        try {
            setLoading(true)
            setError(null)
            console.log(`📅 Chargement rendez-vous pour patient ID: ${user.id}`)

            const data = await rendezVousApi.getByPatient(user.id)
            console.log("✅ Rendez-vous chargés:", data)
            setRendezVous(data)
        } catch (err: any) {
            console.error("❌ Erreur chargement rendez-vous:", err)
            setError(err.message || "Erreur lors du chargement des rendez-vous")
        } finally {
            setLoading(false)
        }
    }

    // 🔥 CORRECTION : Gérer le changement de médecin
    const handleMedecinChange = (medecinId: string) => {
        setFormData({
            ...formData,
            medecinId,
            dateHeure: ""
        });
        const medecin = medecins.find(m => m.id === parseInt(medecinId));
        setSelectedMedecin(medecin || null);
        loadCreneauxDisponibles(medecinId);
    }

    // Créer un nouveau rendez-vous
    const handleCreateRendezVous = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.id) {
            setError("Utilisateur non connecté")
            return
        }

        // Validation
        if (!formData.medecinId || !formData.dateHeure || !formData.motif) {
            setError("Veuillez remplir tous les champs obligatoires")
            return
        }

        setIsCreating(true)
        setError(null)

        try {
            console.log("🔄 Création rendez-vous:", formData)

            const response = await rendezVousApi.create({
                patientId: user.id,
                medecinId: parseInt(formData.medecinId),
                dateHeure: formData.dateHeure,
                duree: parseInt(formData.duree),
                motif: formData.motif,
                notes: formData.notes || undefined
            })

            console.log("✅ Rendez-vous créé:", response)

            setIsCreateModalOpen(false)
            setFormData({
                medecinId: "",
                dateHeure: "",
                duree: "30",
                motif: "",
                notes: ""
            })
            setCreneauxDisponibles([])
            setSelectedMedecin(null)
            await loadRendezVous()
        } catch (err: any) {
            console.error("❌ Erreur création rendez-vous:", err)
            setError(err.message || "Erreur lors de la création du rendez-vous")
        } finally {
            setIsCreating(false)
        }
    }

    // Annuler un rendez-vous
    const handleAnnulerRendezVous = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
            return;
        }

        try {
            setError(null)
            await rendezVousApi.updateStatut(id, "ANNULE")
            await loadRendezVous()
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'annulation du rendez-vous")
        }
    }

    // Voir les détails d'un rendez-vous
    const handleVoirDetails = (rdv: RendezVous) => {
        setSelectedRendezVous(rdv);
        setIsDetailsModalOpen(true);
    }

    // Charger les données quand l'user est disponible
    useEffect(() => {
        if (user?.id) {
            console.log("👤 User disponible, chargement des données...")
            loadRendezVous()
            loadMedecins()
        }
    }, [user])

    // 🔥 CORRECTION : Reset form quand le modal s'ouvre
    const handleOpenCreateModal = () => {
        setError(null)
        loadMedecins()
        setFormData({
            medecinId: "",
            dateHeure: "",
            duree: "30",
            motif: "",
            notes: ""
        })
        setCreneauxDisponibles([])
        setSelectedMedecin(null)
        setIsCreateModalOpen(true)
    }

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case "CONFIRME":
                return (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmé
                    </Badge>
                )
            case "DEMANDE":
                return (
                    <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        En attente
                    </Badge>
                )
            case "ANNULE":
                return (
                    <Badge variant="destructive" className="hover:bg-red-600/90">
                        <XCircle className="w-3 h-3 mr-1" />
                        Annulé
                    </Badge>
                )
            case "TERMINE":
                return <Badge variant="outline" className="text-gray-500 border-gray-300">Terminé</Badge>
            default:
                return <Badge>{statut}</Badge>
        }
    }

    // Formater la date des créneaux
    const formatCreneauDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat("fr-FR", {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            }).format(date);
        } catch (e) {
            return "Date inv.";
        }
    }

    // Grouper les créneaux par date pour un meilleur affichage
    const creneauxParDate = creneauxDisponibles.reduce((acc, creneau) => {
        if (!acc[creneau.date]) {
            acc[creneau.date] = [];
        }
        acc[creneau.date].push(creneau);
        return acc;
    }, {} as Record<string, CreneauDisponible[]>);

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            }).format(date)
        } catch (e) {
            return "Heure invalide"
        }
    }

    const getMedecinInfo = (medecinId: number) => {
        return medecins.find((m) => m.id === medecinId)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                <span className="text-lg text-muted-foreground">Chargement des rendez-vous...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Mes Rendez-vous</h1>
                    <p className="text-muted-foreground">Consultez et gérez vos rendez-vous médicaux</p>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-colors"
                            onClick={handleOpenCreateModal}
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau rendez-vous
                        </Button>
                    </DialogTrigger>
                    {/* 🔥 CORRECTION CRITIQUE : Modal complètement scrollable */}

                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle>Nouveau rendez-vous</DialogTitle>
                            <DialogDescription>
                                Choisissez un médecin et sélectionnez un créneau disponible
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateRendezVous} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {/* 🔥 CORRECTION : Contenu scrollable avec défilement */}
                            <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2">
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Sélecteur de médecin */}
                                <div className="space-y-2">
                                    <Label htmlFor="medecin">Médecin *</Label>
                                    <Select
                                        value={formData.medecinId}
                                        onValueChange={handleMedecinChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un médecin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingMedecins ? (
                                                <SelectItem value="loading" disabled>
                                                    Chargement des médecins...
                                                </SelectItem>
                                            ) : (
                                                medecins.map((medecin) => (
                                                    <SelectItem key={medecin.id} value={medecin.id.toString()}>
                                                        Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Affichage des créneaux disponibles */}
                                <div className="space-y-2">
                                    <Label>Créneaux disponibles *</Label>
                                    {loadingCreneaux ? (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            <span>Chargement des créneaux disponibles...</span>
                                        </div>
                                    ) : creneauxDisponibles.length > 0 ? (
                                        <div className="border rounded-lg p-4 bg-gray-50">
                                            {/* Affichage par date */}
                                            <div className="space-y-6">
                                                {Object.entries(creneauxParDate).map(([date, creneauxDuJour]) => (
                                                    <div key={date} className="space-y-4">
                                                        <div className="font-semibold text-lg text-gray-800 bg-white p-3 rounded-lg shadow-sm border">
                                                            {formatDate(`${date}T00:00`)}
                                                        </div>

                                                        {/* Créneaux du matin */}
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-medium text-gray-600">Matin</div>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {creneauxDuJour
                                                                    .filter(creneau => {
                                                                        const heure = parseInt(creneau.heure.split(':')[0]);
                                                                        return heure >= 9 && heure <= 12;
                                                                    })
                                                                    .map((creneau, index) => (
                                                                        <Button
                                                                            key={`${creneau.date}-${creneau.heure}-${index}`}
                                                                            type="button"
                                                                            variant={formData.dateHeure === `${creneau.date}T${creneau.heure}` ? "default" : "outline"}
                                                                            className="h-auto py-3 flex flex-col items-center justify-center border-2"
                                                                            onClick={() => setFormData({
                                                                                ...formData,
                                                                                dateHeure: `${creneau.date}T${creneau.heure}`,
                                                                                duree: creneau.duree.toString()
                                                                            })}
                                                                        >
                                                                            <span className="text-base font-bold">{creneau.heure}</span>
                                                                            <span className="text-xs text-muted-foreground mt-1">
                              {creneau.duree} min
                            </span>
                                                                        </Button>
                                                                    ))}
                                                            </div>
                                                        </div>

                                                        {/* Créneaux de l'après-midi */}
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-medium text-gray-600">Après-midi</div>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {creneauxDuJour
                                                                    .filter(creneau => {
                                                                        const heure = parseInt(creneau.heure.split(':')[0]);
                                                                        return heure >= 14 && heure <= 17;
                                                                    })
                                                                    .map((creneau, index) => (
                                                                        <Button
                                                                            key={`${creneau.date}-${creneau.heure}-${index}`}
                                                                            type="button"
                                                                            variant={formData.dateHeure === `${creneau.date}T${creneau.heure}` ? "default" : "outline"}
                                                                            className="h-auto py-3 flex flex-col items-center justify-center border-2"
                                                                            onClick={() => setFormData({
                                                                                ...formData,
                                                                                dateHeure: `${creneau.date}T${creneau.heure}`,
                                                                                duree: creneau.duree.toString()
                                                                            })}
                                                                        >
                                                                            <span className="text-base font-bold">{creneau.heure}</span>
                                                                            <span className="text-xs text-muted-foreground mt-1">
                              {creneau.duree} min
                            </span>
                                                                        </Button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 text-sm text-muted-foreground text-center border-t pt-3">
                                                {creneauxDisponibles.length} créneau(x) disponible(s) sur {Object.keys(creneauxParDate).length} jour(s)
                                            </div>
                                        </div>
                                    ) : formData.medecinId ? (
                                        <div className="p-6 text-center border rounded-lg bg-yellow-50">
                                            <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-3" />
                                            <p className="text-yellow-800 font-medium text-lg">Aucun créneau disponible</p>
                                            <p className="text-sm text-yellow-600 mt-2">
                                                Ce médecin n'a pas encore configuré ses disponibilités.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center border rounded-lg bg-gray-50">
                                            <Calendar className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                                            <p className="text-gray-600 text-lg">Veuillez d'abord sélectionner un médecin</p>
                                        </div>
                                    )}
                                </div>

                                {selectedMedecin && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-semibold text-blue-900 mb-3 text-lg">Médecin sélectionné :</h4>
                                        <p className="text-blue-800">
                                            <strong className="text-lg">Dr. {selectedMedecin.prenom} {selectedMedecin.nom}</strong><br />
                                            <span className="text-base">Spécialité : {selectedMedecin.specialite}</span><br />
                                            <span className="text-base">Téléphone : {selectedMedecin.telephone}</span><br />
                                            <span className="text-base">Adresse : {selectedMedecin.adresseCabinet}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Formulaire motif et notes */}
                                <div className="space-y-4 bg-white p-4 rounded-lg border">
                                    <div className="space-y-2">
                                        <Label htmlFor="motif" className="text-base">Motif *</Label>
                                        <Input
                                            id="motif"
                                            value={formData.motif}
                                            onChange={(e) => setFormData({...formData, motif: e.target.value})}
                                            placeholder="Raison de la consultation"
                                            required
                                            className="h-12 text-base"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-base">Notes supplémentaires</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            placeholder="Informations complémentaires..."
                                            rows={3}
                                            className="text-base"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 CORRECTION : Boutons FIXES en bas */}
                            <div className="flex-shrink-0 border-t bg-background p-4 mt-4">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 h-12 text-base"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isCreating || !formData.medecinId || !formData.dateHeure || !formData.motif}
                                        className="flex-1 h-12 text-base bg-primary hover:bg-primary/90"
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Création...
                                            </>
                                        ) : (
                                            "Prendre rendez-vous"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {error && !isCreateModalOpen && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {rendezVous.filter((rdv) => rdv.statut === "DEMANDE").length}
                                </p>
                                <p className="text-sm text-muted-foreground">En attente</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {rendezVous.filter((rdv) => rdv.statut === "CONFIRME").length}
                                </p>
                                <p className="text-sm text-muted-foreground">Confirmés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{rendezVous.length}</p>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Mes Rendez-vous</h2>

                {rendezVous.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous</h3>
                                <p className="text-muted-foreground mb-6">Vous n'avez pas encore de rendez-vous programmé</p>
                                <Button
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={handleOpenCreateModal}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Prendre un rendez-vous
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    rendezVous.map((rdv) => {
                        const medecin = getMedecinInfo(rdv.medecinId)
                        return (
                            <Card key={rdv.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/60">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : `Médecin ID: ${rdv.medecinId}`}
                                                </CardTitle>
                                                <CardDescription>
                                                    {medecin ? medecin.specialite : "Consultation médicale"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {getStatusBadge(rdv.statut)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="capitalize font-medium">{formatDate(rdv.dateHeure)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {formatTime(rdv.dateHeure)} ({rdv.duree} min)
                                                </span>
                                            </div>
                                            {medecin && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">{medecin.adresseCabinet}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground font-semibold">Motif</Label>
                                                <p className="text-sm font-medium p-2 bg-accent rounded">{rdv.motif}</p>
                                            </div>
                                            {rdv.notes && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground font-semibold">Notes</Label>
                                                    <p className="text-sm text-muted-foreground p-2 border rounded">{rdv.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                                        {(rdv.statut === "CONFIRME" || rdv.statut === "DEMANDE") && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleAnnulerRendezVous(rdv.id)}
                                            >
                                                Annuler
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="ml-auto bg-transparent hover:bg-muted"
                                            onClick={() => handleVoirDetails(rdv)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Voir les détails
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Modal de détails */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Détails du rendez-vous</DialogTitle>
                    </DialogHeader>
                    {selectedRendezVous && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-semibold">Date</Label>
                                    <p>{formatDate(selectedRendezVous.dateHeure)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Heure</Label>
                                    <p>{formatTime(selectedRendezVous.dateHeure)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Durée</Label>
                                    <p>{selectedRendezVous.duree} minutes</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Statut</Label>
                                    <div className="mt-1">{getStatusBadge(selectedRendezVous.statut)}</div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-semibold">Motif</Label>
                                <p className="p-2 bg-accent rounded">{selectedRendezVous.motif}</p>
                            </div>
                            {selectedRendezVous.notes && (
                                <div>
                                    <Label className="text-sm font-semibold">Notes</Label>
                                    <p className="p-2 border rounded">{selectedRendezVous.notes}</p>
                                </div>
                            )}
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsDetailsModalOpen(false)}>Fermer</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
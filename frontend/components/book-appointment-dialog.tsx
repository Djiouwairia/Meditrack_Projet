"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Loader2, AlertCircle, MapPin, Phone } from "lucide-react"
import type { Medecin } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { rendezVousApi, disponibilitesApi, type Disponibilite } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface BookAppointmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    medecin: Medecin
    onBook?: (data: any) => void
}

interface CreneauDisponible {
    date: string
    heure: string
    medecinId: number
    duree: number
}

export function BookAppointmentDialog({ open, onOpenChange, medecin, onBook }: BookAppointmentDialogProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [loadingCreneaux, setLoadingCreneaux] = useState(false)
    const [creneauxDisponibles, setCreneauxDisponibles] = useState<CreneauDisponible[]>([])
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        dateHeure: "",
        duree: "30",
        motif: "",
        notes: ""
    })

    // Charger les créneaux disponibles depuis l'API quand le dialog s'ouvre
    useEffect(() => {
        if (open && medecin) {
            loadCreneauxDisponibles()
            // Réinitialiser le formulaire
            setFormData({
                dateHeure: "",
                duree: "30",
                motif: "",
                notes: ""
            })
            setError(null)
        }
    }, [open, medecin])

    const loadCreneauxDisponibles = async () => {
        try {
            setLoadingCreneaux(true)
            setError(null)

            // 🔥 CORRECTION : Convertir l'ID en number pour l'API
            const medecinId = Number(medecin.id)

            console.log("🔍 ID du médecin:", medecinId, "Type:", typeof medecinId)

            // 🔥 RÉCUPÉRATION DES VRAIES DISPONIBILITÉS DU MÉDECIN
            const disponibilites = await disponibilitesApi.getByMedecin(medecinId)
            console.log("📅 Disponibilités récupérées:", disponibilites)

            if (disponibilites.length === 0) {
                console.log("❌ Aucune disponibilité configurée pour ce médecin")
                setCreneauxDisponibles([])
                return
            }

            // Générer les créneaux UNIQUEMENT à partir des vraies disponibilités
            const creneaux = genererCreneauxFromDisponibilites(disponibilites)
            console.log("🕒 Créneaux générés:", creneaux.length)
            setCreneauxDisponibles(creneaux)

            if (creneaux.length > 0) {
                const premierCreneau = creneaux[0]
                setFormData(prev => ({
                    ...prev,
                    dateHeure: `${premierCreneau.date}T${premierCreneau.heure}`,
                    duree: premierCreneau.duree.toString()
                }))
            }
        } catch (err: any) {
            console.error("❌ Erreur chargement créneaux:", err)
            setError("Erreur lors du chargement des créneaux disponibles: " + err.message)
            // 🔥 SUPPRIMER LE FALLBACK FICTIF - On veut uniquement les vraies disponibilités
            setCreneauxDisponibles([])
        } finally {
            setLoadingCreneaux(false)
        }
    }

    // 🔥 FONCTION QUI GÉNÈRE LES CRÉNEAUX UNIQUEMENT À PARTIR DES VRAIES DISPONIBILITÉS
    const genererCreneauxFromDisponibilites = (disponibilites: Disponibilite[]): CreneauDisponible[] => {
        const creneaux: CreneauDisponible[] = []
        const aujourdhui = new Date()

        // Générer pour les 14 prochains jours
        for (let i = 1; i <= 14; i++) {
            const date = new Date(aujourdhui)
            date.setDate(aujourdhui.getDate() + i)

            const jourSemaine = date.getDay() === 0 ? 7 : date.getDay() // Convertir en 1-7 (Lundi=1)

            // 🔥 CORRECTION : Trouver les disponibilités POUR CE JOUR SPÉCIFIQUE
            const disposDuJour = disponibilites.filter(d => d.jourSemaine === jourSemaine)

            console.log(`📆 Jour ${jourSemaine}: ${disposDuJour.length} disponibilité(s)`)

            for (const dispo of disposDuJour) {
                const creneauxDuJour = genererCreneauxPourJour(date, dispo)
                creneaux.push(...creneauxDuJour)
            }
        }

        console.log("🎯 Total créneaux générés:", creneaux.length)
        return creneaux.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.heure}`)
            const dateB = new Date(`${b.date}T${b.heure}`)
            return dateA.getTime() - dateB.getTime()
        })
    }

    const genererCreneauxPourJour = (date: Date, dispo: Disponibilite): CreneauDisponible[] => {
        const creneaux: CreneauDisponible[] = []
        const dateStr = date.toISOString().split('T')[0]

        const [debutHeures, debutMinutes] = dispo.heureDebut.split(':').map(Number)
        const [finHeures, finMinutes] = dispo.heureFin.split(':').map(Number)

        let heureActuelle = new Date(date)
        heureActuelle.setHours(debutHeures, debutMinutes, 0, 0)

        const heureFin = new Date(date)
        heureFin.setHours(finHeures, finMinutes, 0, 0)

        // Vérifier que l'heure de fin est après l'heure de début
        if (heureActuelle >= heureFin) {
            console.warn("⏰ Heure de fin avant heure de début pour la disponibilité:", dispo)
            return creneaux
        }

        // 🔥 CORRECTION : Générer les créneaux UNIQUEMENT dans la plage horaire configurée
        while (heureActuelle < heureFin) {
            const heureStr = heureActuelle.toTimeString().slice(0, 5)

            creneaux.push({
                medecinId: medecin.id,
                date: dateStr,
                heure: heureStr,
                duree: dispo.dureeCreneaux
            })

            // Avancer de la durée du créneau configurée
            heureActuelle = new Date(heureActuelle.getTime() + dispo.dureeCreneaux * 60000)
        }

        console.log(`📆 ${dateStr} (${getJourNom(date.getDay())}): ${creneaux.length} créneaux de ${dispo.heureDebut} à ${dispo.heureFin} (${dispo.dureeCreneaux}min)`)
        return creneaux
    }

    // Fonction utilitaire pour obtenir le nom du jour
    const getJourNom = (jour: number): string => {
        const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
        return jours[jour]
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user?.id) {
            setError("Vous devez être connecté pour prendre un rendez-vous")
            return
        }

        if (!formData.dateHeure || !formData.motif) {
            setError("Veuillez sélectionner un créneau et indiquer le motif")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // 🔥 CORRECTION : Convertir les IDs en number pour l'API
            const rendezVousData = {
                patientId: Number(user.id),
                medecinId: Number(medecin.id),
                dateHeure: formData.dateHeure,
                duree: parseInt(formData.duree),
                motif: formData.motif,
                notes: formData.notes || undefined
            }

            console.log("🔄 Création rendez-vous:", rendezVousData)

            const response = await rendezVousApi.create(rendezVousData)
            console.log("✅ Rendez-vous créé:", response)

            toast({
                title: "Rendez-vous demandé",
                description: "Votre demande de rendez-vous a été envoyée avec succès",
            })

            onBook?.(response)
            onOpenChange(false)

        } catch (err: any) {
            console.error("❌ Erreur création rendez-vous:", err)
            setError(err.message || "Erreur lors de la création du rendez-vous")
            toast({
                title: "Erreur",
                description: "Impossible de créer le rendez-vous",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XOF",
            minimumFractionDigits: 0,
        }).format(price)
    }

    // Grouper les créneaux par date
    const creneauxParDate = creneauxDisponibles.reduce((acc, creneau) => {
        if (!acc[creneau.date]) {
            acc[creneau.date] = []
        }
        acc[creneau.date].push(creneau)
        return acc
    }, {} as Record<string, CreneauDisponible[]>)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Prendre rendez-vous avec le Dr. {medecin.prenom} {medecin.nom}</DialogTitle>
                    <DialogDescription>
                        Sélectionnez un créneau disponible et complétez les informations
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Informations du médecin */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary">
                  {medecin.prenom[0]}{medecin.nom[0]}
                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-blue-900">
                                    Dr. {medecin.prenom} {medecin.nom}
                                </h3>
                                <p className="text-blue-800 mb-2">{medecin.specialite}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{medecin.telephone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{medecin.adresseCabinet}</span>
                                    </div>
                                </div>
                                {medecin.tarifConsultation && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                        <span className="font-semibold text-blue-900">Tarif consultation: </span>
                                        <span className="text-lg font-bold text-primary">
                      {formatPrice(medecin.tarifConsultation)}
                    </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sélection du créneau */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Choisissez un créneau disponible *</Label>

                        {loadingCreneaux ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                <span>Chargement des créneaux disponibles...</span>
                            </div>
                        ) : creneauxDisponibles.length > 0 ? (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <div className="text-sm text-muted-foreground mb-4 text-center">
                                    {creneauxDisponibles.length} créneau(x) disponible(s) sur {Object.keys(creneauxParDate).length} jour(s)
                                </div>
                                <div className="space-y-6">
                                    {Object.entries(creneauxParDate).map(([date, creneauxDuJour]) => (
                                        <div key={date} className="space-y-4">
                                            <div className="font-semibold text-lg text-gray-800 bg-white p-3 rounded-lg shadow-sm border">
                                                {formatDate(`${date}T00:00`)}
                                            </div>

                                            {/* Afficher tous les créneaux sans distinction matin/après-midi */}
                                            <div className="grid grid-cols-4 gap-2">
                                                {creneauxDuJour.map((creneau, index) => (
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
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center border rounded-lg bg-yellow-50">
                                <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-3" />
                                <p className="text-yellow-800 font-medium text-lg">Aucun créneau disponible</p>
                                <p className="text-sm text-yellow-600 mt-2">
                                    Ce médecin n'a pas encore configuré ses disponibilités.
                                    <br />
                                    Veuillez contacter directement le cabinet pour prendre rendez-vous.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Informations de la consultation */}
                    <div className="space-y-4 bg-white p-4 rounded-lg border">
                        <div className="space-y-2">
                            <Label htmlFor="motif" className="text-base font-semibold">Motif de la consultation *</Label>
                            <Input
                                id="motif"
                                value={formData.motif}
                                onChange={(e) => setFormData({...formData, motif: e.target.value})}
                                placeholder="Ex: Consultation de routine, problème spécifique..."
                                required
                                className="h-12 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-base font-semibold">Notes supplémentaires</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Informations complémentaires pour le médecin..."
                                rows={3}
                                className="text-base"
                            />
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 text-base"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.dateHeure || !formData.motif}
                            className="flex-1 h-12 text-base bg-primary hover:bg-primary/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Création...
                                </>
                            ) : (
                                "Confirmer le rendez-vous"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
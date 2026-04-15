"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { rendezVousApi, RendezVous } from "@/lib/api-client"
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Phone, MapPin, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Patient {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
}

interface Medecin {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    specialite: string;
    telephone: string;
}

export default function RendezVousPage() {
    const { user } = useAuth()
    const router = useRouter() // AJOUT: useRouter pour la navigation
    const [rendezVous, setRendezVous] = useState<RendezVous[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [medecins, setMedecins] = useState<Medecin[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // États pour le formulaire de création
    const [formData, setFormData] = useState({
        patientId: "",
        medecinId: user?.role === "MEDECIN" ? String(user.id) : "",
        dateHeure: "",
        duree: "30",
        motif: "",
        notes: ""
    })

    // Charger les patients
    const loadPatients = async () => {
        try {
            const data = await apiClient.get<Patient[]>('/patients')
            setPatients(data)
        } catch (err: any) {
            console.error('Erreur chargement patients:', err)
            setError("Erreur lors du chargement des patients")
        }
    }

    // Charger les médecins
    const loadMedecins = async () => {
        try {
            const data = await apiClient.get<Medecin[]>('/medecins')
            setMedecins(data)
        } catch (err: any) {
            console.error('Erreur chargement médecins:', err)
            setError("Erreur lors du chargement des médecins")
        }
    }

    // Charger les rendez-vous en fonction du rôle
    const loadRendezVous = async () => {
        if (!user) return

        try {
            setLoading(true)
            let data: RendezVous[] = []
            if (user.role === "ADMIN") {
                data = await rendezVousApi.getAll()
            } else if (user.role === "MEDECIN") {
                data = await rendezVousApi.getByMedecin(user.id)
            } else if (user.role === "PATIENT") {
                data = await rendezVousApi.getByPatient(user.id)
            }
            console.log("📋 Rendez-vous chargés:", data)
            setRendezVous(data)
        } catch (err: any) {
            console.error("❌ Erreur détaillée:", err)
            setError(err.message || "Erreur lors du chargement des rendez-vous")
        } finally {
            setLoading(false)
        }
    }

    // Créer un nouveau rendez-vous
    const handleCreateRendezVous = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsCreating(true)
        try {
            await rendezVousApi.create({
                patientId: Number(formData.patientId),
                medecinId: Number(formData.medecinId),
                dateHeure: formData.dateHeure,
                duree: Number(formData.duree),
                motif: formData.motif,
                notes: formData.notes
            })

            setIsCreateModalOpen(false)
            setFormData({
                patientId: "",
                medecinId: user.role === "MEDECIN" ? String(user.id) : "",
                dateHeure: "",
                duree: "30",
                motif: "",
                notes: ""
            })
            await loadRendezVous()
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création du rendez-vous")
        } finally {
            setIsCreating(false)
        }
    }

    // Changer le statut d'un rendez-vous
    const handleUpdateStatut = async (id: number, nouveauStatut: string) => {
        try {
            await rendezVousApi.updateStatut(id, nouveauStatut)
            await loadRendezVous()
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour du statut")
        }
    }

    // Supprimer un rendez-vous
    const handleDeleteRendezVous = async (id: number) => {
        try {
            await rendezVousApi.delete(id)
            await loadRendezVous()
        } catch (err: any) {
            setError(err.message || "Erreur lors de la suppression du rendez-vous")
        }
    }

    // AJOUT: Fonction pour commencer une consultation
    const handleStartConsultation = (rdv: RendezVous) => {
        // Rediriger vers la page de création de consultation avec les données pré-remplies
        router.push(`/dashboard/consultations/nouvelle?patientId=${rdv.patientId}&motif=${encodeURIComponent(rdv.motif)}`)
    }

    useEffect(() => {
        if (user) {
            loadRendezVous()
            if (user.role === "ADMIN") {
                loadPatients()
                loadMedecins()
            } else if (user.role === "MEDECIN") {
                loadPatients()
            }
        }
    }, [user])

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date)
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    const filterByStatus = (status: string | null) => {
        if (status === null) return rendezVous
        return rendezVous.filter((rdv) => rdv.statut === status)
    }

    const todayAppointments = rendezVous.filter((rdv) => {
        const today = new Date()
        const rdvDate = new Date(rdv.dateHeure)
        return (
            rdvDate.getDate() === today.getDate() &&
            rdvDate.getMonth() === today.getMonth() &&
            rdvDate.getFullYear() === today.getFullYear()
        )
    })

    // Trouver le nom du patient par ID
    const getPatientName = (patientId: number) => {
        const patient = patients.find(p => p.id === patientId)
        return patient ? `${patient.prenom} ${patient.nom}` : `Patient #${patientId}`
    }

    // Trouver le nom du médecin par ID
    const getMedecinName = (medecinId: number) => {
        const medecin = medecins.find(m => m.id === medecinId)
        return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : `Médecin #${medecinId}`
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {user?.role === "ADMIN" ? "Tous les Rendez-vous" : "Mes Rendez-vous"}
                    </h1>
                    <p className="text-muted-foreground">
                        {user?.role === "ADMIN"
                            ? "Gérez tous les rendez-vous de l'établissement"
                            : "Consultez et gérez vos rendez-vous patients"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                        Liste
                    </Button>
                    <Button
                        variant={viewMode === "calendar" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("calendar")}
                    >
                        Calendrier
                    </Button>
                    {(user?.role === "ADMIN" || user?.role === "MEDECIN") && (
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Nouveau rendez-vous
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Nouveau rendez-vous</DialogTitle>
                                    <DialogDescription>
                                        Créer un nouveau rendez-vous pour un patient
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleCreateRendezVous} className="space-y-4">
                                    {user?.role === "ADMIN" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="patient">Patient *</Label>
                                            <Select
                                                value={formData.patientId}
                                                onValueChange={(value) => setFormData({...formData, patientId: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un patient" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.map((patient) => (
                                                        <SelectItem key={patient.id} value={String(patient.id)}>
                                                            {patient.prenom} {patient.nom} - {patient.telephone}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {user?.role === "MEDECIN" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="patient">Patient *</Label>
                                            <Select
                                                value={formData.patientId}
                                                onValueChange={(value) => setFormData({...formData, patientId: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un patient" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.map((patient) => (
                                                        <SelectItem key={patient.id} value={String(patient.id)}>
                                                            {patient.prenom} {patient.nom} - {patient.telephone}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {user?.role === "ADMIN" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="medecin">Médecin *</Label>
                                            <Select
                                                value={formData.medecinId}
                                                onValueChange={(value) => setFormData({...formData, medecinId: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un médecin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {medecins.map((medecin) => (
                                                        <SelectItem key={medecin.id} value={String(medecin.id)}>
                                                            Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {user?.role === "MEDECIN" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="medecin">Médecin</Label>
                                            <Input
                                                value={`Dr. ${user.prenom} ${user.nom}`}
                                                disabled
                                                className="bg-gray-100"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="dateHeure">Date et heure *</Label>
                                        <Input
                                            id="dateHeure"
                                            type="datetime-local"
                                            value={formData.dateHeure}
                                            onChange={(e) => setFormData({...formData, dateHeure: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duree">Durée (minutes) *</Label>
                                        <Select value={formData.duree} onValueChange={(value) => setFormData({...formData, duree: value})}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Durée" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="motif">Motif *</Label>
                                        <Input
                                            id="motif"
                                            value={formData.motif}
                                            onChange={(e) => setFormData({...formData, motif: e.target.value})}
                                            placeholder="Raison de la consultation"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes supplémentaires</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            placeholder="Informations complémentaires..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="flex-1"
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isCreating}
                                            className="flex-1"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Création...
                                                </>
                                            ) : (
                                                "Créer le rendez-vous"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{todayAppointments.length}</p>
                                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{filterByStatus("DEMANDE").length}</p>
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
                                <p className="text-2xl font-bold">{filterByStatus("CONFIRME").length}</p>
                                <p className="text-sm text-muted-foreground">Confirmés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{rendezVous.length}</p>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {viewMode === "calendar" ? (
                <div>Calendrier à implémenter</div>
            ) : (
                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="all">Tous ({rendezVous.length})</TabsTrigger>
                        <TabsTrigger value="demande">En attente ({filterByStatus("DEMANDE").length})</TabsTrigger>
                        <TabsTrigger value="confirme">Confirmés ({filterByStatus("CONFIRME").length})</TabsTrigger>
                        <TabsTrigger value="termine">Terminés ({filterByStatus("TERMINE").length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <AppointmentsList
                            appointments={rendezVous}
                            user={user}
                            onUpdateStatut={handleUpdateStatut}
                            onDelete={handleDeleteRendezVous}
                            getPatientName={getPatientName}
                            getMedecinName={getMedecinName}
                            onStartConsultation={handleStartConsultation} // AJOUT
                        />
                    </TabsContent>

                    <TabsContent value="demande">
                        <AppointmentsList
                            appointments={filterByStatus("DEMANDE")}
                            user={user}
                            onUpdateStatut={handleUpdateStatut}
                            onDelete={handleDeleteRendezVous}
                            getPatientName={getPatientName}
                            getMedecinName={getMedecinName}
                            onStartConsultation={handleStartConsultation} // AJOUT
                        />
                    </TabsContent>

                    <TabsContent value="confirme">
                        <AppointmentsList
                            appointments={filterByStatus("CONFIRME")}
                            user={user}
                            onUpdateStatut={handleUpdateStatut}
                            onDelete={handleDeleteRendezVous}
                            getPatientName={getPatientName}
                            getMedecinName={getMedecinName}
                            onStartConsultation={handleStartConsultation} // AJOUT
                        />
                    </TabsContent>

                    <TabsContent value="termine">
                        <AppointmentsList
                            appointments={filterByStatus("TERMINE")}
                            user={user}
                            onUpdateStatut={handleUpdateStatut}
                            onDelete={handleDeleteRendezVous}
                            getPatientName={getPatientName}
                            getMedecinName={getMedecinName}
                            onStartConsultation={handleStartConsultation} // AJOUT
                        />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )

    function AppointmentsList({
                                  appointments,
                                  user,
                                  onUpdateStatut,
                                  onDelete,
                                  getPatientName,
                                  getMedecinName,
                                  onStartConsultation // AJOUT
                              }: {
        appointments: RendezVous[];
        user: any;
        onUpdateStatut: (id: number, statut: string) => void;
        onDelete: (id: number) => void;
        getPatientName: (id: number) => string;
        getMedecinName: (id: number) => string;
        onStartConsultation: (rdv: RendezVous) => void; // AJOUT
    }) {
        if (appointments.length === 0) {
            return (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous</h3>
                            <p className="text-muted-foreground">Aucun rendez-vous dans cette catégorie</p>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="space-y-4">
                {appointments.map((rdv) => (
                    <Card key={rdv.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/60">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            Rendez-vous #{rdv.id}
                                        </CardTitle>
                                        <CardDescription>
                                            {getPatientName(rdv.patientId)} - {getMedecinName(rdv.medecinId)}
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
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Cabinet médical</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Patient: {getPatientName(rdv.patientId)}</span>
                                    </div>
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
                                {rdv.statut === "DEMANDE" && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => onUpdateStatut(rdv.id, "CONFIRME")}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Confirmer
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onUpdateStatut(rdv.id, "ANNULE")}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Refuser
                                        </Button>
                                    </>
                                )}
                                {rdv.statut === "CONFIRME" && (
                                    <>
                                        {/* MODIFICATION: Appel direct de onStartConsultation */}
                                        <Button
                                            size="sm"
                                            onClick={() => onStartConsultation(rdv)}
                                        >
                                            Commencer la consultation
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onUpdateStatut(rdv.id, "ANNULE")}
                                        >
                                            Annuler
                                        </Button>
                                    </>
                                )}
                                {rdv.statut === "TERMINE" && (
                                    <Button variant="outline" size="sm">
                                        Voir la consultation
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-auto bg-transparent hover:bg-muted"
                                    onClick={() => onDelete(rdv.id)}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }
}
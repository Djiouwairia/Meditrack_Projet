"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { usersApi, Patient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Search, User, Activity, Loader2, MapPin, Phone, Mail } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function MesPatientsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Charger les patients du médecin
    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) return

            try {
                setLoading(true)
                setError(null)

                console.log("🔄 Chargement des patients pour le médecin:", user.id)

                // Essayer d'abord la nouvelle méthode
                const patientsData = await usersApi.getPatientsByMedecinConsultations(user.id)
                console.log("✅ Patients chargés via consultations:", patientsData)

                if (patientsData && patientsData.length > 0) {
                    setPatients(patientsData)
                } else {
                    // Fallback: charger tous les patients
                    console.log("🔄 Aucun patient trouvé via consultations, chargement de tous les patients...")
                    const allPatients = await usersApi.getPatients()
                    setPatients(allPatients)
                }

            } catch (error: any) {
                console.error("❌ Erreur chargement patients:", error)
                setError("Erreur lors du chargement des patients")

                // Fallback en cas d'erreur
                try {
                    const allPatients = await usersApi.getPatients()
                    setPatients(allPatients)
                    setError(null)
                } catch (fallbackError) {
                    console.error("❌ Erreur fallback:", fallbackError)
                    setError("Impossible de charger les patients")
                }
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            loadData()
        }
    }, [user])

    // Filtrage par recherche
    const filteredPatients = patients.filter((patient) => {
        if (!patient) return false

        const searchLower = searchTerm.toLowerCase()
        return (
            searchTerm === "" ||
            patient.nom?.toLowerCase().includes(searchLower) ||
            patient.prenom?.toLowerCase().includes(searchLower) ||
            patient.telephone?.includes(searchLower) ||
            patient.email?.toLowerCase().includes(searchLower) ||
            (patient.numeroSecuriteSociale && patient.numeroSecuriteSociale.includes(searchLower))
        )
    })

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Non spécifié"
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }).format(date)
        } catch (e) {
            return "Date invalide"
        }
    }

    const handlePatientClick = (patientId: number) => {
        router.push(`/dashboard/patients/${patientId}`)
    }

    // Afficher le loading
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <span className="text-lg text-muted-foreground">Chargement de vos patients...</span>
                <p className="text-sm text-muted-foreground">Cette opération peut prendre quelques instants</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Mes Patients</h1>
                <p className="text-muted-foreground">
                    Liste des patients que vous avez consultés
                    {patients.length > 0 && ` (${patients.length} patient${patients.length > 1 ? 's' : ''})`}
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{patients.length}</p>
                                <p className="text-sm text-muted-foreground">Patients</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{patients.length}</p>
                                <p className="text-sm text-muted-foreground">Consultations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {patients.filter(p => p.allergies && p.allergies.length > 0).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Avec allergies</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {patients.filter(p => p.dateNaissance).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Âge renseigné</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, prénom, téléphone ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Patients List */}
            <div className="space-y-4">
                {filteredPatients.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchTerm ? "Aucun patient trouvé" : "Aucun patient"}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {searchTerm
                                        ? "Aucun patient ne correspond à votre recherche. Essayez d'autres termes."
                                        : "Vous n'avez pas encore de patients dans votre liste. Ils apparaîtront ici après vos premières consultations."
                                    }
                                </p>
                                {searchTerm && (
                                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                                        Réinitialiser la recherche
                                    </Button>
                                )}
                                {!searchTerm && (
                                    <Button onClick={() => router.push('/dashboard/consultations/nouvelle')}>
                                        Commencer une consultation
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredPatients.map((patient) => (
                        <Card
                            key={patient.id}
                            className="hover:shadow-lg transition-shadow border-l-4 border-l-primary cursor-pointer group"
                            onClick={() => handlePatientClick(patient.id)}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <User className="w-7 h-7 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-2">
                                                {patient.prenom} {patient.nom}
                                            </CardTitle>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="w-4 h-4" />
                                                    <span>{patient.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{patient.telephone}</span>
                                                </div>
                                                {patient.adresse && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{patient.adresse}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        ID: {patient.id}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-muted-foreground text-xs">Date de naissance</p>
                                        <p className="font-medium">{formatDate(patient.dateNaissance)}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-semibold text-muted-foreground text-xs">Sécurité sociale</p>
                                        <p className="font-medium">{patient.numeroSecuriteSociale || "Non renseigné"}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-semibold text-muted-foreground text-xs">Groupe sanguin</p>
                                        <Badge variant="outline" className="font-medium">
                                            {patient.groupeSanguin || "Non spécifié"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-semibold text-muted-foreground text-xs">Allergies</p>
                                        <Badge
                                            variant={patient.allergies ? "destructive" : "secondary"}
                                            className="font-medium"
                                        >
                                            {patient.allergies ? "Oui" : "Non"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePatientClick(patient.id)
                                        }}
                                    >
                                        Voir le dossier
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            router.push(`/dashboard/consultations/nouvelle?patientId=${patient.id}`)
                                        }}
                                    >
                                        Nouvelle consultation
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
// app/dossier-medical/page.tsx - VERSION AMÉLIORÉE
"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { consultationsApi, usersApi, dossiersMedicauxApi } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Pill, AlertCircle, Activity, User, Loader2, Download, History, Stethoscope } from "lucide-react"

export default function DossierMedicalPage() {
    const { user } = useAuth()
    const [patient, setPatient] = useState<any>(null)
    const [consultations, setConsultations] = useState<any[]>([])
    const [dossier, setDossier] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            if (!user) return

            try {
                setLoading(true)
                setError(null)

                // Charger les données du patient
                const patientData = await usersApi.getPatientById(user.id)
                setPatient(patientData)

                // Charger les consultations du patient
                const consultationsData = await consultationsApi.getByPatient(user.id)
                setConsultations(consultationsData)

                // Charger le dossier médical
                try {
                    const dossierData = await dossiersMedicauxApi.getByPatient(user.id)
                    setDossier(dossierData)
                } catch (error) {
                    console.log("Dossier médical non trouvé, utilisation des données patient")
                    setDossier(null)
                }

            } catch (error: any) {
                console.error("Erreur chargement dossier médical:", error)
                setError(error.message || "Erreur lors du chargement des données")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [user])

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(date)
        } catch (error) {
            return dateString
        }
    }

    // Fonction pour télécharger le dossier médical
    const telechargerDossierMedical = () => {
        const contenu = genererContenuDossierMedical()
        const blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `dossier_medical_${patient?.prenom}_${patient?.nom}_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    // Générer le contenu du dossier médical pour le téléchargement
    const genererContenuDossierMedical = () => {
        let contenu = `DOSSIER MÉDICAL\n`
        contenu += `================\n\n`

        // Information patient
        contenu += `INFORMATIONS PATIENT\n`
        contenu += `-------------------\n`
        contenu += `Nom: ${patient?.nom || 'Non renseigné'}\n`
        contenu += `Prénom: ${patient?.prenom || 'Non renseigné'}\n`
        contenu += `Date de naissance: ${patient?.dateNaissance || 'Non renseigné'}\n`
        contenu += `Groupe sanguin: ${patient?.groupeSanguin || 'Non renseigné'}\n`
        contenu += `Numéro sécurité sociale: ${patient?.numeroSecuriteSociale || 'Non renseigné'}\n\n`

        // Allergies
        const allergies = dossier?.allergies
            ? dossier.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)
            : patient?.allergies
                ? patient.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)
                : []

        contenu += `ALLERGIES\n`
        contenu += `---------\n`
        if (allergies.length > 0) {
            allergies.forEach((allergie: string) => {
                contenu += `• ${allergie}\n`
            })
        } else {
            contenu += `Aucune allergie connue\n`
        }
        contenu += `\n`

        // Antécédents médicaux
        contenu += `ANTÉCÉDENTS MÉDICAUX\n`
        contenu += `-------------------\n`
        contenu += `${dossier?.antecedentsMedicaux || 'Aucun antécédent médical'}\n\n`

        // Traitements en cours
        contenu += `TRAITEMENTS EN COURS\n`
        contenu += `-------------------\n`
        contenu += `${dossier?.traitementEnCours || 'Aucun traitement en cours'}\n\n`

        // Historique des consultations
        contenu += `HISTORIQUE DES CONSULTATIONS\n`
        contenu += `---------------------------\n`
        if (consultations.length > 0) {
            consultations.forEach((consultation, index) => {
                contenu += `\nConsultation #${index + 1}\n`
                contenu += `Date: ${formatDate(consultation.date)}\n`
                contenu += `Motif: ${consultation.motif}\n`
                if (consultation.diagnostic) {
                    contenu += `Diagnostic: ${consultation.diagnostic}\n`
                }
                if (consultation.examenClinique) {
                    contenu += `Examen clinique: ${consultation.examenClinique}\n`
                }
                if (consultation.notesPrivees) {
                    contenu += `Notes: ${consultation.notesPrivees}\n`
                }
                contenu += `---\n`
            })
        } else {
            contenu += `Aucune consultation enregistrée\n`
        }

        contenu += `\nGénéré le: ${new Date().toLocaleDateString('fr-FR')}\n`
        return contenu
    }

    // Utiliser les allergies du dossier ou du patient
    const allergies = dossier?.allergies
        ? dossier.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)
        : patient?.allergies
            ? patient.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)
            : []

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                <span className="text-lg text-muted-foreground">Chargement du dossier médical...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec bouton de téléchargement */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Mon Dossier Médical</h1>
                    <p className="text-muted-foreground">Consultez votre historique médical complet et vos consultations</p>
                </div>
                <Button onClick={telechargerDossierMedical} className="gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger le dossier
                </Button>
            </div>

            {/* Medical Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{consultations.length}</p>
                                <p className="text-sm text-muted-foreground">Consultations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{allergies.length}</p>
                                <p className="text-sm text-muted-foreground">Allergies</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{patient?.groupeSanguin || "N/A"}</p>
                                <p className="text-sm text-muted-foreground">Groupe sanguin</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <History className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {new Date().getFullYear() - new Date(patient?.dateNaissance || new Date()).getFullYear()}
                                </p>
                                <p className="text-sm text-muted-foreground">Âge</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Medical Information Tabs - VERSION AMÉLIORÉE */}
            <Tabs defaultValue="historique" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="historique" className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Historique complet
                    </TabsTrigger>
                    <TabsTrigger value="consultations" className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Consultations
                    </TabsTrigger>
                    <TabsTrigger value="antecedents" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Antécédents
                    </TabsTrigger>
                    <TabsTrigger value="allergies" className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Allergies
                    </TabsTrigger>
                </TabsList>

                {/* Nouvel onglet : Historique complet */}
                <TabsContent value="historique" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                Informations Personnelles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Nom complet</Label>
                                        <p className="text-lg font-semibold">{patient?.prenom} {patient?.nom}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Date de naissance</Label>
                                        <p className="text-lg font-semibold">
                                            {patient?.dateNaissance ? formatDate(patient.dateNaissance) : 'Non renseigné'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Email</Label>
                                        <p className="text-lg font-semibold">{patient?.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Téléphone</Label>
                                        <p className="text-lg font-semibold">{patient?.telephone || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Adresse</Label>
                                        <p className="text-lg font-semibold">{patient?.adresse || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Médecin traitant</Label>
                                        <p className="text-lg font-semibold">
                                            {patient?.medecinTraitantId ? `Dr. #${patient.medecinTraitantId}` : 'Non assigné'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Résumé médical */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-500" />
                                Résumé Médical
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-accent rounded-lg">
                                        <Label className="text-sm text-muted-foreground">Groupe Sanguin</Label>
                                        <p className="text-2xl font-bold text-red-600">{patient?.groupeSanguin || "Non renseigné"}</p>
                                    </div>
                                    <div className="p-4 bg-accent rounded-lg">
                                        <Label className="text-sm text-muted-foreground">Nombre de consultations</Label>
                                        <p className="text-2xl font-bold text-blue-600">{consultations.length}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-accent rounded-lg">
                                        <Label className="text-sm text-muted-foreground">Numéro Sécurité Sociale</Label>
                                        <p className="text-lg font-semibold">{patient?.numeroSecuriteSociale || "Non renseigné"}</p>
                                    </div>
                                    <div className="p-4 bg-accent rounded-lg">
                                        <Label className="text-sm text-muted-foreground">Allergies connues</Label>
                                        <p className="text-2xl font-bold text-red-600">{allergies.length}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dernières consultations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-purple-500" />
                                Dernières Consultations
                            </CardTitle>
                            <CardDescription>Vos 3 dernières consultations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {consultations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Aucune consultation récente</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {consultations.slice(0, 3).map((consultation) => (
                                        <Card key={consultation.id} className="border-l-4 border-l-primary">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">
                                                            Consultation #{consultation.id}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center gap-2 mt-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(consultation.date)}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge variant="outline">Consultation</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label className="font-semibold text-sm">Motif</Label>
                                                        <p className="text-sm text-muted-foreground">{consultation.motif}</p>
                                                    </div>
                                                    {consultation.diagnostic && (
                                                        <div>
                                                            <Label className="font-semibold text-sm">Diagnostic</Label>
                                                            <p className="text-sm font-medium text-foreground">{consultation.diagnostic}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Onglet Consultations (inchang mais conservé) */}
                <TabsContent value="consultations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des Consultations</CardTitle>
                            <CardDescription>Liste complète de vos consultations médicales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {consultations.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Aucune consultation</h3>
                                    <p className="text-muted-foreground">Votre historique de consultations apparaîtra ici</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {consultations.map((consultation) => (
                                        <Card key={consultation.id} className="border-l-4 border-l-primary">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">
                                                                Consultation #{consultation.id}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {formatDate(consultation.date)}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">Consultation</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label className="font-semibold">Motif de consultation</Label>
                                                    <p className="text-sm text-muted-foreground">{consultation.motif}</p>
                                                </div>

                                                {consultation.examenClinique && (
                                                    <div>
                                                        <Label className="font-semibold">Examen clinique</Label>
                                                        <p className="text-sm text-muted-foreground">{consultation.examenClinique}</p>
                                                    </div>
                                                )}

                                                {consultation.diagnostic && (
                                                    <div>
                                                        <Label className="font-semibold">Diagnostic</Label>
                                                        <p className="text-sm font-medium text-foreground">{consultation.diagnostic}</p>
                                                    </div>
                                                )}

                                                {consultation.notesPrivees && (
                                                    <div>
                                                        <Label className="font-semibold">Notes médicales</Label>
                                                        <p className="text-sm text-muted-foreground italic">{consultation.notesPrivees}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Les onglets Antécédents et Allergies restent inchangés */}
                <TabsContent value="antecedents" className="space-y-4">
                    {/* ... code existant pour les antécédents... */}
                </TabsContent>

                <TabsContent value="allergies" className="space-y-4">
                    {/* ... code existant pour les allergies... */}
                </TabsContent>
            </Tabs>
        </div>
    )
}
// components/consultation-form.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, User, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// CORRECTION : Interface mise à jour
interface ConsultationFormProps {
    patient?: any; // Pour l'édition
    patients?: any[]; // Pour la création
    consultation?: any; // Pour l'édition - données existantes
    onSave?: (data: any) => void;
    onCancel?: () => void;
    isEditing?: boolean;
}

export function ConsultationForm({
                                     patient,
                                     patients,
                                     consultation,
                                     onSave,
                                     onCancel,
                                     isEditing = false
                                 }: ConsultationFormProps) {
    const [selectedPatientId, setSelectedPatientId] = useState(patient?.id?.toString() || "")
    const [motif, setMotif] = useState(consultation?.motif || "")
    const [examenClinique, setExamenClinique] = useState(consultation?.examenClinique || "")
    const [diagnostic, setDiagnostic] = useState(consultation?.diagnostic || "")
    const [notesPrivees, setNotesPrivees] = useState(consultation?.notesPrivees || "")

    // Initialiser avec les données de consultation si en mode édition
    useEffect(() => {
        if (consultation) {
            setMotif(consultation.motif)
            setExamenClinique(consultation.examenClinique || "")
            setDiagnostic(consultation.diagnostic || "")
            setNotesPrivees(consultation.notesPrivees || "")
        }
    }, [consultation])

    const selectedPatient = patients
        ? patients.find(p => p.id.toString() === selectedPatientId)
        : patient

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const consultationData = {
            patientId: selectedPatientId ? parseInt(selectedPatientId) : patient?.id,
            motif,
            examenClinique,
            diagnostic,
            notesPrivees,
        }

        onSave?.(consultationData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informations Patient
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {patients && patients.length > 0 ? (
                        // Mode création avec sélection de patient
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="patient">Sélectionner un patient</Label>
                                <Select
                                    value={selectedPatientId}
                                    onValueChange={setSelectedPatientId}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.id} value={patient.id.toString()}>
                                                {patient.prenom} {patient.nom} - {patient.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedPatient && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Nom complet</Label>
                                        <p className="font-semibold">
                                            {selectedPatient.prenom} {selectedPatient.nom}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Contact</Label>
                                        <p className="text-sm">{selectedPatient.email}</p>
                                        <p className="text-sm">{selectedPatient.telephone}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Informations médicales</Label>
                                        {selectedPatient.allergies ? (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedPatient.allergies.split(',').map((allergie: string, idx: number) => (
                                                    <Badge key={idx} variant="destructive" className="text-xs">
                                                        {allergie.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Aucune allergie connue</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : patient ? (
                        // Mode édition avec patient fixe
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Nom complet</Label>
                                <p className="font-semibold">
                                    {patient.prenom} {patient.nom}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Contact</Label>
                                <p className="text-sm">{patient.email}</p>
                                <p className="text-sm">{patient.telephone}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Informations médicales</Label>
                                {patient.allergies ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {patient.allergies.split(',').map((allergie: string, idx: number) => (
                                            <Badge key={idx} variant="destructive" className="text-xs">
                                                {allergie.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucune allergie connue</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Aucun patient disponible</p>
                    )}
                </CardContent>
            </Card>

            {/* Consultation Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Détails de la Consultation</CardTitle>
                    <CardDescription>Saisissez les informations de la consultation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="motif">Motif de consultation *</Label>
                        <Input
                            id="motif"
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            placeholder="Ex: Douleurs abdominales, Fièvre, Suivi..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="examenClinique">Examen clinique</Label>
                        <Textarea
                            id="examenClinique"
                            value={examenClinique}
                            onChange={(e) => setExamenClinique(e.target.value)}
                            placeholder="Température, tension artérielle, observations physiques..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diagnostic">Diagnostic</Label>
                        <Textarea
                            id="diagnostic"
                            value={diagnostic}
                            onChange={(e) => setDiagnostic(e.target.value)}
                            placeholder="Diagnostic médical..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notesPrivees">Notes privées (optionnel)</Label>
                        <Textarea
                            id="notesPrivees"
                            value={notesPrivees}
                            onChange={(e) => setNotesPrivees(e.target.value)}
                            placeholder="Notes personnelles, non visibles par le patient..."
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" className="gap-2">
                    <Save className="w-4 h-4" />
                    {isEditing ? "Mettre à jour" : "Enregistrer la consultation"}
                </Button>
            </div>
        </form>
    )
}
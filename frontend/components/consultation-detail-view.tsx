"use client"

import type React from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Calendar, User, FileText, Edit, Download} from "lucide-react"
import {jsPDF} from "jspdf"

interface ConsultationDetailViewProps {
    consultation: any,
    patient: any,
    medecin: any,
    onEdit?: () => void,
    onPrint?: () => void
}

export function ConsultationDetailView({
                                           consultation,
                                           patient,
                                           medecin,
                                           onEdit,

                                       }: ConsultationDetailViewProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date)
    }

    // Fonction pour télécharger directement le PDF
    const handleDownload = () => {
        // Créer un nouveau PDF
        const pdf = new jsPDF('p', 'mm', 'a4')

        // Couleurs
        const primaryColor = [41, 128, 185] // Bleu
        const secondaryColor = [52, 152, 219] // Bleu clair
        const lightGray = [241, 242, 246] // Gris clair

        let yPosition = 20

        // En-tête
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        pdf.rect(0, 0, 210, 40, 'F')

        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Consultation Médicale', 105, 15, {align: 'center'})

        pdf.setFontSize(14)
        pdf.text(`N° ${consultation.id}`, 105, 25, {align: 'center'})

        pdf.setFontSize(10)
        pdf.text(`Date: ${formatDate(consultation.date)}`, 105, 32, {align: 'center'})

        yPosition = 50

        // Informations Patient
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('INFORMATIONS PATIENT', 20, yPosition)

        yPosition += 10
        pdf.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        pdf.line(20, yPosition, 190, yPosition)

        yPosition += 10
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')

        pdf.text(`Nom complet: ${patient.prenom} ${patient.nom}`, 25, yPosition)
        yPosition += 7
        pdf.text(`Email: ${patient.email}`, 25, yPosition)
        yPosition += 7
        pdf.text(`Téléphone: ${patient.telephone}`, 25, yPosition)
        yPosition += 7

        if (patient.dateNaissance) {
            pdf.text(`Date de naissance: ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}`, 25, yPosition)
            yPosition += 7
        }

        // Informations Médecin
        yPosition += 10
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('INFORMATIONS MÉDECIN', 20, yPosition)

        yPosition += 10
        pdf.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        pdf.line(20, yPosition, 190, yPosition)

        yPosition += 10
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')

        pdf.text(`Nom complet: Dr. ${medecin.prenom} ${medecin.nom}`, 25, yPosition)
        yPosition += 7
        pdf.text(`Spécialité: ${medecin.specialite}`, 25, yPosition)
        yPosition += 7
        pdf.text(`Cabinet: ${medecin.adresseCabinet}`, 25, yPosition)
        yPosition += 7
        pdf.text(`Contact: ${medecin.email} - ${medecin.telephone}`, 25, yPosition)

        // Détails de la consultation
        yPosition += 15
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('DÉTAILS DE LA CONSULTATION', 20, yPosition)

        yPosition += 10
        pdf.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        pdf.line(20, yPosition, 190, yPosition)

        yPosition += 10
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')

        // Motif
        pdf.setFont('helvetica', 'bold')
        pdf.text('Motif de consultation:', 25, yPosition)
        pdf.setFont('helvetica', 'normal')
        const motifLines = pdf.splitTextToSize(consultation.motif, 160)
        pdf.text(motifLines, 25, yPosition + 7)
        yPosition += 7 + (motifLines.length * 5)

        // Examen clinique
        if (consultation.examenClinique) {
            yPosition += 10
            pdf.setFont('helvetica', 'bold')
            pdf.text('Examen clinique:', 25, yPosition)
            pdf.setFont('helvetica', 'normal')
            const examenLines = pdf.splitTextToSize(consultation.examenClinique, 160)
            pdf.text(examenLines, 25, yPosition + 7)
            yPosition += 7 + (examenLines.length * 5)
        }

        // Diagnostic
        if (consultation.diagnostic) {
            yPosition += 10
            pdf.setFont('helvetica', 'bold')
            pdf.text('Diagnostic:', 25, yPosition)
            pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2])
            pdf.rect(25, yPosition + 3, 160, 15, 'F')
            pdf.setFont('helvetica', 'normal')
            const diagnosticLines = pdf.splitTextToSize(consultation.diagnostic, 155)
            pdf.text(diagnosticLines, 28, yPosition + 12)
            yPosition += 20 + (diagnosticLines.length * 5)
        }

        // Notes privées
        if (consultation.notesPrivees) {
            yPosition += 10
            pdf.setFont('helvetica', 'bold')
            pdf.text('Notes médicales:', 25, yPosition)
            pdf.setFont('helvetica', 'italic')
            pdf.setTextColor(100, 100, 100)
            const notesLines = pdf.splitTextToSize(consultation.notesPrivees, 160)
            pdf.text(notesLines, 25, yPosition + 7)
            pdf.setTextColor(0, 0, 0)
        }

        // Pied de page
        const pageHeight = pdf.internal.pageSize.height
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, pageHeight - 15, {align: 'center'})
        pdf.text('Ce document est confidentiel et destiné à un usage médical', 105, pageHeight - 10, {align: 'center'})

        // Télécharger le PDF
        pdf.save(`consultation-${consultation.id}.pdf`)
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Consultation #{consultation.id}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4"/>
                        {formatDate(consultation.date)}
                    </p>
                </div>
                <div className="flex gap-2">
                    {onEdit && (
                        <Button variant="outline" onClick={onEdit}>
                            <Edit className="w-4 h-4 mr-2"/>
                            Modifier
                        </Button>
                    )}
                    {/* Bouton de téléchargement PDF */}
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2"/>
                        Télécharger PDF
                    </Button>
                </div>
            </div>

            {/* Le reste du contenu reste inchangé */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5"/>
                            Patient
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label className="text-sm font-medium">Nom complet</Label>
                            <p className="font-semibold">
                                {patient.prenom} {patient.nom}
                            </p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Contact</Label>
                            <p className="text-sm">{patient.email}</p>
                            <p className="text-sm">{patient.telephone}</p>
                        </div>
                        {patient.dateNaissance && (
                            <div>
                                <Label className="text-sm font-medium">Date de naissance</Label>
                                <p className="text-sm">{new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5"/>
                            Médecin
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label className="text-sm font-medium">Nom complet</Label>
                            <p className="font-semibold">
                                {medecin.prenom} {medecin.nom}
                            </p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Spécialité</Label>
                            <Badge variant="secondary">{medecin.specialite}</Badge>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Contact</Label>
                            <p className="text-sm">{medecin.email}</p>
                            <p className="text-sm">{medecin.telephone}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Consultation Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5"/>
                        Détails de la Consultation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="font-semibold">Motif de consultation</Label>
                        <p className="text-muted-foreground mt-1">{consultation.motif}</p>
                    </div>

                    {consultation.examenClinique && (
                        <div className="pt-4 border-t border-border">
                            <Label className="font-semibold">Examen clinique</Label>
                            <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{consultation.examenClinique}</p>
                        </div>
                    )}

                    {consultation.diagnostic && (
                        <div className="pt-4 border-t border-border">
                            <Label className="font-semibold">Diagnostic</Label>
                            <div className="mt-1 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="font-medium text-foreground">{consultation.diagnostic}</p>
                            </div>
                        </div>
                    )}

                    {consultation.notesPrivees && (
                        <div className="pt-4 border-t border-border">
                            <Label className="font-semibold">Notes privées</Label>
                            <p className="text-muted-foreground mt-1 text-sm italic">{consultation.notesPrivees}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function Label({children, className}: { children: React.ReactNode; className?: string }) {
    return (
        <label
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
            {children}
        </label>
    )
}
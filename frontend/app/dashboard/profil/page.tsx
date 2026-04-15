// app/dashboard/profil/page.tsx - PAGE UNIQUE
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from "../../../lib/auth-context"
import { usePatientProfile } from "../../../hooks/usePatientProfile"
import { useMedecinProfile } from "../../../hooks/useMedecinProfile"
import { Patient, Medecin } from "../../../lib/api-client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { UserCircle, Mail, Phone, Calendar, MapPin, Droplet, AlertCircle, Loader2, Save, X, Edit, Lock, Briefcase, DollarSign } from "lucide-react"
import { Badge } from "../../../components/ui/badge"
import { useRouter } from "next/navigation"
import {router} from "next/client";

export default function DashboardProfilPage() {
    const { user } = useAuth()
    const router = useRouter()

    // Afficher le profil selon le rôle
    if (user?.role === 'PATIENT') {
        return <ProfilPatient />
    } else if (user?.role === 'MEDECIN') {
        return <ProfilMedecin />
    } else {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Profil non disponible pour votre rôle</p>
            </div>
        )
    }
}

// COMPOSANT PROFIL PATIENT
function ProfilPatient() {
    const { user } = useAuth()
    const { patient, loading, error, updatePatient } = usePatientProfile(user?.id)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)

    // États pour la modification du mot de passe
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Initialiser les données du formulaire
    useEffect(() => {
        if (patient) {
            setFormData({
                nom: patient.nom || '',
                prenom: patient.prenom || '',
                email: patient.email || '',
                telephone: patient.telephone || '',
                dateNaissance: patient.dateNaissance || '',
                numeroSecuriteSociale: patient.numeroSecuriteSociale || '',
                adresse: patient.adresse || '',
                groupeSanguin: patient.groupeSanguin || '',
                allergies: patient.allergies || ''
            })
        }
    }, [patient])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        if (patient) {
            setFormData({
                nom: patient.nom || '',
                prenom: patient.prenom || '',
                email: patient.email || '',
                telephone: patient.telephone || '',
                dateNaissance: patient.dateNaissance || '',
                numeroSecuriteSociale: patient.numeroSecuriteSociale || '',
                adresse: patient.adresse || '',
                groupeSanguin: patient.groupeSanguin || '',
                allergies: patient.allergies || ''
            })
        }
    }

    // Sauvegarder les modifications du profil
    const handleSave = async () => {
        if (!patient) return

        setSaving(true)
        try {
            const updateData: Partial<Patient> = {
                id: patient.id,
                nom: formData.nom || patient.nom,
                prenom: formData.prenom || patient.prenom,
                email: formData.email || patient.email,
                telephone: formData.telephone || patient.telephone,
                password: patient.password,
                role: patient.role,
                dateNaissance: formData.dateNaissance || patient.dateNaissance,
                numeroSecuriteSociale: formData.numeroSecuriteSociale || patient.numeroSecuriteSociale,
                adresse: formData.adresse || patient.adresse,
                groupeSanguin: formData.groupeSanguin || patient.groupeSanguin,
                allergies: formData.allergies || patient.allergies,
                medecinTraitantId: patient.medecinTraitantId,
                createdAt: patient.createdAt,
                updatedAt: new Date().toISOString()
            }

            console.log('🔄 Données envoyées pour mise à jour:', updateData)
            await updatePatient(updateData)
            setIsEditing(false)
            console.log('✅ Profil mis à jour avec succès')
            alert('Profil mis à jour avec succès!')

        } catch (error: any) {
            console.error('❌ Erreur lors de la sauvegarde:', error)
            alert(`Erreur: ${error.message || 'Impossible de mettre à jour le profil'}`)
        } finally {
            setSaving(false)
        }
    }

    // Changer le mot de passe
    const handleChangePassword = async () => {
        if (!patient) return

        // Validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas')
            return
        }

        if (passwordData.newPassword.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères')
            return
        }

        setSaving(true)
        try {
            const updateData: Partial<Patient> = {
                ...patient,
                password: passwordData.newPassword,
                updatedAt: new Date().toISOString()
            }

            console.log('🔄 Changement de mot de passe...')
            await updatePatient(updateData)

            setIsChangingPassword(false)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            alert('Mot de passe changé avec succès!')

        } catch (error: any) {
            console.error('❌ Erreur changement mot de passe:', error)
            alert(`Erreur: ${error.message || 'Impossible de changer le mot de passe'}`)
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "Non renseigné"

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return "Date invalide"

            return new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(date)
        } catch {
            return "Date invalide"
        }
    }

    // Gérer les allergies (peuvent être string ou string[])
    const getAllergiesArray = (): string[] => {
        const allergies = isEditing ? formData.allergies : patient?.allergies
        if (!allergies) return []
        if (Array.isArray(allergies)) return allergies
        if (typeof allergies === 'string') {
            return allergies.split(',').map(a => a.trim()).filter(a => a)
        }
        return []
    }

    const allergiesArray = getAllergiesArray()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Chargement du profil...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Réessayer
                    </Button>
                </div>
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Profil patient non trouvé</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil Patient</h1>
                    <p className="text-muted-foreground">Gérez vos informations personnelles et médicales</p>
                </div>
                {!isEditing && (
                    <Button onClick={handleEdit} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Modifier le profil
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                        <CardDescription>Vos coordonnées et informations de contact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b border-border">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCircle className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    {isEditing ? formData.prenom : patient.prenom} {isEditing ? formData.nom : patient.nom}
                                </h2>
                                <Badge variant="secondary" className="mt-1">
                                    Patient
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                {isEditing ? (
                                    <Input
                                        id="nom"
                                        value={formData.nom}
                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                        className="bg-background"
                                    />
                                ) : (
                                    <Input id="nom" value={patient.nom || ''} readOnly className="bg-muted" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom</Label>
                                {isEditing ? (
                                    <Input
                                        id="prenom"
                                        value={formData.prenom}
                                        onChange={(e) => handleInputChange('prenom', e.target.value)}
                                        className="bg-background"
                                    />
                                ) : (
                                    <Input id="prenom" value={patient.prenom || ''} readOnly className="bg-muted" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input id="email" value={patient.email || ''} readOnly className="pl-10 bg-muted" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telephone">Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="telephone"
                                            value={formData.telephone}
                                            onChange={(e) => handleInputChange('telephone', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input id="telephone" value={patient.telephone || ''} readOnly className="pl-10 bg-muted" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateNaissance">Date de Naissance</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="dateNaissance"
                                            type="date"
                                            value={formData.dateNaissance}
                                            onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input
                                            id="dateNaissance"
                                            value={patient.dateNaissance ? formatDate(patient.dateNaissance) : 'Non renseigné'}
                                            readOnly
                                            className="pl-10 bg-muted"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numeroSecuriteSociale">Numéro Sécurité Sociale</Label>
                                {isEditing ? (
                                    <Input
                                        id="numeroSecuriteSociale"
                                        value={formData.numeroSecuriteSociale}
                                        onChange={(e) => handleInputChange('numeroSecuriteSociale', e.target.value)}
                                        className="bg-background"
                                    />
                                ) : (
                                    <Input
                                        id="numeroSecuriteSociale"
                                        value={patient.numeroSecuriteSociale || 'Non renseigné'}
                                        readOnly
                                        className="bg-muted"
                                    />
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="adresse">Adresse</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="adresse"
                                            value={formData.adresse}
                                            onChange={(e) => handleInputChange('adresse', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input
                                            id="adresse"
                                            value={patient.adresse || 'Non renseignée'}
                                            readOnly
                                            className="pl-10 bg-muted"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SECTION SÉCURITÉ - MOT DE PASSE */}
                        <div className="pt-4 border-t border-border">
                            <div className="flex justify-between items-center mb-4">
                                <Label className="text-lg font-semibold flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    Sécurité du compte
                                </Label>
                                {!isChangingPassword && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsChangingPassword(true)}
                                    >
                                        Changer le mot de passe
                                    </Button>
                                )}
                            </div>

                            {isChangingPassword ? (
                                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({
                                                ...prev,
                                                newPassword: e.target.value
                                            }))}
                                            placeholder="Au moins 6 caractères"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({
                                                ...prev,
                                                confirmPassword: e.target.value
                                            }))}
                                            placeholder="Retapez le nouveau mot de passe"
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsChangingPassword(false)
                                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                            }}
                                            disabled={saving}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={handleChangePassword}
                                            disabled={saving}
                                        >
                                            {saving ? 'Changement...' : 'Changer le mot de passe'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Le mot de passe n'est pas affiché pour des raisons de sécurité.
                                </p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="pt-4 border-t border-border flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Medical Info Card */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplet className="w-5 h-5 text-red-500" />
                                Informations Médicales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Groupe Sanguin</Label>
                                {isEditing ? (
                                    <Input
                                        value={formData.groupeSanguin}
                                        onChange={(e) => handleInputChange('groupeSanguin', e.target.value)}
                                        className="text-2xl font-bold text-red-600 h-auto py-2 bg-background"
                                        placeholder="Ex: A+"
                                    />
                                ) : (
                                    <p className="text-2xl font-bold text-red-600">
                                        {patient.groupeSanguin || "Non renseigné"}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border">
                                <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Allergies
                                </Label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={formData.allergies}
                                            onChange={(e) => handleInputChange('allergies', e.target.value)}
                                            placeholder="Séparer par des virgules (ex: Pollen, Acariens, Penicilline)"
                                            className="bg-background"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Séparez les allergies par des virgules
                                        </p>
                                    </div>
                                ) : allergiesArray.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {allergiesArray.map((allergie, index) => (
                                            <Badge key={index} variant="destructive">
                                                {allergie}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucune allergie connue</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Médecin Traitant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patient.medecinTraitantId ? (
                                <div className="space-y-2">
                                    <p className="font-semibold">Médecin traitant assigné</p>
                                    <p className="text-sm text-muted-foreground">ID: {patient.medecinTraitantId}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 bg-transparent"
                                        onClick={() => router.push(`/medecin/${patient.medecinTraitantId}`)}
                                    >
                                        Voir le profil
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Aucun médecin traitant assigné
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// COMPOSANT PROFIL MÉDECIN - VERSION CORRIGÉE
function ProfilMedecin() {
    const { user } = useAuth()
    const { medecin, loading, error, updateMedecin } = useMedecinProfile(user?.id)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)

    // États pour la modification du mot de passe
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    // Initialiser les données du formulaire
    useEffect(() => {
        if (medecin) {
            setFormData({
                nom: medecin.nom || '',
                prenom: medecin.prenom || '',
                email: medecin.email || '',
                telephone: medecin.telephone || '',
                specialite: medecin.specialite || '',
                numeroIdentification: medecin.numeroIdentification || '',
                adresseCabinet: medecin.adresseCabinet || '',
                tarifConsultation: medecin.tarifConsultation || ''
            })
        }
    }, [medecin])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        if (medecin) {
            setFormData({
                nom: medecin.nom || '',
                prenom: medecin.prenom || '',
                email: medecin.email || '',
                telephone: medecin.telephone || '',
                specialite: medecin.specialite || '',
                numeroIdentification: medecin.numeroIdentification || '',
                adresseCabinet: medecin.adresseCabinet || '',
                tarifConsultation: medecin.tarifConsultation || ''
            })
        }
    }

    // 🔥 CORRECTION : Sauvegarder les modifications du profil AVEC MOT DE PASSE
    const handleSave = async () => {
        if (!medecin) return

        setSaving(true)
        try {
            const updateData: Partial<Medecin> = {
                nom: formData.nom || medecin.nom,
                prenom: formData.prenom || medecin.prenom,
                email: formData.email || medecin.email,
                telephone: formData.telephone || medecin.telephone,
                specialite: formData.specialite || medecin.specialite,
                numeroIdentification: formData.numeroIdentification || medecin.numeroIdentification,
                adresseCabinet: formData.adresseCabinet || medecin.adresseCabinet,
                tarifConsultation: formData.tarifConsultation ? Number(formData.tarifConsultation) : medecin.tarifConsultation,
                // 🔥 AJOUTER LES CHAMPS OBLIGATOIRES
                password: medecin.password, // Garder le mot de passe actuel
                role: medecin.role, // Garder le rôle
            }

            console.log('🔄 Données envoyées pour mise à jour:', updateData)
            await updateMedecin(updateData)
            setIsEditing(false)
            console.log('✅ Profil médecin mis à jour avec succès')
            alert('Profil mis à jour avec succès!')

        } catch (error: any) {
            console.error('❌ Erreur lors de la sauvegarde:', error)
            alert(`Erreur: ${error.message || 'Impossible de mettre à jour le profil'}`)
        } finally {
            setSaving(false)
        }
    }

    // 🔥 CORRECTION : Changer le mot de passe AVEC TOUS LES CHAMPS
    const handleChangePassword = async () => {
        if (!medecin) return

        // Validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas')
            return
        }

        if (passwordData.newPassword.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères')
            return
        }

        setSaving(true)
        try {
            const updateData: Partial<Medecin> = {
                // 🔥 CORRECTION : Inclure tous les champs obligatoires
                nom: medecin.nom,
                prenom: medecin.prenom,
                email: medecin.email,
                telephone: medecin.telephone,
                specialite: medecin.specialite,
                numeroIdentification: medecin.numeroIdentification,
                adresseCabinet: medecin.adresseCabinet,
                tarifConsultation: medecin.tarifConsultation,
                password: passwordData.newPassword, // Nouveau mot de passe
                role: medecin.role,
            }

            console.log('🔄 Changement de mot de passe médecin...')
            await updateMedecin(updateData)

            setIsChangingPassword(false)
            setPasswordData({ newPassword: '', confirmPassword: '' })
            alert('Mot de passe changé avec succès!')

        } catch (error: any) {
            console.error('❌ Erreur changement mot de passe:', error)
            alert(`Erreur: ${error.message || 'Impossible de changer le mot de passe'}`)
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    const formatPrice = (price?: number) => {
        if (!price) return "Non spécifié"
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XOF",
            minimumFractionDigits: 0,
        }).format(price)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Chargement du profil...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Réessayer
                    </Button>
                </div>
            </div>
        )
    }

    if (!medecin) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Profil médecin non trouvé</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil Médecin</h1>
                    <p className="text-muted-foreground">Gérez vos informations professionnelles</p>
                </div>
                {!isEditing && (
                    <Button onClick={handleEdit} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Modifier le profil
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Informations Professionnelles</CardTitle>
                        <CardDescription>Vos coordonnées et informations de pratique</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b border-border">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCircle className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    Dr. {isEditing ? formData.prenom : medecin.prenom} {isEditing ? formData.nom : medecin.nom}
                                </h2>
                                <Badge variant="default" className="mt-1">
                                    Médecin
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                {isEditing ? (
                                    <Input
                                        id="nom"
                                        value={formData.nom}
                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                        className="bg-background"
                                    />
                                ) : (
                                    <Input id="nom" value={medecin.nom || ''} readOnly className="bg-muted" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom</Label>
                                {isEditing ? (
                                    <Input
                                        id="prenom"
                                        value={formData.prenom}
                                        onChange={(e) => handleInputChange('prenom', e.target.value)}
                                        className="bg-background"
                                    />
                                ) : (
                                    <Input id="prenom" value={medecin.prenom || ''} readOnly className="bg-muted" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input id="email" value={medecin.email || ''} readOnly className="pl-10 bg-muted" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telephone">Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="telephone"
                                            value={formData.telephone}
                                            onChange={(e) => handleInputChange('telephone', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input id="telephone" value={medecin.telephone || ''} readOnly className="pl-10 bg-muted" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialite">Spécialité</Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="specialite"
                                            value={formData.specialite}
                                            onChange={(e) => handleInputChange('specialite', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input id="specialite" value={medecin.specialite || ''} readOnly className="pl-10 bg-muted" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numeroIdentification">Numéro d'Identification</Label>
                                {isEditing ? (
                                    <Input
                                        id="numeroIdentification"
                                        value={formData.numeroIdentification}
                                        onChange={(e) => handleInputChange('numeroIdentification', e.target.value)}
                                        className="bg-background"
                                    />
                                ) : (
                                    <Input
                                        id="numeroIdentification"
                                        value={medecin.numeroIdentification || 'Non renseigné'}
                                        readOnly
                                        className="bg-muted"
                                    />
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="adresseCabinet">Adresse du Cabinet</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="adresseCabinet"
                                            value={formData.adresseCabinet}
                                            onChange={(e) => handleInputChange('adresseCabinet', e.target.value)}
                                            className="pl-10 bg-background"
                                        />
                                    ) : (
                                        <Input
                                            id="adresseCabinet"
                                            value={medecin.adresseCabinet || 'Non renseignée'}
                                            readOnly
                                            className="pl-10 bg-muted"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tarifConsultation">Tarif Consultation (XOF)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <Input
                                            id="tarifConsultation"
                                            type="number"
                                            value={formData.tarifConsultation}
                                            onChange={(e) => handleInputChange('tarifConsultation', e.target.value)}
                                            className="pl-10 bg-background"
                                            placeholder="Ex: 10000"
                                        />
                                    ) : (
                                        <Input
                                            id="tarifConsultation"
                                            value={medecin.tarifConsultation ? formatPrice(medecin.tarifConsultation) : 'Non spécifié'}
                                            readOnly
                                            className="pl-10 bg-muted"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SECTION SÉCURITÉ - MOT DE PASSE */}
                        <div className="pt-4 border-t border-border">
                            <div className="flex justify-between items-center mb-4">
                                <Label className="text-lg font-semibold flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    Sécurité du compte
                                </Label>
                                {!isChangingPassword && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsChangingPassword(true)}
                                    >
                                        Changer le mot de passe
                                    </Button>
                                )}
                            </div>

                            {isChangingPassword ? (
                                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({
                                                ...prev,
                                                newPassword: e.target.value
                                            }))}
                                            placeholder="Au moins 6 caractères"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({
                                                ...prev,
                                                confirmPassword: e.target.value
                                            }))}
                                            placeholder="Retapez le nouveau mot de passe"
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsChangingPassword(false)
                                                setPasswordData({ newPassword: '', confirmPassword: '' })
                                            }}
                                            disabled={saving}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={handleChangePassword}
                                            disabled={saving}
                                        >
                                            {saving ? 'Changement...' : 'Changer le mot de passe'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Le mot de passe n'est pas affiché pour des raisons de sécurité.
                                </p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="pt-4 border-t border-border flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Informations complémentaires */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">0</p>
                                <p className="text-sm text-muted-foreground">Rendez-vous aujourd'hui</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">0</p>
                                <p className="text-sm text-muted-foreground">Patients ce mois</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions Rapides</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/medecin/disponibilites'}>
                                Gérer les disponibilités
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/medecin/rendez-vous'}>
                                Voir les rendez-vous
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/medecin/patients'}>
                                Mes patients
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
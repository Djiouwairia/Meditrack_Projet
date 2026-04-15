// app/dashboard/parametres/page.tsx - VERSION AVEC BOUTONS MODIFIER/ENREGISTRER
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Bell, Shield, Clock, Mail, Save, Loader2, Edit, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

// Types pour les paramètres
interface HospitalSettings {
    general: {
        nomEtablissement: string
        siret: string
        adresse: string
        telephonePrincipal: string
        emailContact: string
        messageAccueil: string
    }
    notifications: {
        notificationsEmail: boolean
        notificationsSMS: boolean
        rappelsAutomatiques: boolean
        emailExpediteur: string
    }
    securite: {
        validationAuto: boolean
        dureeSession: number
        tentativesConnexion: number
    }
    horaires: {
        horairesOuverture: JourHoraire[]
        dureeCreneau: number
    }
}

interface JourHoraire {
    jour: string
    debut: string
    fin: string
    ouvert: boolean
}

const JOURS_SEMAINE = [
    "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
]

// Données par défaut
const DEFAULT_SETTINGS: HospitalSettings = {
    general: {
        nomEtablissement: "Clinique MediTrack",
        siret: "123 456 789 00012",
        adresse: "15 Avenue Lamine Gueye, Dakar, Sénégal",
        telephonePrincipal: "+221 33 123 45 67",
        emailContact: "contact@meditrack.sn",
        messageAccueil: "Bienvenue à la Clinique MediTrack - Votre santé, notre priorité"
    },
    notifications: {
        notificationsEmail: true,
        notificationsSMS: false,
        rappelsAutomatiques: true,
        emailExpediteur: "noreply@meditrack.sn"
    },
    securite: {
        validationAuto: false,
        dureeSession: 60,
        tentativesConnexion: 5
    },
    horaires: {
        horairesOuverture: JOURS_SEMAINE.map(jour => ({
            jour,
            debut: jour === "Dimanche" ? "" : jour === "Samedi" ? "09:00" : "08:00",
            fin: jour === "Dimanche" ? "" : jour === "Samedi" ? "13:00" : "18:00",
            ouvert: jour !== "Dimanche"
        })),
        dureeCreneau: 30
    }
}

export default function ParametresPage() {
    const { toast } = useToast()
    const [settings, setSettings] = useState<HospitalSettings>(DEFAULT_SETTINGS)
    const [originalSettings, setOriginalSettings] = useState<HospitalSettings>(DEFAULT_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState({
        general: false,
        notifications: false,
        securite: false,
        horaires: false
    })

    // Charger les paramètres depuis le localStorage
    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings = localStorage.getItem('hospital-settings')
                if (savedSettings) {
                    const parsedSettings = JSON.parse(savedSettings)
                    setSettings(parsedSettings)
                    setOriginalSettings(parsedSettings)
                }
            } catch (error) {
                console.error('Erreur chargement paramètres:', error)
            } finally {
                setLoading(false)
            }
        }

        loadSettings()
    }, [])

    // Activer le mode édition pour une section
    const startEditing = (section: keyof typeof editing) => {
        setEditing(prev => ({
            ...prev,
            [section]: true
        }))
    }

    // Annuler les modifications pour une section
    const cancelEditing = (section: keyof typeof editing) => {
        setSettings(prev => ({
            ...prev,
            [section]: originalSettings[section]
        }))
        setEditing(prev => ({
            ...prev,
            [section]: false
        }))
    }

    // Sauvegarder les paramètres d'une section
    const saveSection = async (section: keyof typeof editing) => {
        setSaving(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 800))

            const updatedSettings = {
                ...settings,
                [section]: settings[section]
            }

            localStorage.setItem('hospital-settings', JSON.stringify(updatedSettings))
            setOriginalSettings(updatedSettings)
            setEditing(prev => ({
                ...prev,
                [section]: false
            }))

            toast({
                title: "Modifications enregistrées",
                description: `Les paramètres ${getSectionName(section)} ont été sauvegardés.`,
                variant: "default",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder les paramètres.",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    // Sauvegarder tous les paramètres
    const saveAllSettings = async () => {
        setSaving(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            localStorage.setItem('hospital-settings', JSON.stringify(settings))
            setOriginalSettings(settings)
            setEditing({
                general: false,
                notifications: false,
                securite: false,
                horaires: false
            })

            toast({
                title: "Paramètres enregistrés",
                description: "Tous vos paramètres ont été sauvegardés avec succès.",
                variant: "default",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder les paramètres.",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    // Obtenir le nom de la section pour les messages
    const getSectionName = (section: keyof typeof editing): string => {
        const names = {
            general: "généraux",
            notifications: "des notifications",
            securite: "de sécurité",
            horaires: "des horaires"
        }
        return names[section]
    }

    // Mettre à jour les paramètres généraux
    const updateGeneralSettings = (field: keyof HospitalSettings['general'], value: string) => {
        setSettings(prev => ({
            ...prev,
            general: {
                ...prev.general,
                [field]: value
            }
        }))
    }

    // Mettre à jour les paramètres de notification
    const updateNotificationSettings = (field: keyof HospitalSettings['notifications'], value: boolean | string) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [field]: value
            }
        }))
    }

    // Mettre à jour les paramètres de sécurité
    const updateSecuritySettings = (field: keyof HospitalSettings['securite'], value: boolean | number) => {
        setSettings(prev => ({
            ...prev,
            securite: {
                ...prev.securite,
                [field]: value
            }
        }))
    }

    // Mettre à jour les horaires
    const updateHoraires = (index: number, field: 'debut' | 'fin' | 'ouvert', value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            horaires: {
                ...prev.horaires,
                horairesOuverture: prev.horaires.horairesOuverture.map((horaire, i) =>
                    i === index ? { ...horaire, [field]: value } : horaire
                )
            }
        }))
    }

    // Mettre à jour la durée des créneaux
    const updateDureeCreneau = (value: number) => {
        setSettings(prev => ({
            ...prev,
            horaires: {
                ...prev.horaires,
                dureeCreneau: value
            }
        }))
    }

    // Réinitialiser aux valeurs par défaut
    const resetToDefaults = () => {
        setSettings(DEFAULT_SETTINGS)
        setOriginalSettings(DEFAULT_SETTINGS)
        setEditing({
            general: false,
            notifications: false,
            securite: false,
            horaires: false
        })
        toast({
            title: "Paramètres réinitialisés",
            description: "Tous les paramètres ont été remis à leurs valeurs par défaut.",
        })
    }

    // Vérifier si une section a des modifications
    const hasChanges = (section: keyof HospitalSettings): boolean => {
        return JSON.stringify(settings[section]) !== JSON.stringify(originalSettings[section])
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                <span className="text-lg text-muted-foreground">Chargement des paramètres...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Paramètres Système</h1>
                    <p className="text-muted-foreground mt-1">Gérez la configuration générale de l'application</p>
                </div>
                <Button variant="outline" onClick={resetToDefaults}>
                    Réinitialiser
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="securite">Sécurité</TabsTrigger>
                    <TabsTrigger value="horaires">Horaires</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-primary" />
                                    <CardTitle>Informations de l'Établissement</CardTitle>
                                </div>
                                {!editing.general ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => startEditing('general')}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Modifier
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => cancelEditing('general')}
                                            disabled={saving}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={() => saveSection('general')}
                                            disabled={saving || !hasChanges('general')}
                                            className="flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Enregistrer
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>Configuration des informations générales de la clinique</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nom-etablissement">Nom de l'Établissement *</Label>
                                    <Input
                                        id="nom-etablissement"
                                        value={settings.general.nomEtablissement}
                                        onChange={(e) => updateGeneralSettings('nomEtablissement', e.target.value)}
                                        placeholder="Nom de votre établissement"
                                        disabled={!editing.general}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siret">Numéro SIRET</Label>
                                    <Input
                                        id="siret"
                                        value={settings.general.siret}
                                        onChange={(e) => updateGeneralSettings('siret', e.target.value)}
                                        placeholder="123 456 789 00012"
                                        disabled={!editing.general}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adresse">Adresse *</Label>
                                <Input
                                    id="adresse"
                                    value={settings.general.adresse}
                                    onChange={(e) => updateGeneralSettings('adresse', e.target.value)}
                                    placeholder="Adresse complète de l'établissement"
                                    disabled={!editing.general}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telephone-principal">Téléphone Principal *</Label>
                                    <Input
                                        id="telephone-principal"
                                        value={settings.general.telephonePrincipal}
                                        onChange={(e) => updateGeneralSettings('telephonePrincipal', e.target.value)}
                                        placeholder="+221 33 123 45 67"
                                        disabled={!editing.general}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-contact">Email de Contact *</Label>
                                    <Input
                                        id="email-contact"
                                        type="email"
                                        value={settings.general.emailContact}
                                        onChange={(e) => updateGeneralSettings('emailContact', e.target.value)}
                                        placeholder="contact@etablissement.sn"
                                        disabled={!editing.general}
                                    />
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Label htmlFor="message-accueil">Message d'Accueil</Label>
                                <Textarea
                                    id="message-accueil"
                                    value={settings.general.messageAccueil}
                                    onChange={(e) => updateGeneralSettings('messageAccueil', e.target.value)}
                                    placeholder="Message de bienvenue pour vos patients"
                                    rows={3}
                                    disabled={!editing.general}
                                />
                            </div>

                            {editing.general && hasChanges('general') && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Vous avez des modifications non enregistrées dans cette section.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <CardTitle>Gestion des Notifications</CardTitle>
                                </div>
                                {!editing.notifications ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => startEditing('notifications')}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Modifier
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => cancelEditing('notifications')}
                                            disabled={saving}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={() => saveSection('notifications')}
                                            disabled={saving || !hasChanges('notifications')}
                                            className="flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Enregistrer
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>Configurez les notifications automatiques du système</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notif-email">Notifications par Email</Label>
                                    <p className="text-sm text-muted-foreground">Envoyer des notifications par email aux utilisateurs</p>
                                </div>
                                <Switch
                                    id="notif-email"
                                    checked={settings.notifications.notificationsEmail}
                                    onCheckedChange={(checked) => updateNotificationSettings('notificationsEmail', checked)}
                                    disabled={!editing.notifications}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notif-sms">Notifications par SMS</Label>
                                    <p className="text-sm text-muted-foreground">Envoyer des rappels par SMS avant les rendez-vous</p>
                                </div>
                                <Switch
                                    id="notif-sms"
                                    checked={settings.notifications.notificationsSMS}
                                    onCheckedChange={(checked) => updateNotificationSettings('notificationsSMS', checked)}
                                    disabled={!editing.notifications}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="rappels-auto">Rappels Automatiques</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Rappeler automatiquement les patients 24h avant leur RDV
                                    </p>
                                </div>
                                <Switch
                                    id="rappels-auto"
                                    checked={settings.notifications.rappelsAutomatiques}
                                    onCheckedChange={(checked) => updateNotificationSettings('rappelsAutomatiques', checked)}
                                    disabled={!editing.notifications}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="email-expediteur">Email Expéditeur *</Label>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email-expediteur"
                                        type="email"
                                        value={settings.notifications.emailExpediteur}
                                        onChange={(e) => updateNotificationSettings('emailExpediteur', e.target.value)}
                                        placeholder="noreply@etablissement.sn"
                                        disabled={!editing.notifications}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Email utilisé pour envoyer les notifications automatiques
                                </p>
                            </div>

                            {editing.notifications && hasChanges('notifications') && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Vous avez des modifications non enregistrées dans cette section.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="securite" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <CardTitle>Paramètres de Sécurité</CardTitle>
                                </div>
                                {!editing.securite ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => startEditing('securite')}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Modifier
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => cancelEditing('securite')}
                                            disabled={saving}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={() => saveSection('securite')}
                                            disabled={saving || !hasChanges('securite')}
                                            className="flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Enregistrer
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>Configuration des règles de sécurité et d'accès</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="validation-auto">Validation Automatique des RDV</Label>
                                    <p className="text-sm text-muted-foreground">Accepter automatiquement les demandes de rendez-vous</p>
                                </div>
                                <Switch
                                    id="validation-auto"
                                    checked={settings.securite.validationAuto}
                                    onCheckedChange={(checked) => updateSecuritySettings('validationAuto', checked)}
                                    disabled={!editing.securite}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="duree-session">Durée de Session (minutes) *</Label>
                                <Input
                                    id="duree-session"
                                    type="number"
                                    value={settings.securite.dureeSession}
                                    onChange={(e) => updateSecuritySettings('dureeSession', parseInt(e.target.value) || 60)}
                                    min="15"
                                    max="480"
                                    disabled={!editing.securite}
                                />
                                <p className="text-sm text-muted-foreground">Durée avant déconnexion automatique pour inactivité</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tentatives-connexion">Tentatives de Connexion *</Label>
                                <Input
                                    id="tentatives-connexion"
                                    type="number"
                                    value={settings.securite.tentativesConnexion}
                                    onChange={(e) => updateSecuritySettings('tentativesConnexion', parseInt(e.target.value) || 5)}
                                    min="3"
                                    max="10"
                                    disabled={!editing.securite}
                                />
                                <p className="text-sm text-muted-foreground">Nombre de tentatives avant blocage du compte</p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Politique de Mot de Passe</Label>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span>Minimum 8 caractères</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span>Au moins une majuscule et une minuscule</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span>Au moins un chiffre</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <span>Au moins un caractère spécial</span>
                                    </div>
                                </div>
                            </div>

                            {editing.securite && hasChanges('securite') && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Vous avez des modifications non enregistrées dans cette section.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="horaires" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <CardTitle>Horaires d'Ouverture</CardTitle>
                                </div>
                                {!editing.horaires ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => startEditing('horaires')}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Modifier
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => cancelEditing('horaires')}
                                            disabled={saving}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={() => saveSection('horaires')}
                                            disabled={saving || !hasChanges('horaires')}
                                            className="flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Enregistrer
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>Définissez les horaires de consultation de l'établissement</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {settings.horaires.horairesOuverture.map((horaire, index) => (
                                <div key={horaire.jour} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 w-32">
                                        <Switch
                                            checked={horaire.ouvert}
                                            onCheckedChange={(checked) => updateHoraires(index, 'ouvert', checked)}
                                            disabled={!editing.horaires}
                                        />
                                        <Label className={!horaire.ouvert ? "text-muted-foreground" : ""}>
                                            {horaire.jour}
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="time"
                                            value={horaire.debut}
                                            onChange={(e) => updateHoraires(index, 'debut', e.target.value)}
                                            className="w-32"
                                            disabled={!editing.horaires || !horaire.ouvert}
                                        />
                                        <span className="text-muted-foreground">à</span>
                                        <Input
                                            type="time"
                                            value={horaire.fin}
                                            onChange={(e) => updateHoraires(index, 'fin', e.target.value)}
                                            className="w-32"
                                            disabled={!editing.horaires || !horaire.ouvert}
                                        />
                                    </div>
                                </div>
                            ))}

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Label htmlFor="duree-creneau">Durée Standard d'un Créneau (minutes) *</Label>
                                <Input
                                    id="duree-creneau"
                                    type="number"
                                    value={settings.horaires.dureeCreneau}
                                    onChange={(e) => updateDureeCreneau(parseInt(e.target.value) || 30)}
                                    min="15"
                                    max="120"
                                    step="15"
                                    disabled={!editing.horaires}
                                />
                                <p className="text-sm text-muted-foreground">Durée par défaut pour chaque rendez-vous</p>
                            </div>

                            {editing.horaires && hasChanges('horaires') && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Vous avez des modifications non enregistrées dans cette section.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Bouton de sauvegarde global */}
            <div className="fixed bottom-6 right-6">
                <Button
                    onClick={saveAllSettings}
                    disabled={saving}
                    size="lg"
                    className="shadow-lg"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sauvegarde...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder tous les paramètres
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
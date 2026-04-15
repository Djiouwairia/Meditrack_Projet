'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, MapPin, Phone, Mail, Calendar, Star, Stethoscope, Clock } from 'lucide-react'

interface Medecin {
    id: number
    nom: string
    prenom: string
    email: string
    telephone: string
    specialite: string
    numeroIdentification: string
    adresseCabinet: string
    tarifConsultation?: number
    createdAt: string
}

export default function MedecinProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [medecin, setMedecin] = useState<Medecin | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const medecinId = params.id as string

    useEffect(() => {
        const fetchMedecin = async () => {
            if (!medecinId) return

            setLoading(true)
            setError(null)

            try {
                console.log('🔄 Chargement du médecin ID:', medecinId)
                const data = await apiClient.get<Medecin>(`/api/medecins/${medecinId}`)
                setMedecin(data)
                console.log('✅ Médecin chargé:', data)
            } catch (err: any) {
                console.error('❌ Erreur chargement médecin:', err)
                setError(err.message || 'Erreur lors du chargement du profil médecin')
            } finally {
                setLoading(false)
            }
        }

        fetchMedecin()
    }, [medecinId])

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
                    <p className="text-muted-foreground">Chargement du profil médecin...</p>
                </div>
            </div>
        )
    }

    if (error || !medecin) {
        return (
            <div className="container mx-auto p-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </Button>

                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-destructive text-lg mb-4">
                            {error || 'Médecin non trouvé'}
                        </p>
                        <Button onClick={() => router.back()}>
                            Retour au profil
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Bouton retour */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Dr. {medecin.prenom} {medecin.nom}
                                </h1>
                                <Badge variant="default" className="mt-1">
                                    Médecin
                                </Badge>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Spécialité */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Spécialité</h3>
                            <Badge variant="secondary" className="text-base px-3 py-1">
                                {medecin.specialite}
                            </Badge>
                        </div>

                        {/* Informations de contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{medecin.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Téléphone</p>
                                    <p className="font-medium">{medecin.telephone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Adresse du cabinet */}
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Adresse du cabinet</p>
                                <p className="font-medium">{medecin.adresseCabinet}</p>
                            </div>
                        </div>

                        {/* Informations professionnelles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-sm text-muted-foreground">Numéro d'identification</p>
                                <p className="font-medium">{medecin.numeroIdentification}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tarif consultation</p>
                                <p className="font-medium text-primary">{formatPrice(medecin.tarifConsultation)}</p>
                            </div>
                        </div>

                        {/* Disponibilité */}
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Disponibilité</p>
                                <p className="font-medium">Sur rendez-vous uniquement</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informations complémentaires */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                Avis & Qualifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                                <span className="text-sm text-muted-foreground ml-2">(4.0/5.0)</span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Membre de l'ordre depuis</p>
                                <p className="font-medium">
                                    {medecin.createdAt ? new Date(medecin.createdAt).getFullYear() : 'Non spécifié'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full"
                                onClick={() => router.push(`/medecins?medecinId=${medecin.id}`)}
                            >
                                Prendre rendez-vous
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push(`/contact?medecin=${medecin.id}`)}
                            >
                                Contacter le cabinet
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Eye, EyeOff, Loader2, HeartPulse, CalendarCheck,
    BarChart2, Users, Clock, AlertCircle, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from '@/lib/api-client'

type UserRole = 'PATIENT' | 'MEDECIN' | 'ADMIN';

export default function InscriptionPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [userRole, setUserRole] = useState<UserRole>("PATIENT")

    const [formData, setFormData] = useState({
        nom: "", prenom: "", email: "", password: "", confirmPassword: "",
        telephone: "", dateNaissance: "", numeroSecuriteSociale: "",
        adresse: "", groupeSanguin: "", specialite: "",
        numeroIdentification: "", adresseCabinet: "", tarifConsultation: "",
        departement: "",
    })

    // Dégradé Bleu Ciel MediTrack
    const skyGradient = "linear-gradient(145deg, #7ad5f9 0%, #38bdf8 50%, #06b6d4 100%)";

    const features = [
        { icon: CalendarCheck, label: "Prise de rendez-vous" },
        { icon: BarChart2, label: "Suivi médical complet" },
        { icon: Users, label: "Réseau de spécialistes" },
        { icon: Clock, label: "Historique en temps réel" },
    ]

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            return
        }
        setIsLoading(true)
        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                nom: formData.nom,
                prenom: formData.prenom,
                telephone: formData.telephone,
                role: userRole,
                ...(userRole === 'PATIENT' && {
                    dateNaissance: formData.dateNaissance,
                    numeroSecuriteSociale: formData.numeroSecuriteSociale,
                    adresse: formData.adresse,
                    groupeSanguin: formData.groupeSanguin,
                }),
                ...(userRole === 'MEDECIN' && {
                    specialite: formData.specialite,
                    numeroIdentification: formData.numeroIdentification,
                    adresseCabinet: formData.adresseCabinet,
                    tarifConsultation: formData.tarifConsultation ? parseFloat(formData.tarifConsultation) : undefined,
                }),
                ...(userRole === 'ADMIN' && { departement: formData.departement }),
            }
            await apiClient.post("/admin/users", userData)
            setSuccess(true)
            setTimeout(() => router.push("/login"), 2000)
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'inscription")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
                    <CheckCircle size={64} color="#38bdf8" style={{ margin: "0 auto 20px" }} />
                    <h2 style={{ fontSize: "24px", fontWeight: 700 }}>Inscription réussie !</h2>
                    <p style={{ color: "#64748b" }}>Redirection vers la connexion...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* GAUCHE — Formulaire d'inscription */}
            <div style={{
                width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column",
                padding: "40px 60px", background: "#ffffff", overflowY: "auto"
            }}>
                {/* Logo avec Sky Gradient */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "10px",
                        background: skyGradient,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <HeartPulse style={{ width: "20px", height: "20px", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                        Medi<span style={{ color: "#38bdf8" }}>Track</span>
                    </span>
                </div>

                <div style={{ marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Créer un compte</h1>
                    <p style={{ color: "#6b7280" }}>Rejoignez MediTrack pour une meilleure gestion de votre santé.</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                    <div className="space-y-2">
                        <Label>Type de compte *</Label>
                        <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
                            <SelectTrigger className="h-11 rounded-xl focus:ring-[#38bdf8]">
                                <SelectValue placeholder="Rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PATIENT">Patient</SelectItem>
                                <SelectItem value="MEDECIN">Médecin</SelectItem>
                                <SelectItem value="ADMIN">Administrateur</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom *</Label>
                            <Input id="nom" className="h-11 rounded-xl focus:border-[#38bdf8]" placeholder="Nom" value={formData.nom} onChange={(e) => handleChange("nom", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prenom">Prénom *</Label>
                            <Input id="prenom" className="h-11 rounded-xl focus:border-[#38bdf8]" placeholder="Prénom" value={formData.prenom} onChange={(e) => handleChange("prenom", e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" className="h-11 rounded-xl" placeholder="nom@exemple.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe *</Label>
                            <Input id="password" type="password" className="h-11 rounded-xl" placeholder="••••••••" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">Confirmer mot de passe *</Label>
                            <Input id="confirm" type="password" className="h-11 rounded-xl" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tel">Téléphone *</Label>
                        <Input id="tel" className="h-11 rounded-xl" placeholder="+221 ..." value={formData.telephone} onChange={(e) => handleChange("telephone", e.target.value)} required />
                    </div>

                    {/* Champs spécifiques PATIENT */}
                    {userRole === 'PATIENT' && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div className="space-y-2">
                                <Label>Date de naissance</Label>
                                <Input type="date" className="h-11 rounded-xl" value={formData.dateNaissance} onChange={(e) => handleChange("dateNaissance", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Groupe Sanguin</Label>
                                <Select value={formData.groupeSanguin} onValueChange={(v) => handleChange("groupeSanguin", v)}>
                                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Sél." /></SelectTrigger>
                                    <SelectContent>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Champs spécifiques MEDECIN */}
                    {userRole === 'MEDECIN' && (
                        <>
                            <div className="space-y-2">
                                <Label>Spécialité *</Label>
                                <Input className="h-11 rounded-xl" placeholder="Ex: Cardiologue" value={formData.specialite} onChange={(e) => handleChange("specialite", e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Adresse Cabinet *</Label>
                                <Input className="h-11 rounded-xl" placeholder="Dakar, Sénégal" value={formData.adresseCabinet} onChange={(e) => handleChange("adresseCabinet", e.target.value)} required />
                            </div>
                        </>
                    )}

                    {/* Bouton avec Sky Gradient */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        style={{ background: skyGradient, boxShadow: "0 4px 12px rgba(56, 189, 248, 0.25)" }}
                        className="h-12 rounded-xl text-white font-semibold mt-4 hover:opacity-90 transition-opacity"
                    >
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscription...</> : "Créer mon compte"}
                    </Button>
                </form>

                <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginTop: "32px" }}>
                    Déjà membre ?{" "}
                    <Link href="/login" style={{ color: "#38bdf8", fontWeight: 600, textDecoration: "none" }}>
                        Se connecter
                    </Link>
                </p>
            </div>

            {/* DROITE — Panneau Bleu Ciel MediTrack */}
            <div style={{
                flex: 1, display: "flex", position: "relative", overflow: "hidden",
                background: skyGradient,
                alignItems: "center", justifyContent: "center", flexDirection: "column", color: "white"
            }} className="hidden lg:flex">

                {/* Cercles décoratifs */}
                <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "white", opacity: 0.1, top: "-10%", right: "-10%" }} />
                <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "white", opacity: 0.1, bottom: "5%", left: "-5%" }} />

                <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 60px" }}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "24px", margin: "0 auto 32px",
                        background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <HeartPulse size={40} style={{ color: "white" }} />
                    </div>

                    <h2 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px", color: "white" }}>
                        MediTrack Pro
                    </h2>
                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", maxWidth: "340px", margin: "0 auto 60px", lineHeight: 1.6 }}>
                        La plateforme tout-en-un pour simplifier la gestion de votre santé et de vos patients.
                    </p>

                    {/* Grille d'icônes circulaires */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
                        {features.map(({ icon: Icon, label }) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                                <div style={{
                                    width: "70px", height: "70px", borderRadius: "50%",
                                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                                    backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <Icon size={28} style={{ color: "white" }} />
                                </div>
                                <p style={{ fontSize: "14px", fontWeight: 500, opacity: 0.9, color: "white" }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
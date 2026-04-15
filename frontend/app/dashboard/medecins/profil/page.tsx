'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, Loader2, AlertCircle, MapPin, Phone, Mail, Calendar, Star, Stethoscope, Clock, Hash, DollarSign } from "lucide-react"

interface Medecin {
    id: number; nom: string; prenom: string; email: string; telephone: string
    specialite: string; numeroIdentification: string; adresseCabinet: string
    tarifConsultation?: number; createdAt: string
}

export default function MedecinProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [medecin, setMedecin] = useState<Medecin | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!params.id) return
        apiClient.get<Medecin>(`/api/medecins/${params.id}`)
            .then(setMedecin).catch(() => setError("Médecin introuvable.")).finally(() => setLoading(false))
    }, [params.id])

    const fmtPrice = (p?: number) => p ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(p) : "Non spécifié"

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1d4ed8" }} className="animate-spin" />
        </div>
    )
    if (error || !medecin) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
            <AlertCircle style={{ width: "40px", height: "40px", color: "#ef4444" }} />
            <p style={{ color: "#ef4444", fontSize: "14px" }}>{error || "Médecin introuvable"}</p>
            <button onClick={() => router.back()} style={{ padding: "10px 20px", borderRadius: "10px", background: "#1d4ed8", color: "white", border: "none", cursor: "pointer" }}>Retour</button>
        </div>
    )

    const infoItems = [
        { icon: Mail, label: "Email", value: medecin.email },
        { icon: Phone, label: "Téléphone", value: medecin.telephone },
        { icon: MapPin, label: "Cabinet", value: medecin.adresseCabinet },
        { icon: Hash, label: "N° Identification", value: medecin.numeroIdentification },
        { icon: Clock, label: "Disponibilité", value: "Sur rendez-vous uniquement" },
        { icon: Calendar, label: "Membre depuis", value: medecin.createdAt ? new Date(medecin.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—" },
    ]

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: "820px" }}>
            {/* Back + header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <button onClick={() => router.back()} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft style={{ width: "16px", height: "16px", color: "#374151" }} />
                </button>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}>Profil Médecin</h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                {/* Main card */}
                <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    {/* Blue header */}
                    <div style={{ padding: "28px 28px 20px", background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Stethoscope style={{ width: "28px", height: "28px", color: "white" }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "white", margin: "0 0 4px" }}>
                                    Dr. {medecin.prenom} {medecin.nom}
                                </h2>
                                <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: "rgba(255,255,255,0.15)", color: "white" }}>
                  {medecin.specialite}
                </span>
                            </div>
                        </div>
                        {/* Stars */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "14px" }}>
                            {[1,2,3,4].map(i => <span key={i} style={{ color: "#fbbf24", fontSize: "16px" }}>★</span>)}
                            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>★</span>
                            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginLeft: "6px" }}>4.0 / 5.0</span>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div style={{ padding: "24px 28px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {infoItems.map(({ icon: Icon, label, value }) => (
                                <div key={label} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Icon style={{ width: "15px", height: "15px", color: "#1d4ed8" }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                                        <p style={{ fontSize: "13px", color: "#111827", margin: 0, fontWeight: 500 }}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Tarif */}
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #bfdbfe", padding: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <DollarSign style={{ width: "16px", height: "16px", color: "#1d4ed8" }} />
                            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Tarif</h3>
                        </div>
                        <p style={{ fontSize: "26px", fontWeight: 700, color: "#1d4ed8", margin: "0 0 4px" }}>{fmtPrice(medecin.tarifConsultation)}</p>
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Par consultation</p>
                    </div>

                    {/* Actions */}
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 14px" }}>Actions</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button onClick={() => router.push(`/dashboard/medecins?medecinId=${medecin.id}`)} style={{
                                width: "100%", padding: "12px", borderRadius: "10px",
                                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white",
                                border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                            }}>
                                <Calendar style={{ width: "15px", height: "15px" }} /> Prendre rendez-vous
                            </button>
                            <button onClick={() => router.push(`/contact?medecin=${medecin.id}`)} style={{
                                width: "100%", padding: "12px", borderRadius: "10px",
                                background: "white", color: "#374151",
                                border: "1px solid #e5e7eb", cursor: "pointer", fontSize: "13px", fontWeight: 500,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                            }}>
                                <Mail style={{ width: "15px", height: "15px" }} /> Contacter le cabinet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
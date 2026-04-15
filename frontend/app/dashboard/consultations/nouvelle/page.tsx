"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { usersApi, consultationsApi } from "@/lib/api-client"
import { ArrowLeft, Loader2, AlertCircle, Save } from "lucide-react"

export default function NouvelleConsultationPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({ patientId: "", motif: "", examenClinique: "", diagnostic: "", notesPrivees: "" })

    useEffect(() => {
        usersApi.getPatients().then(p => { setPatients(p); if (p.length > 0) setForm(f => ({ ...f, patientId: String(p[0].id) })) }).catch(() => setError("Impossible de charger les patients.")).finally(() => setLoading(false))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.id || !form.patientId) { setError("Données manquantes."); return }
        setSaving(true); setError("")
        try {
            await consultationsApi.create({ patientId: parseInt(form.patientId), medecinId: user.id, date: new Date().toISOString().split("T")[0], motif: form.motif, examenClinique: form.examenClinique, diagnostic: form.diagnostic, notesPrivees: form.notesPrivees })
            router.push("/dashboard/consultations")
        } catch { setError("Erreur lors de l'enregistrement.") }
        finally { setSaving(false) }
    }

    const inp = (placeholder: string, key: keyof typeof form, type = "text") => (
        <input type={type} placeholder={placeholder} value={form[key]}
               onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
               style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
               onFocus={e => e.target.style.borderColor = "#1d4ed8"}
               onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
    )

    const ta = (placeholder: string, key: keyof typeof form, rows = 3) => (
        <textarea placeholder={placeholder} value={form[key]} rows={rows}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#1d4ed8"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
    )

    const lbl = (text: string, req = false) => (
        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
            {text}{req && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
    )

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1d4ed8" }} className="animate-spin" />
        </div>
    )

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: "720px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                <button onClick={() => router.back()} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft style={{ width: "16px", height: "16px", color: "#374151" }} />
                </button>
                <div>
                    <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>Nouvelle Consultation</h1>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Enregistrez les détails de la consultation médicale</p>
                </div>
            </div>

            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "#fef2f2", color: "#dc2626", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "20px" }}>
                    <AlertCircle style={{ width: "15px", height: "15px" }} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Patient */}
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 16px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>Patient</h2>
                        <div>
                            {lbl("Sélectionner le patient", true)}
                            <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} required
                                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", background: "white", cursor: "pointer" }}>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.prenom} {p.nom} — {p.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Consultation */}
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 16px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>Informations médicales</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>{lbl("Motif de consultation", true)}{inp("Ex: Douleurs abdominales, fièvre...", "motif")}</div>
                            <div>{lbl("Examen clinique")}{ta("Ex: Température 37.2°C, Tension 120/80...", "examenClinique", 3)}</div>
                            <div>{lbl("Diagnostic")}{ta("Ex: Gastrite légère, infection virale...", "diagnostic", 3)}</div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 16px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>Notes privées</h2>
                        {ta("Observations confidentielles réservées au médecin...", "notesPrivees", 4)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => router.back()} style={{ padding: "11px 20px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 24px", borderRadius: "10px", background: saving ? "#93c5fd" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>
                            {saving ? <Loader2 style={{ width: "15px", height: "15px" }} className="animate-spin" /> : <Save style={{ width: "15px", height: "15px" }} />}
                            {saving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
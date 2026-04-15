"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { consultationsApi, usersApi } from "@/lib/api-client"
import { ArrowLeft, Loader2, AlertCircle, Save } from "lucide-react"

export default function EditConsultationPage() {
    const router = useRouter()
    const params = useParams()
    const id = parseInt(params.id as string)

    const [original, setOriginal] = useState<any>(null)
    const [patient, setPatient] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({ motif: "", examenClinique: "", diagnostic: "", notesPrivees: "" })

    useEffect(() => {
        const load = async () => {
            if (!id) return
            setLoading(true)
            try {
                const c = await consultationsApi.getById(id)
                setOriginal(c)
                setForm({ motif: c.motif || "", examenClinique: c.examenClinique || "", diagnostic: c.diagnostic || "", notesPrivees: c.notesPrivees || "" })
                const p = await usersApi.getPatientById(c.patientId)
                setPatient(p)
            } catch { setError("Impossible de charger la consultation.") }
            finally { setLoading(false) }
        }
        load()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!original) return
        setSaving(true); setError("")
        try {
            await consultationsApi.update(id, { ...original, ...form, patientId: original.patientId, medecinId: original.medecinId, date: original.date })
            router.push(`/dashboard/consultations/${id}`)
        } catch { setError("Erreur lors de la mise à jour.") }
        finally { setSaving(false) }
    }

    const inp = (label: string, key: keyof typeof form, placeholder: string) => (
        <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>{label}</label>
            <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                   style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                   onFocus={e => e.target.style.borderColor = "#1d4ed8"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
        </div>
    )

    const ta = (label: string, key: keyof typeof form, placeholder: string, rows = 3) => (
        <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>{label}</label>
            <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} rows={rows}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={e => e.target.style.borderColor = "#1d4ed8"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
        </div>
    )

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1d4ed8" }} className="animate-spin" />
        </div>
    )
    if (error && !original) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <AlertCircle style={{ width: "36px", height: "36px", color: "#ef4444" }} />
            <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
            <button onClick={() => router.back()} style={{ padding: "10px 20px", borderRadius: "10px", background: "#1d4ed8", color: "white", border: "none", cursor: "pointer" }}>Retour</button>
        </div>
    )

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: "720px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                <button onClick={() => router.back()} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft style={{ width: "16px", height: "16px", color: "#374151" }} />
                </button>
                <div>
                    <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>Modifier la Consultation</h1>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                        Patient : {patient ? `${patient.prenom} ${patient.nom}` : `#${original?.patientId}`}
                        {original && ` · ${new Date(original.date).toLocaleDateString("fr-FR")}`}
                    </p>
                </div>
            </div>

            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "#fef2f2", color: "#dc2626", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "20px" }}>
                    <AlertCircle style={{ width: "15px", height: "15px" }} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 16px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>Informations médicales</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {inp("Motif de consultation", "motif", "Ex: Douleurs abdominales...")}
                            {ta("Examen clinique", "examenClinique", "Ex: Température 37.2°C, Tension 120/80...", 3)}
                            {ta("Diagnostic", "diagnostic", "Ex: Gastrite légère...", 3)}
                        </div>
                    </div>

                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 16px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>Notes privées</h2>
                        {ta("", "notesPrivees", "Observations confidentielles...", 4)}
                    </div>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => router.back()} style={{ padding: "11px 20px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#374151" }}>Annuler</button>
                        <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 24px", borderRadius: "10px", background: saving ? "#93c5fd" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>
                            {saving ? <Loader2 style={{ width: "15px", height: "15px" }} className="animate-spin" /> : <Save style={{ width: "15px", height: "15px" }} />}
                            {saving ? "Enregistrement..." : "Sauvegarder"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { consultationsApi, usersApi } from "@/lib/api-client"
import type { Consultation } from "@/lib/api-client"
import { Plus, Search, Eye, Trash2, Loader2, AlertCircle, RefreshCw, FileText, Calendar, User } from "lucide-react"

export default function ConsultationsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [consults, setConsults] = useState<Consultation[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [deleting, setDeleting] = useState<number | null>(null)

    const fetchData = async () => {
        setLoading(true); setError("")
        try {
            let data: Consultation[]
            if (user?.role === "MEDECIN") data = await consultationsApi.getByMedecin(user.id)
            else if (user?.role === "PATIENT") data = await consultationsApi.getByPatient(user.id)
            else data = await consultationsApi.getAll()

            const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            setConsults(sorted)

            // Load users for names
            const [patients, medecins] = await Promise.all([usersApi.getPatients(), usersApi.getMedecins()])
            setAllUsers([...patients, ...medecins])
        } catch { setError("Impossible de charger les consultations.") }
        finally { setLoading(false) }
    }
    useEffect(() => { if (user) fetchData() }, [user])

    const getName = (id: number) => {
        const u = allUsers.find(u => Number(u.id) === Number(id))
        return u ? `${u.prenom} ${u.nom}` : `#${id}`
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Supprimer cette consultation ?")) return
        setDeleting(id)
        try { await consultationsApi.delete(id); setConsults(c => c.filter(x => x.id !== id)) }
        catch { alert("Erreur lors de la suppression") }
        finally { setDeleting(null) }
    }

    const filtered = consults.filter(c => {
        if (!search) return true
        const q = search.toLowerCase()
        return c.motif?.toLowerCase().includes(q) || c.diagnostic?.toLowerCase().includes(q) ||
            getName(c.patientId).toLowerCase().includes(q) || getName(c.medecinId).toLowerCase().includes(q)
    })

    const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1d4ed8" }} className="animate-spin" />
            <span style={{ color: "#6b7280", fontSize: "14px" }}>Chargement des consultations...</span>
        </div>
    )

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Consultations</h1>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>{consults.length} consultation{consults.length !== 1 ? "s" : ""} enregistrée{consults.length !== 1 ? "s" : ""}</p>
                </div>
                {user?.role === "MEDECIN" && (
                    <button onClick={() => router.push("/dashboard/consultations/nouvelle")} style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "11px 20px",
                        borderRadius: "12px", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                        color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600
                    }}>
                        <Plus style={{ width: "16px", height: "16px" }} /> Nouvelle consultation
                    </button>
                )}
            </div>

            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderRadius: "12px", background: "#fef2f2", color: "#dc2626", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "20px" }}>
                    <AlertCircle style={{ width: "16px", height: "16px" }} />
                    {error}
                    <button onClick={fetchData} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "12px", fontWeight: 600 }}>
                        <RefreshCw style={{ width: "13px", height: "13px" }} /> Réessayer
                    </button>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                {[
                    { label: "Total", val: consults.length, color: "#1d4ed8", bg: "#eff6ff", bd: "#bfdbfe" },
                    { label: "Ce mois", val: consults.filter(c => { const d = new Date(c.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).length, color: "#059669", bg: "#f0fdf4", bd: "#a7f3d0" },
                    { label: "Aujourd'hui", val: consults.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length, color: "#7c3aed", bg: "#f5f3ff", bd: "#ddd6fe" },
                ].map(s => (
                    <div key={s.label} style={{ background: "white", borderRadius: "14px", padding: "18px 20px", border: `1px solid ${s.bd}` }}>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", marginBottom: "2px" }}>{s.val}</div>
                        <div style={{ fontSize: "13px", color: s.color, fontWeight: 500 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ background: "white", borderRadius: "14px", padding: "16px 20px", border: "1px solid #e5e7eb", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <Search style={{ width: "16px", height: "16px", color: "#9ca3af", flexShrink: 0 }} />
                <input placeholder="Rechercher par motif, diagnostic, patient, médecin..."
                       value={search} onChange={e => setSearch(e.target.value)}
                       style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#374151", background: "transparent" }}
                />
            </div>

            {/* Table */}
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ background: "#f9fafb" }}>
                        {["Patient", "Médecin", "Date", "Motif", "Diagnostic", "Actions"].map(h => (
                            <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: "48px", textAlign: "center" }}>
                                <FileText style={{ width: "40px", height: "40px", color: "#d1d5db", margin: "0 auto 12px" }} />
                                <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>Aucune consultation trouvée</p>
                            </td>
                        </tr>
                    ) : filtered.map((c, i) => (
                        <tr key={c.id} style={{ borderTop: i === 0 ? "none" : "1px solid #f3f4f6", cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                            <td style={{ padding: "14px 20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                                        <User style={{ width: "14px", height: "14px" }} />
                                    </div>
                                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{getName(c.patientId)}</span>
                                </div>
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6b7280" }}>Dr. {getName(c.medecinId)}</td>
                            <td style={{ padding: "14px 20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Calendar style={{ width: "12px", height: "12px", color: "#9ca3af" }} />
                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{fmtDate(c.date)}</span>
                                </div>
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: "13px", color: "#374151", maxWidth: "140px" }}>
                                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.motif || "—"}</span>
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                                {c.diagnostic ? (
                                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#f0fdf4", color: "#059669", display: "inline-block", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.diagnostic}</span>
                                ) : <span style={{ color: "#d1d5db", fontSize: "12px" }}>—</span>}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <button onClick={() => router.push(`/dashboard/consultations/${c.id}`)} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "none", background: "#eff6ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Eye style={{ width: "13px", height: "13px", color: "#1d4ed8" }} />
                                    </button>
                                    {user?.role === "MEDECIN" && (
                                        <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "none", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {deleting === c.id ? <Loader2 style={{ width: "13px", height: "13px", color: "#dc2626" }} className="animate-spin" /> : <Trash2 style={{ width: "13px", height: "13px", color: "#dc2626" }} />}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
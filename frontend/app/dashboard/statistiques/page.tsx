'use client'

import { useState, useEffect } from "react"
import { usersApi, rendezVousApi, consultationsApi } from "@/lib/api-client"
import { Users, Calendar, Stethoscope, TrendingUp, UserCheck, Clock, Activity, FileText, Loader2, AlertCircle, RefreshCw } from "lucide-react"

const safeNum = (id: any): number => {
    if (id === null || id === undefined) return 0
    if (typeof id === 'number') return id
    if (typeof id === 'string') { const n = parseInt(id, 10); return isNaN(n) ? 0 : n }
    return 0
}
const cmpIds = (a: any, b: any) => safeNum(a) === safeNum(b)

export default function StatistiquesPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [patients, setPatients] = useState<any[]>([])
    const [medecins, setMedecins] = useState<any[]>([])
    const [rdvs, setRdvs] = useState<any[]>([])
    const [consults, setConsults] = useState<any[]>([])

    const fetchData = async () => {
        setLoading(true); setError(null)
        try {
            const [p, m, r, c] = await Promise.all([
                usersApi.getPatients(), usersApi.getMedecins(),
                rendezVousApi.getAll(), consultationsApi.getAll()
            ])
            setPatients(p); setMedecins(m); setRdvs(r); setConsults(c)
        } catch { setError("Impossible de charger les statistiques.") }
        finally { setLoading(false) }
    }
    useEffect(() => { fetchData() }, [])

    const today = new Date().toISOString().split("T")[0]
    const confirmed = rdvs.filter(r => r.statut?.toUpperCase() === "CONFIRME").length
    const pending = rdvs.filter(r => r.statut?.toUpperCase() === "DEMANDE").length
    const todayRdv = rdvs.filter(r => { try { return new Date(r.dateHeure).toISOString().split("T")[0] === today } catch { return false } }).length
    const rate = rdvs.length > 0 ? Math.round((confirmed / rdvs.length) * 100) : 0

    const cards = [
        { label: "Total Patients", val: patients.length, icon: Users, c: "#3b82f6", bg: "#eff6ff", bd: "#bfdbfe", sub: "Inscrits sur la plateforme" },
        { label: "Médecins Actifs", val: medecins.length, icon: Stethoscope, c: "#059669", bg: "#f0fdf4", bd: "#a7f3d0", sub: "Toutes spécialités confondues" },
        { label: "Rendez-vous", val: rdvs.length, icon: Calendar, c: "#7c3aed", bg: "#f5f3ff", bd: "#ddd6fe", sub: "Total enregistrés" },
        { label: "Consultations", val: consults.length, icon: FileText, c: "#ea580c", bg: "#fff7ed", bd: "#fed7aa", sub: "Dossiers complétés" },
        { label: "RDV Confirmés", val: confirmed, icon: UserCheck, c: "#0891b2", bg: "#ecfeff", bd: "#a5f3fc", sub: `${rate}% du total` },
        { label: "En Attente", val: pending, icon: Clock, c: "#d97706", bg: "#fffbeb", bd: "#fde68a", sub: "À traiter" },
        { label: "Aujourd'hui", val: todayRdv, icon: Activity, c: "#dc2626", bg: "#fef2f2", bd: "#fecaca", sub: "RDV du jour" },
        { label: "Taux Occupation", val: `${rate}%`, icon: TrendingUp, c: "#1d4ed8", bg: "#eff6ff", bd: "#bfdbfe", sub: "Efficacité globale" },
    ]

    // Spécialités
    const specMap: Record<string, { rdv: number; patients: number }> = {}
    medecins.forEach(m => {
        const spec = m.specialite || 'Non spécifiée'
        if (!specMap[spec]) specMap[spec] = { rdv: 0, patients: 0 }
        const mid = safeNum(m.id)
        specMap[spec].rdv += rdvs.filter(r => cmpIds(r.medecinId, mid)).length
        specMap[spec].patients += new Set(consults.filter(c => cmpIds(c.medecinId, mid)).map(c => safeNum(c.patientId))).size
    })
    const specs = Object.entries(specMap).map(([nom, d]) => ({ nom, ...d }))
    const maxRdv = Math.max(...specs.map(s => s.rdv), 1)

    // Top médecins
    const topDocs = medecins.map(m => ({
        ...m,
        nbC: consults.filter(c => cmpIds(c.medecinId, safeNum(m.id))).length,
        nbR: rdvs.filter(r => cmpIds(r.medecinId, safeNum(m.id))).length,
    })).sort((a, b) => b.nbC - a.nbC).slice(0, 5)

    // RDV par statut (bar chart simple)
    const statutGroups = [
        { label: "Confirmé", count: confirmed, color: "#059669" },
        { label: "En attente", count: pending, color: "#d97706" },
        { label: "Annulé", count: rdvs.filter(r => r.statut?.toUpperCase() === "ANNULE").length, color: "#dc2626" },
        { label: "Terminé", count: rdvs.filter(r => r.statut?.toUpperCase() === "TERMINE").length, color: "#7c3aed" },
    ]
    const maxStatut = Math.max(...statutGroups.map(s => s.count), 1)

    const S = {
        page: { fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties,
        card: (bd: string) => ({ background: "white", borderRadius: "16px", padding: "20px", border: `1px solid ${bd}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "default" } as React.CSSProperties),
        section: { background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" } as React.CSSProperties,
        sh: { padding: "18px 24px", borderBottom: "1px solid #f3f4f6" } as React.CSSProperties,
        sb: { padding: "20px 24px" } as React.CSSProperties,
    }

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1d4ed8" }} className="animate-spin" />
            <span style={{ color: "#6b7280", fontSize: "14px" }}>Chargement des statistiques...</span>
        </div>
    )

    if (error) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
            <AlertCircle style={{ width: "40px", height: "40px", color: "#ef4444" }} />
            <p style={{ color: "#ef4444", fontSize: "14px", margin: 0 }}>{error}</p>
            <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", background: "#1d4ed8", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
                <RefreshCw style={{ width: "15px", height: "15px" }} /> Réessayer
            </button>
        </div>
    )

    return (
        <div style={S.page}>
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Statistiques</h1>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Vue d'ensemble de l'activité de l'établissement · données en temps réel</p>
            </div>

            {/* 8 stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {cards.map(({ label, val, icon: Icon, c, bg, bd, sub }) => (
                    <div key={label} style={S.card(bd)}
                         onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
                         onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
                    >
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                            <Icon style={{ width: "20px", height: "20px", color: c }} />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: "3px" }}>{val}</div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "2px" }}>{label}</div>
                        <div style={{ fontSize: "11px", color: c, fontWeight: 500 }}>{sub}</div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

                {/* RDV par statut */}
                <div style={S.section}>
                    <div style={S.sh}>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>Rendez-vous par Statut</h2>
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Distribution actuelle</p>
                    </div>
                    <div style={{ padding: "24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {statutGroups.map(sg => (
                                <div key={sg.label}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                        <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{sg.label}</span>
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: sg.color }}>{sg.count}</span>
                                    </div>
                                    <div style={{ height: "8px", background: "#f3f4f6", borderRadius: "999px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", background: sg.color, borderRadius: "999px", width: `${(sg.count / maxStatut) * 100}%`, transition: "width 0.6s ease" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Total */}
                        <div style={{ marginTop: "20px", padding: "12px", borderRadius: "10px", background: "#f9fafb", display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", color: "#6b7280" }}>Total rendez-vous</span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{rdvs.length}</span>
                        </div>
                    </div>
                </div>

                {/* Activité par spécialité */}
                <div style={S.section}>
                    <div style={S.sh}>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>Activité par Spécialité</h2>
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Patients & rendez-vous par spécialité</p>
                    </div>
                    <div style={{ padding: "20px 24px" }}>
                        {specs.length === 0 ? (
                            <p style={{ color: "#9ca3af", fontSize: "13px", textAlign: "center" }}>Aucune donnée disponible</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                {specs.map((s, i) => (
                                    <div key={i}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                            <div>
                                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{s.nom}</span>
                                                <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "8px" }}>{s.patients} patients · {s.rdv} RDV</span>
                                            </div>
                                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>{Math.round((s.rdv / maxRdv) * 100)}%</span>
                                        </div>
                                        <div style={{ height: "7px", background: "#f3f4f6", borderRadius: "999px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", background: "linear-gradient(90deg,#1d4ed8,#60a5fa)", borderRadius: "999px", width: `${(s.rdv / maxRdv) * 100}%`, transition: "width 0.6s ease" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top médecins */}
            <div style={S.section}>
                <div style={S.sh}>
                    <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>Médecins les Plus Actifs</h2>
                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Classés par nombre de consultations</p>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ background: "#f9fafb" }}>
                        {["#", "Médecin", "Spécialité", "Consultations", "Rendez-vous"].map(h => (
                            <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {topDocs.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>Aucun médecin trouvé</td></tr>
                    ) : topDocs.map((m, i) => (
                        <tr key={m.id} style={{ borderTop: "1px solid #f3f4f6" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                            <td style={{ padding: "14px 20px" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i === 0 ? "#fef3c7" : "#f3f4f6", color: i === 0 ? "#d97706" : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>{i + 1}</div>
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                                        {`${m.prenom?.[0] ?? ""}${m.nom?.[0] ?? ""}`.toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Dr. {m.prenom} {m.nom}</span>
                                </div>
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                                <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#eff6ff", color: "#1d4ed8" }}>{m.specialite}</span>
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 700, color: "#1d4ed8" }}>{m.nbC}</td>
                            <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6b7280" }}>{m.nbR}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
    Users, Calendar, FileText, Activity, Search, Bell,
    ArrowRight, TrendingUp, Loader2, AlertCircle, Eye,
    Check, Trash2, UserPlus, Clock,
} from "lucide-react"
import { adminApi, rendezVousApi, consultationsApi, usersApi, type RendezVous, type UserDTO } from "@/lib/api-client"

interface Stats {
    totalUsers: number
    activeMedecins: number
    rdvSemaine: number
    rdvAujourdhui: number
    totalConsultations: number
    patients: number
}

const STATUT_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    CONFIRME:  { bg: "#dcfce7", color: "#16a34a", label: "Confirmé" },
    DEMANDE:   { bg: "#fef3c7", color: "#d97706", label: "En attente" },
    ANNULE:    { bg: "#fee2e2", color: "#dc2626", label: "Annulé" },
    TERMINE:   { bg: "#e0e7ff", color: "#4338ca", label: "Terminé" },
}

export default function DashboardPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<Stats | null>(null)
    const [recentRdv, setRecentRdv] = useState<RendezVous[]>([])
    const [allUsers, setAllUsers] = useState<UserDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(t)
    }, [])

    const fetchData = useCallback(async () => {
        if (user?.role !== "ADMIN") return
        setLoading(true)
        try {
            const [users, rdvs, consultations, medecins] = await Promise.all([
                adminApi.getUsers(),
                rendezVousApi.getAll(),
                consultationsApi.getAll(),
                usersApi.getMedecins(),
            ])

            const todayStr = new Date().toDateString()
            const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7)

            setStats({
                totalUsers: users.length,
                activeMedecins: medecins.length,
                rdvSemaine: rdvs.filter(r => { const d = new Date(r.dateHeure); return d >= new Date() && d <= nextWeek }).length,
                rdvAujourdhui: rdvs.filter(r => new Date(r.dateHeure).toDateString() === todayStr).length,
                totalConsultations: consultations.length,
                patients: users.filter(u => u.role === "PATIENT").length,
            })

            // 5 most recent RDV
            const sorted = [...rdvs].sort((a, b) => new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime())
            setRecentRdv(sorted.slice(0, 5))
            setAllUsers(users)
        } catch (err) {
            console.error(err)
            setError("Impossible de charger les données.")
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => { fetchData() }, [fetchData])

    const getPatientName = (patientId: number) => {
        const u = allUsers.find(u => u.id === patientId)
        return u ? `${u.prenom} ${u.nom}` : `Patient #${patientId}`
    }
    const getMedecinName = (medecinId: number) => {
        const u = allUsers.find(u => u.id === medecinId)
        return u ? `Dr. ${u.prenom} ${u.nom}` : `Médecin #${medecinId}`
    }

    const getGreeting = () => {
        const h = now.getHours()
        return h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir"
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    const formatTime = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

    const statCards = [
        { title: "Utilisateurs", value: stats?.totalUsers ?? "—", sub: `${stats?.patients ?? 0} patients`, icon: Users, color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
        { title: "Médecins Actifs", value: stats?.activeMedecins ?? "—", sub: "Toutes spécialités", icon: Activity, color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
        { title: "RDV Semaine", value: stats?.rdvSemaine ?? "—", sub: `${stats?.rdvAujourdhui ?? 0} aujourd'hui`, icon: Calendar, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
        { title: "Consultations", value: stats?.totalConsultations ?? "—", sub: "Total enregistrées", icon: FileText, color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
    ]

    const quickActions = [
        { title: "Utilisateurs", href: "/dashboard/utilisateurs", icon: Users, color: "#1d4ed8" },
        { title: "Statistiques", href: "/dashboard/statistiques", icon: TrendingUp, color: "#059669" },
        { title: "Rendez-vous", href: "/dashboard/rendez-vous", icon: Calendar, color: "#7c3aed" },
        { title: "Paramètres", href: "/dashboard/parametres", icon: Activity, color: "#ea580c" },
    ]

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── TOP BAR ── */}
            <div style={{
                position: "sticky", top: 0, zIndex: 30,
                background: "white", borderBottom: "1px solid #f3f4f6",
                padding: "14px 32px", display: "flex", alignItems: "center", gap: "16px"
            }}>
                {/* Search */}
                <div style={{ flex: 1, position: "relative", maxWidth: "400px" }}>
                    <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#9ca3af" }} />
                    <input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%", paddingLeft: "40px", paddingRight: "16px",
                            paddingTop: "10px", paddingBottom: "10px",
                            borderRadius: "10px", border: "1px solid #e5e7eb",
                            background: "#f9fafb", fontSize: "13px", outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                <div style={{ flex: 1 }} />
                {/* Bell */}
                <div style={{ position: "relative", cursor: "pointer" }}>
                    <Bell style={{ width: "20px", height: "20px", color: "#6b7280" }} />
                    <span style={{
                        position: "absolute", top: "-4px", right: "-4px",
                        width: "16px", height: "16px", borderRadius: "50%",
                        background: "#ef4444", color: "white", fontSize: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700
                    }}>3</span>
                </div>
                {/* Avatar */}
                <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer"
                }}>
                    {`${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase()}
                </div>
            </div>

            {/* ── MAIN ── */}
            <div style={{ padding: "32px" }}>

                {/* Header */}
                <div style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                        Tableau de bord
                    </h1>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                        {getGreeting()}, {user?.prenom} — {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>

                {error && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px",
                        borderRadius: "12px", background: "#fef2f2", color: "#dc2626",
                        fontSize: "13px", border: "1px solid #fecaca", marginBottom: "24px"
                    }}>
                        <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
                        <Loader2 style={{ width: "36px", height: "36px", color: "#1d4ed8" }} className="animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ── STAT CARDS ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                            {statCards.map((s) => {
                                const Icon = s.icon
                                return (
                                    <div key={s.title} style={{
                                        background: "white", borderRadius: "16px", padding: "20px 24px",
                                        border: `1px solid ${s.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                        transition: "transform 0.15s",
                                    }}
                                         onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)" }}
                                         onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)" }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                                            <div style={{
                                                width: "44px", height: "44px", borderRadius: "12px",
                                                background: s.bg, display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Icon style={{ width: "22px", height: "22px", color: s.color }} />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "32px", fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: "4px" }}>
                                            {s.value}
                                        </div>
                                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "2px" }}>{s.title}</div>
                                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>{s.sub}</div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* ── QUICK ACTIONS + RECENT RDV ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>

                            {/* Recent RDV table */}
                            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>Derniers Rendez-vous</h2>
                                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>Activité récente</p>
                                    </div>
                                    <button onClick={() => router.push("/dashboard/rendez-vous")} style={{
                                        display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
                                        borderRadius: "8px", border: "1px solid #e5e7eb", background: "white",
                                        fontSize: "12px", color: "#6b7280", cursor: "pointer", fontWeight: 500
                                    }}>
                                        Voir tout <ArrowRight style={{ width: "12px", height: "12px" }} />
                                    </button>
                                </div>

                                {recentRdv.length === 0 ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                                        Aucun rendez-vous
                                    </div>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                        <tr style={{ background: "#f9fafb" }}>
                                            {["Patient", "Médecin", "Date", "Heure", "Statut", "Actions"].map(h => (
                                                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentRdv.map((rdv, i) => {
                                            const s = STATUT_COLORS[rdv.statut] ?? { bg: "#f3f4f6", color: "#6b7280", label: rdv.statut }
                                            return (
                                                <tr key={rdv.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#374151", fontWeight: 500 }}>
                                                        {getPatientName(rdv.patientId)}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>
                                                        {getMedecinName(rdv.medecinId)}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>
                                                        {formatDate(rdv.dateHeure)}
                                                    </td>
                                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>
                                                        {formatTime(rdv.dateHeure)}
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                              <span style={{
                                  padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                                  background: s.bg, color: s.color
                              }}>{s.label}</span>
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <div style={{ display: "flex", gap: "8px" }}>
                                                            {[
                                                                { icon: Eye, color: "#3b82f6" },
                                                                { icon: Check, color: "#059669" },
                                                                { icon: Trash2, color: "#ef4444" },
                                                            ].map(({ icon: Icon, color }, j) => (
                                                                <button key={j} style={{
                                                                    width: "28px", height: "28px", borderRadius: "8px",
                                                                    border: "none", background: "#f3f4f6", cursor: "pointer",
                                                                    display: "flex", alignItems: "center", justifyContent: "center"
                                                                }}>
                                                                    <Icon style={{ width: "13px", height: "13px", color }} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Quick actions */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>Accès Rapide</h2>
                                {quickActions.map((a) => {
                                    const Icon = a.icon
                                    return (
                                        <button key={a.title} onClick={() => router.push(a.href)} style={{
                                            display: "flex", alignItems: "center", gap: "14px",
                                            padding: "16px 18px", borderRadius: "14px",
                                            background: "white", border: "1px solid #e5e7eb",
                                            cursor: "pointer", transition: "all 0.15s", textAlign: "left"
                                        }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = a.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${a.color}20` }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
                                        >
                                            <div style={{
                                                width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                                                background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Icon style={{ width: "20px", height: "20px", color: a.color }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>{a.title}</p>
                                            </div>
                                            <ArrowRight style={{ width: "16px", height: "16px", color: "#d1d5db" }} />
                                        </button>
                                    )
                                })}

                                {/* Mini stats */}
                                <div style={{
                                    marginTop: "8px", padding: "18px", borderRadius: "14px",
                                    background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", color: "white"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                        <Clock style={{ width: "16px", height: "16px" }} />
                                        <span style={{ fontSize: "13px", fontWeight: 600 }}>Aujourd'hui</span>
                                    </div>
                                    <div style={{ fontSize: "32px", fontWeight: 700, marginBottom: "4px" }}>
                                        {stats?.rdvAujourdhui ?? 0}
                                    </div>
                                    <div style={{ fontSize: "12px", opacity: 0.8 }}>rendez-vous planifiés</div>
                                </div>
                            </div>
                        </div>

                        {/* ── BOTTOM: Users summary ── */}
                        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>Utilisateurs récents</h2>
                                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>{allUsers.length} membres au total</p>
                                </div>
                                <button onClick={() => router.push("/dashboard/utilisateurs")} style={{
                                    display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
                                    borderRadius: "8px", background: "#1d4ed8", border: "none",
                                    fontSize: "12px", color: "white", cursor: "pointer", fontWeight: 500
                                }}>
                                    <UserPlus style={{ width: "13px", height: "13px" }} /> Gérer
                                </button>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ background: "#f9fafb" }}>
                                    {["Nom", "Email", "Rôle", "Téléphone"].map(h => (
                                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {allUsers.slice(0, 4).map((u) => {
                                    const roleStyle = u.role === "ADMIN"
                                        ? { bg: "#dbeafe", color: "#1d4ed8" }
                                        : u.role === "MEDECIN"
                                            ? { bg: "#dcfce7", color: "#15803d" }
                                            : { bg: "#f3e8ff", color: "#7e22ce" }
                                    return (
                                        <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "14px 20px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <div style={{
                                                        width: "34px", height: "34px", borderRadius: "50%",
                                                        background: roleStyle.bg, color: roleStyle.color,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: "12px", fontWeight: 700
                                                    }}>
                                                        {`${u.prenom?.[0] ?? ""}${u.nom?.[0] ?? ""}`.toUpperCase()}
                                                    </div>
                                                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                              {u.prenom} {u.nom}
                            </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6b7280" }}>{u.email}</td>
                                            <td style={{ padding: "14px 20px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: roleStyle.bg, color: roleStyle.color }}>
                            {u.role === "ADMIN" ? "Admin" : u.role === "MEDECIN" ? "Médecin" : "Patient"}
                          </span>
                                            </td>
                                            <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6b7280" }}>{u.telephone || "—"}</td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
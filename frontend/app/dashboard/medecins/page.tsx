"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usersApi } from "@/lib/api-client"
import type { Medecin } from "@/lib/api-client"
import { BookAppointmentDialog } from "@/components/book-appointment-dialog"
import { Search, MapPin, Phone, Star, Calendar, User, Loader2, AlertCircle, RefreshCw, Filter } from "lucide-react"

export default function MedecinsPage() {
    const router = useRouter()
    const [medecins, setMedecins] = useState<Medecin[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [filterSpec, setFilterSpec] = useState<string | null>(null)
    const [selected, setSelected] = useState<Medecin | null>(null)
    const [bookOpen, setBookOpen] = useState(false)

    const fetchMedecins = async () => {
        setLoading(true); setError("")
        try {
            setMedecins(await usersApi.getMedecins())
        } catch { setError("Impossible de charger la liste des médecins.") }
        finally { setLoading(false) }
    }
    useEffect(() => { fetchMedecins() }, [])

    const specs = Array.from(new Set(medecins.map(m => m.specialite)))
    const filtered = medecins.filter(m => {
        const q = search.toLowerCase()
        return (
            (!q || m.nom.toLowerCase().includes(q) || m.prenom.toLowerCase().includes(q) || m.specialite.toLowerCase().includes(q)) &&
            (!filterSpec || m.specialite === filterSpec)
        )
    })

    const fmtPrice = (p?: number) => p ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(p) : "Non spécifié"

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1d4ed8" }} className="animate-spin" />
            <span style={{ color: "#6b7280", fontSize: "14px" }}>Chargement des médecins...</span>
        </div>
    )

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Trouver un Médecin</h1>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Recherchez et prenez rendez-vous avec nos médecins qualifiés</p>
            </div>

            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderRadius: "12px", background: "#fef2f2", color: "#dc2626", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "20px" }}>
                    <AlertCircle style={{ width: "16px", height: "16px" }} />
                    {error}
                    <button onClick={fetchMedecins} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "12px", fontWeight: 600 }}>
                        <RefreshCw style={{ width: "13px", height: "13px" }} /> Réessayer
                    </button>
                </div>
            )}

            {/* Search + filters */}
            <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                        <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#9ca3af" }} />
                        <input
                            placeholder="Rechercher par nom ou spécialité..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", paddingTop: "11px", paddingBottom: "11px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <Filter style={{ width: "15px", height: "15px", color: "#9ca3af" }} />
                        {[null, ...specs].map((s) => (
                            <button key={String(s)} onClick={() => setFilterSpec(s)}
                                    style={{ padding: "8px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid", transition: "all 0.15s", borderColor: filterSpec === s ? "#1d4ed8" : "#e5e7eb", background: filterSpec === s ? "#1d4ed8" : "white", color: filterSpec === s ? "white" : "#6b7280" }}>
                                {s ?? "Tous"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
                {filtered.length} médecin{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {filtered.map(m => (
                    <div key={m.id} style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", transition: "all 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                         onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(29,78,216,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe" }}
                         onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb" }}
                    >
                        <div style={{ padding: "20px" }}>
                            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <User style={{ width: "24px", height: "24px", color: "#1d4ed8" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>Dr. {m.prenom} {m.nom}</p>
                                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#eff6ff", color: "#1d4ed8" }}>{m.specialite}</span>
                                    <div style={{ display: "flex", gap: "2px", marginTop: "6px" }}>
                                        {[1,2,3,4].map(i => <span key={i} style={{ color: "#fbbf24", fontSize: "12px" }}>★</span>)}
                                        <span style={{ color: "#d1d5db", fontSize: "12px" }}>★</span>
                                        <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "4px" }}>4.0</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ margin: "14px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                                {[
                                    { icon: MapPin, text: m.adresseCabinet },
                                    { icon: Phone, text: m.telephone },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Icon style={{ width: "13px", height: "13px", color: "#9ca3af", flexShrink: 0 }} />
                                        <span style={{ fontSize: "12px", color: "#6b7280" }}>{text}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: "12px", borderRadius: "10px", background: "#f9fafb", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "12px", color: "#6b7280" }}>Tarif consultation</span>
                                <span style={{ fontSize: "15px", fontWeight: 700, color: "#1d4ed8" }}>{fmtPrice(m.tarifConsultation)}</span>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => { setSelected(m); setBookOpen(true) }} style={{
                                    flex: 1, padding: "10px", borderRadius: "10px",
                                    background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white",
                                    border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                                }}>
                                    <Calendar style={{ width: "14px", height: "14px" }} /> Prendre RDV
                                </button>
                                <button onClick={() => router.push(`/medecin/${m.id}`)} style={{
                                    flex: 1, padding: "10px", borderRadius: "10px",
                                    background: "white", color: "#374151",
                                    border: "1px solid #e5e7eb", cursor: "pointer", fontSize: "13px", fontWeight: 500,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                                }}>
                                    <User style={{ width: "14px", height: "14px" }} /> Voir profil
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
                    <Search style={{ width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 16px" }} />
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Aucun médecin trouvé</p>
                    <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 20px" }}>Modifiez vos critères de recherche</p>
                    <button onClick={() => { setSearch(""); setFilterSpec(null) }} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", color: "#374151", cursor: "pointer", fontSize: "13px" }}>
                        Réinitialiser
                    </button>
                </div>
            )}

            {selected && (
                <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} medecin={selected as any} onBook={() => {}} />
            )}
        </div>
    )
}
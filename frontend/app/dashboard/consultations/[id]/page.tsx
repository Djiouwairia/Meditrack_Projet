"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { consultationsApi, usersApi } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Loader2, AlertCircle, Edit, Printer, User, Stethoscope, Calendar, FileText, Activity, BookOpen } from "lucide-react"

export default function ConsultationDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const id = parseInt(params.id as string)

    const [consultation, setConsultation] = useState<any>(null)
    const [patient, setPatient] = useState<any>(null)
    const [medecin, setMedecin] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const load = async () => {
            if (!id) return
            setLoading(true); setError("")
            try {
                const c = await consultationsApi.getById(id)
                setConsultation(c)
                const [p, m] = await Promise.all([
                    usersApi.getPatientById(c.patientId),
                    usersApi.getMedecinById(c.medecinId)
                ])
                setPatient(p); setMedecin(m)
            } catch { setError("Impossible de charger la consultation.") }
            finally { setLoading(false) }
        }
        load()
    }, [id])

    const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#1d4ed8" }} className="animate-spin" />
            <span style={{ color: "#6b7280", fontSize: "14px" }}>Chargement de la consultation...</span>
        </div>
    )

    if (error || !consultation) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
            <AlertCircle style={{ width: "40px", height: "40px", color: "#ef4444" }} />
            <p style={{ color: "#ef4444", fontSize: "14px" }}>{error || "Consultation introuvable"}</p>
            <button onClick={() => router.back()} style={{ padding: "10px 20px", borderRadius: "10px", background: "#1d4ed8", color: "white", border: "none", cursor: "pointer", fontSize: "13px" }}>
                Retour
            </button>
        </div>
    )

    const Section = ({ icon: Icon, title, children, color = "#1d4ed8" }: any) => (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: "16px", height: "16px", color }} />
                </div>
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: 0 }}>{title}</h2>
            </div>
            <div style={{ padding: "20px 24px" }}>{children}</div>
        </div>
    )

    const Field = ({ label, value }: { label: string; value?: string }) => (
        <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>{label}</p>
            <p style={{ fontSize: "14px", color: value ? "#111827" : "#d1d5db", margin: 0, fontStyle: value ? "normal" : "italic" }}>{value || "Non renseigné"}</p>
        </div>
    )

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: "900px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button onClick={() => router.back()} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ArrowLeft style={{ width: "16px", height: "16px", color: "#374151" }} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>Détail de la Consultation</h1>
                        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                            {fmtDate(consultation.date)}
                        </p>
                    </div>
                </div>
                {user?.role === "MEDECIN" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "13px", color: "#374151", fontWeight: 500 }}>
                            <Printer style={{ width: "14px", height: "14px" }} /> Imprimer
                        </button>
                        <button onClick={() => router.push(`/dashboard/consultations/${id}/edit`)} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "10px", background: "#1d4ed8", border: "none", cursor: "pointer", fontSize: "13px", color: "white", fontWeight: 600 }}>
                            <Edit style={{ width: "14px", height: "14px" }} /> Modifier
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Patient */}
                <Section icon={User} title="Patient" color="#7c3aed">
                    {patient ? (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>
                                    {`${patient.prenom?.[0]}${patient.nom?.[0]}`.toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>{patient.prenom} {patient.nom}</p>
                                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{patient.email}</p>
                                </div>
                            </div>
                            <Field label="Téléphone" value={patient.telephone} />
                            <Field label="Date de naissance" value={patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR") : undefined} />
                            {patient.groupeSanguin && <Field label="Groupe sanguin" value={patient.groupeSanguin} />}
                        </div>
                    ) : <p style={{ color: "#9ca3af", fontSize: "13px" }}>Patient #{consultation.patientId}</p>}
                </Section>

                {/* Médecin */}
                <Section icon={Stethoscope} title="Médecin traitant" color="#059669">
                    {medecin ? (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#f0fdf4", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>
                                    {`${medecin.prenom?.[0]}${medecin.nom?.[0]}`.toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>Dr. {medecin.prenom} {medecin.nom}</p>
                                    <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#f0fdf4", color: "#059669" }}>{medecin.specialite}</span>
                                </div>
                            </div>
                            <Field label="Email" value={medecin.email} />
                            <Field label="Cabinet" value={medecin.adresseCabinet} />
                        </div>
                    ) : <p style={{ color: "#9ca3af", fontSize: "13px" }}>Médecin #{consultation.medecinId}</p>}
                </Section>
            </div>

            {/* Medical info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Section icon={Calendar} title="Motif & Examen" color="#1d4ed8">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <Field label="Motif de consultation" value={consultation.motif} />
                        <Field label="Examen clinique" value={consultation.examenClinique} />
                    </div>
                </Section>

                <Section icon={Activity} title="Diagnostic" color="#ea580c">
                    <Field label="Diagnostic établi" value={consultation.diagnostic} />
                </Section>

                {consultation.notesPrivees && (
                    <Section icon={BookOpen} title="Notes privées" color="#6b7280">
                        <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: 1.6, padding: "12px 16px", background: "#f9fafb", borderRadius: "10px", borderLeft: "3px solid #e5e7eb" }}>
                            {consultation.notesPrivees}
                        </p>
                    </Section>
                )}
            </div>
        </div>
    )
}
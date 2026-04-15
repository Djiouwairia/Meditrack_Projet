"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Eye, EyeOff, Loader2, HeartPulse, CalendarCheck, BarChart2, Users, Clock } from "lucide-react"

export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const { authenticate, isLoading } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            await authenticate({ email, password })
        } catch {
            setError("Email ou mot de passe incorrect.")
        }
    }

    const features = [
        { icon: CalendarCheck, label: "Créer des rendez-vous" },
        { icon: BarChart2, label: "Analyser les résultats" },
        { icon: Users, label: "Gérer les utilisateurs" },
        { icon: Clock, label: "Suivez en temps réel" },
    ]

    // Votre dégradé bleu ciel personnalisé
    const skyGradient = "linear-gradient(145deg, #7ad5f9 0%, #38bdf8 50%, #06b6d4 100%)";

    return (
        <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* LEFT — Form */}
            <div style={{
                width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column",
                justifyContent: "center", padding: "48px 56px", background: "#ffffff"
            }}>
                {/* Logo avec le nouveau dégradé */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
                    <div style={{
                        width: "44px", height: "44px", borderRadius: "12px",
                        background: skyGradient,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <HeartPulse style={{ width: "22px", height: "22px", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.5px" }}>
                        Medi<span style={{ color: "#38bdf8" }}>Track</span>
                    </span>
                </div>

                {error && (
                    <div style={{
                        marginBottom: "20px", padding: "12px 16px", borderRadius: "10px",
                        background: "#fef2f2", color: "#dc2626", fontSize: "13px",
                        border: "1px solid #fecaca"
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                            Email ou numéro de téléphone
                        </label>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
                                </svg>
                            </span>
                            <input
                                type="email" placeholder="votre.email@exemple.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} required
                                style={{
                                    width: "100%", paddingLeft: "40px", paddingRight: "16px",
                                    paddingTop: "13px", paddingBottom: "13px",
                                    borderRadius: "12px", fontSize: "14px", outline: "none",
                                    background: "#f0f9ff", border: "2px solid transparent",
                                    boxSizing: "border-box", transition: "all 0.2s"
                                }}
                                onFocus={(e) => { e.target.style.borderColor = "#38bdf8"; e.target.style.background = "#fff" }}
                                onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "#f0f9ff" }}
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>Mot de passe</label>
                            <a href="/forgot-password" style={{ fontSize: "12px", color: "#38bdf8", textDecoration: "none" }}>
                                Mot de passe oublié ?
                            </a>
                        </div>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"} placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)} required
                                style={{
                                    width: "100%", paddingLeft: "40px", paddingRight: "48px",
                                    paddingTop: "13px", paddingBottom: "13px",
                                    borderRadius: "12px", fontSize: "14px", outline: "none",
                                    background: "#f0f9ff", border: "2px solid transparent",
                                    boxSizing: "border-box", transition: "all 0.2s"
                                }}
                                onFocus={(e) => { e.target.style.borderColor = "#38bdf8"; e.target.style.background = "#fff" }}
                                onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "#f0f9ff" }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                                {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                            </button>
                        </div>
                    </div>

                    {/* Bouton avec le dégradé bleu ciel */}
                    <button type="submit" disabled={isLoading} style={{
                        width: "100%", padding: "14px", borderRadius: "12px",
                        background: skyGradient,
                        color: "white", fontWeight: 600, fontSize: "15px",
                        border: "none", cursor: isLoading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        opacity: isLoading ? 0.7 : 1,
                        boxShadow: "0 4px 12px rgba(56, 189, 248, 0.25)"
                    }}>
                        {isLoading ? <><Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> Connexion...</> : "Connexion"}
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#9ca3af", fontSize: "11px" }}>
                        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                        OU CONTINUER AVEC
                        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        {[
                            { label: "G", color: "#ea4335" },
                            { label: "in", color: "#0a66c2" },
                            { label: "f", color: "#1877f2" },
                        ].map(({ label, color }, i) => (
                            <button key={i} type="button" style={{
                                flex: 1, padding: "10px", borderRadius: "12px",
                                border: "1px solid #e5e7eb", background: "white",
                                color, fontWeight: 700, fontSize: "14px", cursor: "pointer"
                            }}>{label}</button>
                        ))}
                    </div>
                </form>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "24px" }}>
                    Nouveau patient ?{" "}
                    <a href="/inscription" style={{ color: "#38bdf8", fontWeight: 600, textDecoration: "none" }}>
                        Créer un compte
                    </a>
                </p>
            </div>

            {/* RIGHT — Blue panel (Sky Blue) */}
            <div style={{
                flex: 1,
                display: "flex",
                position: "relative",
                overflow: "hidden",
                background: skyGradient,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column"
            }} className="hidden lg:flex">
                {/* Cercles décoratifs */}
                {[
                    { s: 500, top: "-15%", right: "-10%", op: 0.1 },
                    { s: 350, bottom: "-12%", left: "-8%", op: 0.1 },
                    { s: 220, top: "35%", left: "3%", op: 0.08 },
                ].map((c, i) => (
                    <div key={i} style={{
                        position: "absolute", width: c.s, height: c.s, borderRadius: "50%",
                        background: "white", opacity: c.op,
                        top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                    }} />
                ))}

                <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 40px" }}>
                    <div style={{
                        width: "76px", height: "76px", borderRadius: "20px", margin: "0 auto 24px",
                        background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <HeartPulse style={{ width: "38px", height: "38px", color: "white" }} />
                    </div>
                    <h2 style={{ fontSize: "30px", fontWeight: 700, color: "white", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
                        MediTrack Pro
                    </h2>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", maxWidth: "280px", margin: "0 auto 56px", lineHeight: 1.6 }}>
                        Système de gestion hospitalière moderne, complet et sécurisé
                    </p>

                    {/* Circular icons grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px 80px" }}>
                        {features.map(({ icon: Icon, label }) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "80px", height: "80px", borderRadius: "50%",
                                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                                    backdropFilter: "blur(10px)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <Icon style={{ width: "32px", height: "32px", color: "white" }} />
                                </div>
                                <p style={{ color: "white", fontSize: "13px", fontWeight: 500, lineHeight: 1.3, maxWidth: "110px" }}>
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
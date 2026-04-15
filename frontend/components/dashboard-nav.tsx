"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
    Calendar, Users, FileText, Settings, LogOut, LayoutDashboard,
    Stethoscope, UserCircle, ClipboardList, Clock, ChevronRight, HeartPulse,
} from "lucide-react"

export function DashboardNav() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()

    // NOTRE BLEU : Le dégradé bleu ciel MediTrack exact
    const skyGradient = "linear-gradient(145deg, #7ad5f9 0%, #38bdf8 50%, #06b6d4 100%)";
    const primaryBlue = "#38bdf8"; // Le bleu ciel de base pour les accents

    const handleLogout = () => { logout(); router.push("/login") }

    const mainNavItems = () => {
        switch (user?.role) {
            case "ADMIN": return [
                { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
                { href: "/dashboard/utilisateurs", label: "Utilisateurs", icon: Users },
                { href: "/dashboard/rendez-vous", label: "Rendez-vous", icon: Calendar },
                { href: "/dashboard/consultations", label: "Consultations", icon: ClipboardList },
                { href: "/dashboard/statistiques", label: "Statistiques", icon: FileText },
            ]
            case "MEDECIN": return [
                { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
                { href: "/dashboard/mes-patients", label: "Mes Patients", icon: Users },
                { href: "/dashboard/rendez-vous", label: "Rendez-vous", icon: Calendar },
                { href: "/dashboard/consultations", label: "Consultations", icon: ClipboardList },
                { href: "/dashboard/disponibilites", label: "Disponibilités", icon: Clock },
            ]
            case "PATIENT": return [
                { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
                { href: "/dashboard/mes-rendez-vous", label: "Mes Rendez-vous", icon: Calendar },
                { href: "/dashboard/dossier-medical", label: "Dossier Médical", icon: FileText },
                { href: "/dashboard/medecins", label: "Trouver un Médecin", icon: Stethoscope },
            ]
            default: return []
        }
    }

    const settingsItems = () => [
        { href: "/dashboard/profil", label: "Mon Profil", icon: UserCircle },
        { href: "/dashboard/parametres", label: "Paramètres", icon: Settings },
    ]

    const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
        const isActive = pathname === href
        return (
            <Link href={href} style={{ textDecoration: "none" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "11px 16px", borderRadius: "12px", cursor: "pointer",
                    transition: "all 0.15s",
                    // Surbrillance blanche semi-transparente pour l'élément actif
                    background: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
                    color: "white",
                    fontWeight: isActive ? 600 : 400,
                    opacity: isActive ? 1 : 0.9,
                }}
                     onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)" }}
                     onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                    <Icon style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", flex: 1 }}>{label}</span>
                    {isActive && <ChevronRight style={{ width: "14px", height: "14px" }} />}
                </div>
            </Link>
        )
    }

    const getInitials = () => `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase()
    const getRoleLabel = () => user?.role === "ADMIN" ? "Administrateur" : user?.role === "MEDECIN" ? "Médecin" : "Patient"

    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, height: "100vh", width: "256px",
            background: skyGradient, // Fond dégradé ciel
            display: "flex", flexDirection: "column", zIndex: 50,
            boxShadow: "4px 0 15px rgba(0,0,0,0.05)",
            border: "none" // On enlève toute bordure sombre potentielle
        }}>
            {/* Logo Section */}
            <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <HeartPulse style={{ width: "20px", height: "20px", color: "white" }} />
                    </div>
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "white", lineHeight: 1 }}>MediTrack</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", marginTop: "2px", fontWeight: 500 }}>Pro</div>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 4px", marginBottom: "8px" }}>
                    Menu Principal
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {mainNavItems().map((item) => <NavItem key={item.href} {...item} />)}
                </div>

                <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 4px", margin: "24px 0 8px" }}>
                    Paramètres
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {settingsItems().map((item) => <NavItem key={item.href} {...item} />)}
                </div>
            </div>

            {/* Profile Section */}
            <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px", borderRadius: "12px", marginBottom: "12px",
                    background: "rgba(255,255,255,0.15)"
                }}>
                    <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "white", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 800, color: primaryBlue, // Texte de l'avatar en bleu ciel
                        flexShrink: 0
                    }}>{getInitials()}</div>
                    <div style={{ overflow: "hidden" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "white", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user?.prenom} {user?.nom}
                        </p>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", margin: 0 }}>{getRoleLabel()}</p>
                    </div>
                </div>
                <button onClick={handleLogout} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.3)",
                    background: "transparent", color: "white", fontSize: "13px",
                    cursor: "pointer", transition: "all 0.15s", fontWeight: 500
                }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.3)" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                    <LogOut style={{ width: "15px", height: "15px" }} />
                    Déconnexion
                </button>
            </div>
        </nav>
    )
}
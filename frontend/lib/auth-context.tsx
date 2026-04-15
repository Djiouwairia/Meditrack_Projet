"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
// Importe les DTOs et apiClient corrigés
import { apiClient, type UserDTO, type LoginRequest, type LoginResponse } from "@/lib/api-client"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// --- 1. Définitions de types pour le contexte ---
interface AuthContextType {
    user: UserDTO | null
    isAuthenticated: boolean
    isLoading: boolean
    authenticate: (credentials: LoginRequest) => Promise<void>
    // CORRECTION: userId est de type number | null
    userId: number | null
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// --- 2. Composant Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    // CORRECTION: localUserId est de type number | null
    const [localUserId, setLocalUserId] = useState<number | null>(null);

    // Fonction interne pour gérer la mise à jour de l'état après succès de la connexion/vérification
    const handleLoginSuccess = (userDto: UserDTO) => {
        // L'ID est un nombre (number), mais localStorage ne stocke que des chaînes (string_)
        localStorage.setItem("meditrack_user_id", userDto.id.toString());
        setLocalUserId(userDto.id);
        setUser(userDto);

        // Rediriger si on est sur la page de login après succès
        if (pathname === '/login' || pathname === '/register') {
            router.push("/dashboard");
        }
    }

    // --- 3. Effet Lecture de l'ID stocké au démarrage ---
    useEffect(() => {
        const storedId = localStorage.getItem("meditrack_user_id");
        if (storedId) {
            // CORRECTION: parseInt(string, 10) retourne un number
            const id = parseInt(storedId, 10);
            if (!isNaN(id)) {
                setLocalUserId(id);
            } else {
                localStorage.removeItem("meditrack_user_id");
                setIsLoading(false);
            }
        } else {
            setIsLoading(false); // Si rien n'est stocké, on arrête le chargement immédiatement
        }
    }, []);


    // --- 4. Effet Vérification de l'authentification (si un ID est disponible) ---
    useEffect(() => {
        // Ne rien faire si l'ID est null OU si on est déjà en train de charger (pour éviter les boucles)
        // La condition `user === null` est nécessaire pour que `checkAuth` s'exécute une seule fois après la lecture de
        if (localUserId === null || (user !== null && !isLoading)) {
            // Si localUserId est null et on est sur une page protégée, on redirige
            if (localUserId === null && pathname.startsWith('/dashboard')) {
                router.push('/login');
            }
            return;
        }

        const checkAuth = async () => {
            setIsLoading(true); // On met à jour isLoading ici car on a un localUserId valide
            try {
                // Backend: /auth/profile/{id} attend un Number (Long Java)
                const response = await apiClient.get<UserDTO>(`/auth/profile/${localUserId}`);

                // Si la requête réussit, response est le UserDTO
                setUser(response);
                console.log("Auth check successful for user ID:", localUserId);

            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null);
                localStorage.removeItem("meditrack_user_id");
                setLocalUserId(null);

                // Rediriger si l'utilisateur est déconnecté et essaie d'accéder au dashboard
                if (pathname.startsWith('/dashboard')) {
                    router.push('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        // Exécuter la vérification seulement si un ID est présent et qu'on n'a pas encore de lutilisater
        if (localUserId !== null && user === null) {
            checkAuth();
        }
    }, [localUserId, pathname, router, user]); // Suppression de 'isLoading' des dépendances pour éviter un effet non voulu

    // --- 5. Fonction d'authentification publique (appel de l'API) ---
    const authenticate = async (credentials: LoginRequest) => {
        setIsLoading(true);
        try {
            // Appel à l'API de connexion, retourne LoginResponse (qui hérite de UserDTO)
            const response = await apiClient.post<LoginResponse>("/auth/login", credentials);

            // Pas de cast nécessaire puisque LoginResponse est structurellement compatible avec UserDTO
            const userDto: UserDTO = response;

            handleLoginSuccess(userDto);

        } catch (error) {
            console.error("Échec de la connexion (API) :", error);
            // Relancer l'erreur pour que les composants UI puissent afficher le message
            throw error;
        } finally {
            setIsLoading(false);
        }
    }


    // --- 6. Fonction de déconnexion ---
    const logout = () => {
        setUser(null)
        localStorage.removeItem("meditrack_user_id");
        setLocalUserId(null);
        router.push("/login")
    }

    const isAuthenticated = user !== null

    // Afficher un écran de chargement tant que l'état d'authentification n'est pas connu
    if (isLoading && localUserId !== null && user === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-700">Vérification de la session...</span>
            </div>
        )
    }

    // --- 7. Rendu du Provider ---
    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                authenticate,
                logout,
                userId: user?.id ?? null
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// --- 8. Hook d'utilisation ---
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider")
    }
    return context
}
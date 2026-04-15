"use client"

import React, { useEffect, useState } from "react"
import { Users, Loader2, Search, AlertCircle, Plus, Eye, Edit, Trash2, Stethoscope } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from '@/lib/api-client'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type UserRole = 'ADMIN' | 'MEDECIN' | 'PATIENT';

interface UserDTO {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    role: UserRole;
    status?: string;
    createdAt?: string;
    // Champs spécifiques pour les médecins
    specialite?: string;
    numeroIdentification?: string;
    adresseCabinet?: string;
    tarifConsultation?: number;
    // Champs spécifiques pour les administrateurs
    departement?: string;
    // Champs spécifiques pour les patients
    dateNaissance?: string;
    numeroSecuriteSociale?: string;
    adresse?: string;
    medecinTraitantId?: number;
    groupeSanguin?: string;
    allergies?: string;
}

interface CreateUserRequest {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: string;
    role: UserRole;
    specialite?: string;
    numeroIdentification?: string;
    adresseCabinet?: string;
    tarifConsultation?: number;
    departement?: string;
    // Champs spécifiques pour les patients
    dateNaissance?: string;
    numeroSecuriteSociale?: string;
    adresse?: string;
    medecinTraitantId?: number;
    groupeSanguin?: string;
    allergies?: string;
}

interface Medecin {
    id: number;
    nom: string;
    prenom: string;
    specialite: string;
    email: string;
}

export default function UtilisateursPage() {
    const { user, isLoading: isAuthLoading } = useAuth()
    const [users, setUsers] = useState<UserDTO[]>([])
    const [medecins, setMedecins] = useState<Medecin[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadingMedecins, setLoadingMedecins] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [createSuccess, setCreateSuccess] = useState<string | null>(null)

    // États pour la gestion des actions
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [newUser, setNewUser] = useState<CreateUserRequest>({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: '',
        role: 'PATIENT',
        specialite: '',
        numeroIdentification: '',
        adresseCabinet: '',
        tarifConsultation: undefined,
        departement: '',
        dateNaissance: '',
        numeroSecuriteSociale: '',
        adresse: '',
        medecinTraitantId: undefined,
        groupeSanguin: '',
        allergies: ''
    })

    const fetchUsers = async () => {
        setIsLoading(true)
        setError(null)

        const endpoint = `/admin/users`

        try {
            console.log('🔄 Chargement des utilisateurs...')
            const data = await apiClient.get<UserDTO[]>(endpoint)
            setUsers(data)
            console.log('✅ Utilisateurs chargés:', data.length)
        } catch (err: any) {
            console.error('❌ Erreur chargement utilisateurs:', err)
            setError(`Échec du chargement des utilisateurs: ${err.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMedecins = async () => {
        setLoadingMedecins(true)
        try {
            console.log('🔄 Chargement des médecins...')
            const data = await apiClient.get<Medecin[]>('/api/medecins')
            setMedecins(data)
            console.log('✅ Médecins chargés:', data.length)
        } catch (err: any) {
            console.error('❌ Erreur chargement médecins:', err)
        } finally {
            setLoadingMedecins(false)
        }
    }

    const createUser = async (userData: CreateUserRequest) => {
        setIsCreating(true)
        setCreateError(null)
        setCreateSuccess(null)

        try {
            console.log('🔄 Création utilisateur:', userData)
            const endpoint = `/admin/users`
            const response = await apiClient.post<UserDTO>(endpoint, userData)
            console.log('✅ Utilisateur créé:', response)
            setCreateSuccess("Utilisateur créé avec succès!")
            setIsAddModalOpen(false)
            setNewUser({
                email: '',
                password: '',
                nom: '',
                prenom: '',
                telephone: '',
                role: 'PATIENT',
                specialite: '',
                numeroIdentification: '',
                adresseCabinet: '',
                tarifConsultation: undefined,
                departement: '',
                dateNaissance: '',
                numeroSecuriteSociale: '',
                adresse: '',
                medecinTraitantId: undefined,
                groupeSanguin: '',
                allergies: ''
            })
            fetchUsers()
        } catch (err: any) {
            console.error('❌ Erreur création utilisateur:', err)
            setCreateError(err.message || "Erreur lors de la création de l'utilisateur")
        } finally {
            setIsCreating(false)
        }
    }

    const updateUser = async (userData: CreateUserRequest) => {
        if (!selectedUser) return

        setIsCreating(true)
        setCreateError(null)
        setCreateSuccess(null)

        try {
            console.log('🔄 Mise à jour utilisateur ID:', selectedUser.id, userData)

            // Créer un nouvel objet sans le mot de passe s'il est vide
            const dataToSend = { ...userData }
            if (!dataToSend.password || dataToSend.password.trim() === '') {
                const { password, ...rest } = dataToSend
                await apiClient.put<UserDTO>(`/admin/users/${selectedUser.id}`, rest)
            } else {
                await apiClient.put<UserDTO>(`/admin/users/${selectedUser.id}`, dataToSend)
            }

            console.log('✅ Utilisateur mis à jour')
            setCreateSuccess("Utilisateur modifié avec succès!")
            setIsEditModalOpen(false)
            setSelectedUser(null)
            fetchUsers()
        } catch (err: any) {
            console.error('❌ Erreur mise à jour utilisateur:', err)
            setCreateError(err.message || "Erreur lors de la modification de l'utilisateur")
        } finally {
            setIsCreating(false)
        }
    }

    const deleteUser = async () => {
        if (!selectedUser) return

        setIsDeleting(true)
        setCreateError(null)
        try {
            console.log('🗑️ Suppression utilisateur ID:', selectedUser.id)
            const endpoint = `/admin/users/${selectedUser.id}`
            await apiClient.delete(endpoint)
            console.log('✅ Utilisateur supprimé')
            setCreateSuccess("Utilisateur supprimé avec succès!")
            setIsDeleteModalOpen(false)
            setSelectedUser(null)
            fetchUsers()
        } catch (err: any) {
            console.error('❌ Erreur suppression utilisateur:', err)
            setCreateError(err.message || "Erreur lors de la suppression de l'utilisateur")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createUser(newUser)
    }

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateUser(newUser)
    }

    const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
        setNewUser(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleNumberInputChange = (field: keyof CreateUserRequest, value: string) => {
        let processedValue: number | undefined = value === '' ? undefined : Number.parseFloat(value)

        // Pour medecinTraitantId, utiliser parseInt
        if (field === 'medecinTraitantId') {
            processedValue = value === '' ? undefined : Number.parseInt(value)
        }

        setNewUser(prev => ({
            ...prev,
            [field]: processedValue
        }))
    }

    const handleViewUser = (user: UserDTO) => {
        setSelectedUser(user)
        setIsViewModalOpen(true)
    }

    const handleEditUser = (user: UserDTO) => {
        setSelectedUser(user)
        setNewUser({
            email: user.email,
            password: '', // On ne montre pas le mot de passe
            nom: user.nom,
            prenom: user.prenom,
            telephone: user.telephone,
            role: user.role,
            // Pré-remplir tous les champs spécifiques
            specialite: user.specialite || '',
            numeroIdentification: user.numeroIdentification || '',
            adresseCabinet: user.adresseCabinet || '',
            tarifConsultation: user.tarifConsultation,
            departement: user.departement || '',
            // Champs patients
            dateNaissance: user.dateNaissance || '',
            numeroSecuriteSociale: user.numeroSecuriteSociale || '',
            adresse: user.adresse || '',
            medecinTraitantId: user.medecinTraitantId,
            groupeSanguin: user.groupeSanguin || '',
            allergies: user.allergies || ''
        })
        setIsEditModalOpen(true)
    }

    const handleDeleteUser = (user: UserDTO) => {
        setSelectedUser(user)
        setIsDeleteModalOpen(true)
    }

    const clearMessages = () => {
        setCreateError(null)
        setCreateSuccess(null)
    }

    useEffect(() => {
        if (isAuthLoading) return
        if (user?.role === 'ADMIN') {
            fetchUsers()
            fetchMedecins()
        } else {
            setIsLoading(false)
            setError("Accès refusé. Seuls les Administrateurs peuvent voir cette liste. Veuillez vous connecter avec un compte ADMIN.")
            setUsers([])
        }
    }, [isAuthLoading, user])

    // Effacer les messages après 5 secondes
    useEffect(() => {
        if (createSuccess || createError) {
            const timer = setTimeout(() => {
                clearMessages()
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [createSuccess, createError])

    const filteredUsers = users.filter((user) =>
        `${user.prenom} ${user.nom} ${user.email} ${user.role} ${user.telephone}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    )

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'ADMIN': return <Badge variant="destructive">Admin</Badge>;
            case 'MEDECIN': return <Badge variant="default">Médecin</Badge>;
            case 'PATIENT': return <Badge variant="secondary">Patient</Badge>;
            default: return <Badge variant="outline">Inconnu</Badge>;
        }
    }

    const getMedecinName = (medecinId?: number) => {
        if (!medecinId) return 'Aucun'
        const medecin = medecins.find(m => m.id === medecinId)
        return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : `ID: ${medecinId}`
    }

    if (isAuthLoading || (user?.role === 'ADMIN' && isLoading)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                <span className="text-lg text-muted-foreground">Préparation de la liste...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-7 h-7 text-primary" /> Liste des Utilisateurs
                </h1>
                <Button
                    variant="default"
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter un utilisateur
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste de tous les comptes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, email ou rôle..."
                            className="pl-10 max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {createSuccess && (
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{createSuccess}</p>
                            </div>
                        </div>
                    )}

                    {createError && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{createError}</p>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
                            <span className="text-lg text-muted-foreground">Chargement des utilisateurs...</span>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Prénom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead className="text-center">Rôle</TableHead>
                                        <TableHead>Date Création</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.nom}</TableCell>
                                                <TableCell>{user.prenom}</TableCell>
                                                <TableCell className="text-sm">{user.email}</TableCell>
                                                <TableCell>{user.telephone}</TableCell>
                                                <TableCell className="text-center">
                                                    {getRoleBadge(user.role)}
                                                </TableCell>
                                                <TableCell className="text-sm min-w-[120px]">
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right min-w-[140px]">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewUser(user)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                {error ? "Veuillez vous connecter en tant qu'administrateur." : "Aucun utilisateur trouvé correspondant à votre recherche."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal d'ajout d'utilisateur */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ajouter un utilisateur</DialogTitle>
                        <DialogDescription>
                            Créez un nouveau compte utilisateur dans le système
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {createError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{createError}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom *</Label>
                                <Input
                                    id="prenom"
                                    value={newUser.prenom}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom *</Label>
                                <Input
                                    id="nom"
                                    value={newUser.nom}
                                    onChange={(e) => handleInputChange('nom', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telephone">Téléphone *</Label>
                            <Input
                                id="telephone"
                                value={newUser.telephone}
                                onChange={(e) => handleInputChange('telephone', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Rôle *</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value: UserRole) => handleInputChange('role', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PATIENT">Patient</SelectItem>
                                    <SelectItem value="MEDECIN">Médecin</SelectItem>
                                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newUser.role === 'MEDECIN' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="specialite">Spécialité *</Label>
                                    <Input
                                        id="specialite"
                                        value={newUser.specialite || ''}
                                        onChange={(e) => handleInputChange('specialite', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numeroIdentification">Numéro d'identification *</Label>
                                    <Input
                                        id="numeroIdentification"
                                        value={newUser.numeroIdentification || ''}
                                        onChange={(e) => handleInputChange('numeroIdentification', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adresseCabinet">Adresse du cabinet *</Label>
                                    <Input
                                        id="adresseCabinet"
                                        value={newUser.adresseCabinet || ''}
                                        onChange={(e) => handleInputChange('adresseCabinet', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tarifConsultation">Tarif consultation</Label>
                                    <Input
                                        id="tarifConsultation"
                                        type="number"
                                        step="0.01"
                                        value={newUser.tarifConsultation || ''}
                                        onChange={(e) => handleNumberInputChange('tarifConsultation', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {newUser.role === 'ADMIN' && (
                            <div className="space-y-2">
                                <Label htmlFor="departement">Département *</Label>
                                <Input
                                    id="departement"
                                    value={newUser.departement || ''}
                                    onChange={(e) => handleInputChange('departement', e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {newUser.role === 'PATIENT' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="dateNaissance">Date de Naissance</Label>
                                    <Input
                                        id="dateNaissance"
                                        type="date"
                                        value={newUser.dateNaissance || ''}
                                        onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numeroSecuriteSociale">Numéro Sécurité Sociale</Label>
                                    <Input
                                        id="numeroSecuriteSociale"
                                        value={newUser.numeroSecuriteSociale || ''}
                                        onChange={(e) => handleInputChange('numeroSecuriteSociale', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adresse">Adresse</Label>
                                    <Input
                                        id="adresse"
                                        value={newUser.adresse || ''}
                                        onChange={(e) => handleInputChange('adresse', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="groupeSanguin">Groupe Sanguin</Label>
                                    <Input
                                        id="groupeSanguin"
                                        value={newUser.groupeSanguin || ''}
                                        onChange={(e) => handleInputChange('groupeSanguin', e.target.value)}
                                        placeholder="Ex: A+"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Input
                                        id="allergies"
                                        value={newUser.allergies || ''}
                                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                                        placeholder="Séparées par des virgules"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="flex-1"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Création...
                                    </>
                                ) : (
                                    "Créer l'utilisateur"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de visualisation */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Détails de l'utilisateur</DialogTitle>
                        <DialogDescription>
                            Informations complètes de l'utilisateur sélectionné
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Prénom</Label>
                                    <p className="text-sm mt-1">{selectedUser.prenom}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Nom</Label>
                                    <p className="text-sm mt-1">{selectedUser.nom}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <p className="text-sm mt-1">{selectedUser.email}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Téléphone</Label>
                                <p className="text-sm mt-1">{selectedUser.telephone}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Rôle</Label>
                                <div className="mt-1">
                                    {getRoleBadge(selectedUser.role)}
                                </div>
                            </div>

                            {/* Champs spécifiques pour les médecins */}
                            {selectedUser.role === 'MEDECIN' && (
                                <>
                                    <div>
                                        <Label className="text-sm font-medium">Spécialité</Label>
                                        <p className="text-sm mt-1">{selectedUser.specialite || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Numéro d'identification</Label>
                                        <p className="text-sm mt-1">{selectedUser.numeroIdentification || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Adresse du cabinet</Label>
                                        <p className="text-sm mt-1">{selectedUser.adresseCabinet || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Tarif consultation</Label>
                                        <p className="text-sm mt-1">
                                            {selectedUser.tarifConsultation ? `${selectedUser.tarifConsultation} €` : 'Non renseigné'}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Champs spécifiques pour les administrateurs */}
                            {selectedUser.role === 'ADMIN' && (
                                <div>
                                    <Label className="text-sm font-medium">Département</Label>
                                    <p className="text-sm mt-1">{selectedUser.departement || 'Non renseigné'}</p>
                                </div>
                            )}

                            {/* Champs spécifiques pour les patients */}
                            {selectedUser.role === 'PATIENT' && (
                                <>
                                    <div>
                                        <Label className="text-sm font-medium">Date de Naissance</Label>
                                        <p className="text-sm mt-1">
                                            {selectedUser.dateNaissance ? new Date(selectedUser.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseigné'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Numéro Sécurité Sociale</Label>
                                        <p className="text-sm mt-1">{selectedUser.numeroSecuriteSociale || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Adresse</Label>
                                        <p className="text-sm mt-1">{selectedUser.adresse || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Médecin Traitant</Label>
                                        <p className="text-sm mt-1 flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4" />
                                            {getMedecinName(selectedUser.medecinTraitantId)}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Groupe Sanguin</Label>
                                        <p className="text-sm mt-1">{selectedUser.groupeSanguin || 'Non renseigné'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Allergies</Label>
                                        <p className="text-sm mt-1">{selectedUser.allergies || 'Aucune allergie connue'}</p>
                                    </div>
                                </>
                            )}

                            <div>
                                <Label className="text-sm font-medium">Date de création</Label>
                                <p className="text-sm mt-1">
                                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="flex-1"
                                >
                                    Fermer
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsViewModalOpen(false)
                                        handleEditUser(selectedUser)
                                    }}
                                    className="flex-1"
                                >
                                    Modifier
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal de modification */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Modifier l'utilisateur</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations de l'utilisateur sélectionné
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {createError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <p>{createError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-prenom">Prénom *</Label>
                                    <Input
                                        id="edit-prenom"
                                        value={newUser.prenom}
                                        onChange={(e) => handleInputChange('prenom', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nom">Nom *</Label>
                                    <Input
                                        id="edit-nom"
                                        value={newUser.nom}
                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email *</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Nouveau mot de passe</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Laisser vide pour ne pas changer"
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-telephone">Téléphone *</Label>
                                <Input
                                    id="edit-telephone"
                                    value={newUser.telephone}
                                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Rôle *</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value: UserRole) => handleInputChange('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PATIENT">Patient</SelectItem>
                                        <SelectItem value="MEDECIN">Médecin</SelectItem>
                                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Champs spécifiques pour les médecins */}
                            {newUser.role === 'MEDECIN' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-specialite">Spécialité *</Label>
                                        <Input
                                            id="edit-specialite"
                                            value={newUser.specialite || ''}
                                            onChange={(e) => handleInputChange('specialite', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-numeroIdentification">Numéro d'identification *</Label>
                                        <Input
                                            id="edit-numeroIdentification"
                                            value={newUser.numeroIdentification || ''}
                                            onChange={(e) => handleInputChange('numeroIdentification', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-adresseCabinet">Adresse du cabinet *</Label>
                                        <Input
                                            id="edit-adresseCabinet"
                                            value={newUser.adresseCabinet || ''}
                                            onChange={(e) => handleInputChange('adresseCabinet', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-tarifConsultation">Tarif consultation</Label>
                                        <Input
                                            id="edit-tarifConsultation"
                                            type="number"
                                            step="0.01"
                                            value={newUser.tarifConsultation || ''}
                                            onChange={(e) => handleNumberInputChange('tarifConsultation', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Champs spécifiques pour les administrateurs */}
                            {newUser.role === 'ADMIN' && (
                                <div className="space-y-2">
                                    <Label htmlFor="edit-departement">Département *</Label>
                                    <Input
                                        id="edit-departement"
                                        value={newUser.departement || ''}
                                        onChange={(e) => handleInputChange('departement', e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {/* Champs spécifiques pour les patients */}
                            {newUser.role === 'PATIENT' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-dateNaissance">Date de Naissance</Label>
                                        <Input
                                            id="edit-dateNaissance"
                                            type="date"
                                            value={newUser.dateNaissance || ''}
                                            onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-numeroSecuriteSociale">Numéro Sécurité Sociale</Label>
                                        <Input
                                            id="edit-numeroSecuriteSociale"
                                            value={newUser.numeroSecuriteSociale || ''}
                                            onChange={(e) => handleInputChange('numeroSecuriteSociale', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-adresse">Adresse</Label>
                                        <Input
                                            id="edit-adresse"
                                            value={newUser.adresse || ''}
                                            onChange={(e) => handleInputChange('adresse', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-medecinTraitantId" className="flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4" />
                                            Médecin Traitant
                                        </Label>
                                        <Select
                                            value={newUser.medecinTraitantId?.toString() || 'none'}
                                            onValueChange={(value) => handleInputChange('medecinTraitantId', value === 'none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un médecin traitant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Aucun médecin assigné</SelectItem>
                                                {loadingMedecins ? (
                                                    <SelectItem value="loading" disabled>
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Chargement des médecins...
                                                        </div>
                                                    </SelectItem>
                                                ) : (
                                                    medecins.map((medecin) => (
                                                        <SelectItem key={medecin.id} value={medecin.id.toString()}>
                                                            Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-groupeSanguin">Groupe Sanguin</Label>
                                        <Input
                                            id="edit-groupeSanguin"
                                            value={newUser.groupeSanguin || ''}
                                            onChange={(e) => handleInputChange('groupeSanguin', e.target.value)}
                                            placeholder="Ex: A+"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-allergies">Allergies</Label>
                                        <Input
                                            id="edit-allergies"
                                            value={newUser.allergies || ''}
                                            onChange={(e) => handleInputChange('allergies', e.target.value)}
                                            placeholder="Séparées par des virgules"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditModalOpen(false)
                                        clearMessages()
                                    }}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Modification...
                                        </>
                                    ) : (
                                        "Modifier l'utilisateur"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal de suppression */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">
                                    <strong>{selectedUser.prenom} {selectedUser.nom}</strong> ({selectedUser.email})
                                </p>
                                <p className="text-sm text-red-700 mt-1">
                                    Rôle: {selectedUser.role}
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false)
                                        clearMessages()
                                    }}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={deleteUser}
                                    disabled={isDeleting}
                                    className="flex-1"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Suppression...
                                        </>
                                    ) : (
                                        "Supprimer"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
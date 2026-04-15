'use client'

import { useState, useEffect } from 'react'
import { Medecin, usersApi } from '../lib/api-client'

export function useMedecinProfile(medecinId: number | undefined) {
    const [medecin, setMedecin] = useState<Medecin | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMedecinProfile = async (id: number) => {
        try {
            setLoading(true)
            setError(null)
            console.log(`🔄 Chargement du profil médecin ID: ${id}`)

            const medecinData = await usersApi.getMedecin(id)
            console.log('✅ Profil médecin chargé:', medecinData)

            setMedecin(medecinData)
        } catch (err: any) {
            console.error('❌ Erreur lors du chargement du profil médecin:', err)
            setError(err.message || 'Impossible de charger le profil médecin')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!medecinId) {
            setLoading(false)
            return
        }
        fetchMedecinProfile(medecinId)
    }, [medecinId])

    const updateMedecin = async (data: Partial<Medecin>): Promise<boolean> => {
        if (!medecinId) return false

        try {
            console.log(`🔄 Mise à jour du médecin ID: ${medecinId}`, data)

            // Utiliser l'API existante pour mettre à jour le médecin
            const updatedMedecin = await usersApi.updateMedecin(medecinId, data)
            console.log('✅ Médecin mis à jour:', updatedMedecin)
            setMedecin(updatedMedecin)
            return true
        } catch (err: any) {
            console.error('❌ Erreur lors de la mise à jour du médecin:', err)
            throw new Error(err.message || 'Erreur lors de la mise à jour')
        }
    }

    return {
        medecin,
        loading,
        error,
        updateMedecin,
        refetch: () => medecinId && fetchMedecinProfile(medecinId)
    }
}
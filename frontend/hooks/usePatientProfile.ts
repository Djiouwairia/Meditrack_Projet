// hooks/usePatientProfile.ts - VERSION CORRIGÉE
'use client'

import { useState, useEffect } from 'react'
import { Patient, usersApi } from '../lib/api-client' // 🔥 CHANGER: utiliser usersApi

export function usePatientProfile(patientId: number | undefined) {
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPatientProfile = async (id: number) => {
        try {
            setLoading(true)
            setError(null)
            console.log(`🔄 Chargement du profil patient ID: ${id}`)

            // 🔥 CORRECTION : Utiliser usersApi.getPatient qui utilise /api/patients/{id}
            const patientData = await usersApi.getPatient(id)
            console.log('✅ Profil patient chargé:', patientData)

            setPatient(patientData)
        } catch (err: any) {
            console.error('❌ Erreur lors du chargement du profil:', err)
            setError(err.message || 'Impossible de charger le profil patient')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!patientId) {
            setLoading(false)
            return
        }
        fetchPatientProfile(patientId)
    }, [patientId])

    const updatePatient = async (data: Partial<Patient>): Promise<boolean> => {
        if (!patientId) return false

        try {
            console.log(`🔄 Mise à jour du patient ID: ${patientId}`, data)

            // 🔥 CORRECTION : Utiliser usersApi.updatePatient qui utilise /api/patients/{id}
            const updatedPatient = await usersApi.updatePatient(patientId, data)
            console.log('✅ Patient mis à jour:', updatedPatient)
            setPatient(updatedPatient)
            return true
        } catch (err: any) {
            console.error('❌ Erreur lors de la mise à jour:', err)
            throw new Error(err.message || 'Erreur lors de la mise à jour')
        }
    }

    return {
        patient,
        loading,
        error,
        updatePatient,
        refetch: () => patientId && fetchPatientProfile(patientId)
    }
}
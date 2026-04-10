'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase'

function ConfirmAccountContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get('code')

        if (code) {
            const confirmUser = async () => {
                const { error } = await supabase.auth.exchangeCodeForSession(code)

                if (!error) {
                    router.push('/login?message=Cuenta confirmada con éxito')
                } else {
                    console.error('Error:', error.message)
                    router.push('/login?error=El enlace es inválido')
                }
            }
            confirmUser()
        }
    }, [searchParams, router])

    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Verificando tu cuenta</h1>
            <p className="text-gray-600">Estamos procesando tu solicitud...</p>
        </div>
    )
}

export default function ConfirmAccountPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <ConfirmAccountContent />
            </Suspense>
        </div>
    )
}
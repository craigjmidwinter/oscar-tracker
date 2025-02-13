// app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function CallbackPage() {
    const router = useRouter()

    useEffect(() => {
        let mounted = true

        const checkSession = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()

            if (user && mounted) {
                router.replace('/') // Ensures clean navigation
                return
            }

            if (error) {
                console.error('Session error:', error)
                router.replace('/sign-in?error=session_error')
            }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session && mounted) {
                    router.replace('/')
                }
            }
        )

        checkSession()

        return () => {
            mounted = false
            subscription?.unsubscribe()
        }
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Completing authentication...</p>
        </div>
    )
}

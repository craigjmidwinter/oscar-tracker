'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
    user: User | null
    signIn: (email: string, redirectUrl: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const value = useMemo(() => ({
        user,
        signIn: async (email: string, redirectUrl: string) => {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: redirectUrl }
            });
            if (error) throw error;
        },
        signOut: async () => {
            await supabase.auth.signOut()
            setUser(null)

            localStorage.removeItem('seenMovies')
            localStorage.removeItem('picks')
        }
    }), [user])

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription?.unsubscribe()
    }, [])

    if (loading) return <div>Loading...</div>

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// app/context/SeenMoviesContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useAuth } from './auth'

type SeenMoviesContextType = {
    seenMovies: Set<string>
    setSeenMovies: React.Dispatch<React.SetStateAction<Set<string>>>
    toggleMovieSeen: (movieId: string) => Promise<void>
    sharedUserId: string | null
    setSharedUserId: (id: string | null) => void
}

const SeenMoviesContext = createContext<SeenMoviesContextType | undefined>(undefined)

interface SeenMoviesProviderProps {
    children: React.ReactNode;
    sharedUserId?: string;
}

export function SeenMoviesProvider({ children, sharedUserId: initialSharedUserId }: SeenMoviesProviderProps) {
    const { user } = useAuth()
    const [seenMovies, setSeenMovies] = useState<Set<string>>(new Set())
    // New state for shared user id
    const [sharedUserId, setSharedUserId] = useState<string | null>(initialSharedUserId ?? null)

    useEffect(() => {
        const loadSeenMovies = async () => {
            // Use sharedUserId if provided; otherwise, use the logged-in user's id.
            const idToLoad = sharedUserId || user?.id
            if (!idToLoad) {
                setSeenMovies(new Set())
                return
            }
            const { data, error } = await supabase
                .from('user_seen_movies')
                .select('movie_id')
                .eq('user_id', idToLoad)

            if (error) {
                console.error('Failed to load seen movies:', error)
                return
            }
            setSeenMovies(new Set(data.map(entry => entry.movie_id)))
        }

        loadSeenMovies()
    }, [user, sharedUserId])

    const toggleMovieSeen = async (movieId: string) => {
        // In shared (readOnly) mode, do nothing.
        if (sharedUserId || !user) return

        setSeenMovies(prev => {
            const newSet = new Set(prev)
            if (newSet.has(movieId)) {
                newSet.delete(movieId)
            } else {
                newSet.add(movieId)
            }
            return newSet
        })

        try {
            if (seenMovies.has(movieId)) {
                await supabase
                    .from('user_seen_movies')
                    .delete()
                    .eq('user_id', user!.id)
                    .eq('movie_id', movieId)
            } else {
                await supabase
                    .from('user_seen_movies')
                    .insert([{ user_id: user!.id, movie_id: movieId }])
            }
        } catch (error) {
            console.error('Failed to update movie status:', error)
        }
    }

    return (
        <SeenMoviesContext.Provider value={{ seenMovies, setSeenMovies, toggleMovieSeen, sharedUserId, setSharedUserId }}>
            {children}
        </SeenMoviesContext.Provider>
    )
}

export function useSeenMovies() {
    const context = useContext(SeenMoviesContext)
    if (!context) {
        throw new Error('useSeenMovies must be used within a SeenMoviesProvider')
    }
    return context
}

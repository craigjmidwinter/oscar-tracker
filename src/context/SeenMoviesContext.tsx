'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useAuth } from './auth'

type SeenMoviesContextType = {
    seenMovies: Set<string>
    setSeenMovies: React.Dispatch<React.SetStateAction<Set<string>>>
    toggleMovieSeen: (movieId: string) => Promise<void>
}

const SeenMoviesContext = createContext<SeenMoviesContextType | undefined>(undefined)

export function SeenMoviesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [seenMovies, setSeenMovies] = useState<Set<string>>(new Set())

    useEffect(() => {
        const loadSeenMovies = async () => {
            if (user) {
                // ✅ Load movies from Supabase when signed in
                const { data, error } = await supabase
                    .from('user_seen_movies')
                    .select('movie_id')
                    .eq('user_id', user.id)

                if (error) {
                    console.error('Failed to load seen movies:', error)
                    return
                }

                setSeenMovies(new Set(data.map(entry => entry.movie_id)))
            } else {
                // ✅ No localStorage now – start with an empty set when signed out
                setSeenMovies(new Set())
            }
        }

        loadSeenMovies()
    }, [user])

    const toggleMovieSeen = async (movieId: string) => {
        if (!user) {
            // If not signed in, do nothing here.
            // The UI (Layout) will catch this and show the auth modal.
            return
        }

        // Update state locally
        setSeenMovies(prev => {
            const newSet = new Set(prev)
            if (newSet.has(movieId)) {
                newSet.delete(movieId)
            } else {
                newSet.add(movieId)
            }
            return new Set(newSet)
        })

        // Sync with Supabase
        try {
            if (seenMovies.has(movieId)) {
                await supabase
                    .from('user_seen_movies')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('movie_id', movieId)
            } else {
                await supabase
                    .from('user_seen_movies')
                    .insert([{ user_id: user.id, movie_id: movieId }])
            }
        } catch (error) {
            console.error('Failed to update movie status:', error)
        }
    }

    return (
        <SeenMoviesContext.Provider value={{ seenMovies, setSeenMovies, toggleMovieSeen }}>
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

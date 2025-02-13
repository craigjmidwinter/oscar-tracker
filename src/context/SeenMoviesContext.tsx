'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useAuth } from './auth'

type SeenMoviesContextType = {
    seenMovies: Set<string>
    setSeenMovies: React.Dispatch<React.SetStateAction<Set<string>>>
    toggleMovieSeen: (movieId: string) => void
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
                // ✅ Load movies from local storage when signed out
                const localMovies = JSON.parse(localStorage.getItem('seenMovies') || '[]') as string[]
                setSeenMovies(new Set(localMovies))
            }
        }

        loadSeenMovies()
    }, [user]) // Reloads when the user logs in or out

    const toggleMovieSeen = async (movieId: string) => {
        setSeenMovies(prev => {
            const newSet = new Set(prev)
            const isSeen = newSet.has(movieId)

            if (isSeen) {
                newSet.delete(movieId)
            } else {
                newSet.add(movieId)
            }

            // ✅ Ensure React detects the change by setting a new Set reference
            return new Set(newSet)
        })

        if (user) {
            // ✅ Sync with Supabase when logged in
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
        } else {
            // ✅ Store in localStorage when logged out
            localStorage.setItem('seenMovies', JSON.stringify([...seenMovies]))
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

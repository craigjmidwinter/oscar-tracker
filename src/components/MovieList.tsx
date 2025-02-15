'use client'

import { useState } from "react"
import type { Nominee } from "@/types/types"

interface MovieListProps {
    seenMovies: Set<string>;
    toggleMovieSeenAction: (id: string) => void;
    nominees: Nominee[];
    readOnly?: boolean;
}

export function MovieList({
                              seenMovies,
                              toggleMovieSeenAction,
                              nominees,
                              readOnly = false,
                          }: MovieListProps) {
    const moviesMap = new Map<string, { id: string; title: string; nominationCount: number }>()

    nominees.forEach(nominee => {
        const movie = nominee.movie
        if (moviesMap.has(movie.id)) {
            moviesMap.get(movie.id)!.nominationCount += 1
        } else {
            moviesMap.set(movie.id, { id: movie.id, title: movie.title, nominationCount: 1 })
        }
    })

    const movies = Array.from(moviesMap.values())
    const [sortBy, setSortBy] = useState<"nominations" | "title">("nominations")

    const sortedMovies = [...movies].sort((a, b) => {
        if (sortBy === "nominations") {
            return b.nominationCount - a.nominationCount
        } else {
            return a.title.localeCompare(b.title)
        }
    })

    return (
        <div className="space-y-4">
            {/* Sorting Controls */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                    className="text-sm text-gray-700 bg-white border border-gray-300 rounded-md px-2 py-1 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "nominations" | "title")}
                    disabled={readOnly}
                >
                    <option value="nominations">Most Nominations</option>
                    <option value="title">Title (A-Z)</option>
                </select>
            </div>

            {/* Movie List */}
            <div className="space-y-2">
                {sortedMovies.map(movie => (
                    <div
                        key={movie.id}
                        role="button"
                        tabIndex={0}
                        className={`group p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all outline-none ${
                            seenMovies.has(movie.id)
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-white hover:bg-gray-50 border border-gray-200'
                        } ${readOnly ? 'cursor-default' : ''}`}
                        onClick={() => {
                            if (!readOnly) {
                                toggleMovieSeenAction(movie.id)
                            }
                        }}
                        onKeyDown={(e) => {
                            if (!readOnly && e.key === "Enter") {
                                toggleMovieSeenAction(movie.id)
                            }
                        }}
                    >
                        <div className="flex-1 min-w-0 mr-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                {movie.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {movie.nominationCount} nomination{movie.nominationCount > 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            {/* Checkbox Wrapper */}
                            <div
                                className={`w-5 h-5 border rounded-md flex items-center justify-center transition-colors ${
                                    seenMovies.has(movie.id)
                                        ? 'border-green-500 bg-green-500'
                                        : 'border-gray-300 group-hover:border-gray-400 bg-white'
                                } ${readOnly ? '' : 'cursor-pointer'}`}
                                onClick={(e) => {
                                    e.stopPropagation() // Prevent parent onClick from firing
                                    if (!readOnly) {
                                        toggleMovieSeenAction(movie.id)
                                    }
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={seenMovies.has(movie.id)}
                                    onChange={(e) => {
                                        e.stopPropagation() // Prevent parent onClick from firing
                                        if (!readOnly) {
                                            toggleMovieSeenAction(movie.id)
                                        }
                                    }}
                                    className="opacity-0 absolute"
                                    disabled={readOnly}
                                />
                                {seenMovies.has(movie.id) && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

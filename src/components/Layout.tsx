// app/components/Layout.tsx
'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth";
import { AuthModal } from "./AuthModal";
import { useSeenMovies } from "@/context/SeenMoviesContext";
import type { Nominee } from "@/types/types";

interface LayoutProps {
    MovieListComponent: React.ComponentType<{
        seenMovies: Set<string>;
        toggleMovieSeen: (id: string) => void;
        nominees: Nominee[];
    }>;
    CategoryListComponent: React.ComponentType<{
        seenMovies: Set<string>;
        nominees: Nominee[];
        readOnly?: boolean;
    }>;
    nominees: Nominee[];
    readOnly?: boolean;
}

export function Layout({
                           MovieListComponent,
                           CategoryListComponent,
                           nominees,
                           readOnly: readOnlyProp,
                       }: LayoutProps) {
    const { user, signOut } = useAuth();
    const { seenMovies, toggleMovieSeen, setSharedUserId, sharedUserId } = useSeenMovies();
    const [showAuth, setShowAuth] = useState(false);
    const searchParams = useSearchParams();
    const queryUserId = searchParams.get("userId");

    useEffect(() => {
        setSharedUserId(queryUserId);
    }, [queryUserId, setSharedUserId]);

    // Determine readOnly mode: if queryUserId exists, then it's readOnly.
    const readOnly = readOnlyProp ?? Boolean(sharedUserId);

    return (
        <div className="min-h-screen bg-gray-50">
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-900">🏆 Awards Tracker</h1>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                  👋 {user.email?.split("@")[0]}
                </span>
                                {!readOnly && (
                                    <a
                                        href={`/?userId=${user.id}`}
                                        className="text-sm text-blue-600 underline"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Your Public Picks
                                    </a>
                                )}
                                <button
                                    onClick={signOut}
                                    className="text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowAuth(true)}
                                className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-colors"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Movie List Panel */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">🎬 Movie List</h2>
                        </div>
                        <div className="p-4">
                            <MovieListComponent
                                seenMovies={seenMovies}
                                toggleMovieSeen={(movieId) => {
                                    if (readOnly) return;
                                    toggleMovieSeen(movieId);
                                }}
                                nominees={nominees}
                            />
                        </div>
                    </div>
                    {/* Categories Panel */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">🏅 Categories</h2>
                        </div>
                        <div className="p-4">
                            <CategoryListComponent
                                seenMovies={seenMovies}
                                nominees={nominees}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

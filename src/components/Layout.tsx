'use client'

import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useAuth} from "@/context/auth";
import {AuthModal} from "./AuthModal";
import {ShareModal} from "./ShareModal";
import {useSeenMovies} from "@/context/SeenMoviesContext";
import {Nominee} from "@/types/types";
import {CategoryList} from "@/components/CategoryList";
import {MovieList} from "@/components/MovieList";
import {PageHeader} from "@/components/PageHeader";
import {SettingsModal} from "@/components/SettingsModal";

interface LayoutProps {
    nominees: Nominee[];
    readOnly?: boolean;
}

export function Layout({
                           nominees,
                           readOnly: readOnlyProp,
                       }: LayoutProps) {
    const { user, signOut } = useAuth();
    const { seenMovies, toggleMovieSeen, setSharedUserId, sharedUserId } = useSeenMovies();
    const [showAuth, setShowAuth] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [displayName, setDisplayName] = useState(user?.user_metadata?.displayName || "");
    const searchParams = useSearchParams();
    const queryUserId = searchParams.get("userId");

    useEffect(() => {
        setSharedUserId(queryUserId);
    }, [queryUserId, setSharedUserId]);

    const readOnly = readOnlyProp ?? Boolean(sharedUserId);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {showAuth && <AuthModal onCloseAction={() => setShowAuth(false)}/>}
            {showShareModal && user && <ShareModal userId={user.id} onCloseAction={() => setShowShareModal(false)}/>}
            {showSettingsModal && user && <SettingsModal setDisplayNameAction={setDisplayName} user={user} onCloseAction={() => setShowSettingsModal(false)} />}

            <PageHeader
                user={user}
                readOnly={readOnly}
                shareAction={() => setShowShareModal(true)}
                settingsAction={() => setShowSettingsModal(true)}
                signOutAction={signOut}
                signInAction={() => setShowAuth(true)}
                displayName={displayName}
            />
            {/* Header */}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Movie List Panel */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-100">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900 header-font">🎬 Movie List</h2>
                        </div>
                        <div className="p-4">
                            <MovieList
                                seenMovies={seenMovies}
                                toggleMovieSeenAction={(movieId) => {
                                    if (readOnly) return;
                                    toggleMovieSeen(movieId);
                                }}
                                nominees={nominees}
                            />
                        </div>
                    </div>

                    {/* Categories Panel */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-100">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900 header-font">🏅 Categories</h2>
                        </div>
                        <div className="p-4">
                            <CategoryList
                                seenMovies={seenMovies}
                                nominees={nominees}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer with Bravo Outsider Sponsorship */}
            <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
                <p>Sponsored by <a href="https://bravooutsider.com" className="text-blue-600 hover:underline">The Bravo
                    Outsider Podcast</a></p>
            </footer>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth";
import { AuthModal } from "./AuthModal";
import { ShareModal } from "./ShareModal";
import { useSeenMovies } from "@/context/SeenMoviesContext";
import { Nominee } from "@/types/types";
import { CategoryList } from "@/components/CategoryList";
import { MovieList } from "@/components/MovieList";
import { PageHeader } from "@/components/PageHeader";
import { SettingsModal } from "@/components/SettingsModal";
import { supabase } from "@/utils/supabase";

interface LayoutProps {
    nominees: Nominee[];
    readOnly?: boolean;
}

export function Layout({ nominees, readOnly: readOnlyProp }: LayoutProps) {
    const { user, signOut } = useAuth();
    const {
        seenMovies,
        setSeenMovies,
        toggleMovieSeen,
        setSharedUserId,
        sharedUserId,
    } = useSeenMovies();

    const [showAuth, setShowAuth] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Display name for the logged‑in user
    const [displayName, setDisplayName] = useState(
        user?.user_metadata?.displayName || ""
    );
    // Shared display name for someone else's page
    const [sharedDisplayName, setSharedDisplayName] = useState("");

    const searchParams = useSearchParams();
    const queryUserId = searchParams.get("userId");

    // Update sharedUserId in context from the URL query param.
    useEffect(() => {
        setSharedUserId(queryUserId);
    }, [queryUserId, setSharedUserId]);

    // Determine readOnly mode: true if a userId is in the URL and it’s not your own.
    const readOnly =
        readOnlyProp ?? Boolean(queryUserId && queryUserId !== user?.id);

    // Immediately clear seen movies if viewing someone else's page to avoid showing your picks.
    useEffect(() => {
        if (readOnly && queryUserId && queryUserId !== user?.id) {
            setSeenMovies(new Set());
        }
    }, [readOnly, queryUserId, user?.id, setSeenMovies]);

    // Fetch the shared user's display name if we are in readOnly mode for a different user.
    useEffect(() => {
        async function fetchSharedDisplayName(userId: string) {
            const { data, error } = await supabase
                .from("user_preferences")
                .select("display_name")
                .eq("user_id", userId)
                .single();

            if (error) {
                console.error("Error fetching shared user's displayName:", error);
                setSharedDisplayName("Unknown User");
            } else {
                setSharedDisplayName(data?.display_name || "Unknown User");
            }
        }

        if (readOnly && queryUserId && queryUserId !== user?.id) {
            fetchSharedDisplayName(queryUserId);
        } else {
            setSharedDisplayName("");
        }
    }, [readOnly, queryUserId, user?.id]);

    // Decide which name to show in the header.
    let subheadingName = displayName;
    if (readOnly && queryUserId && queryUserId !== user?.id) {
        subheadingName = sharedDisplayName;
    } else if (!displayName && user) {
        subheadingName = user.email?.split("@")[0] || "You";
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Modals */}
            {showAuth && <AuthModal onCloseAction={() => setShowAuth(false)} />}
            {showShareModal && user && (
                <ShareModal userId={user.id} onCloseAction={() => setShowShareModal(false)} />
            )}
            {showSettingsModal && user && (
                <SettingsModal
                    setDisplayNameAction={setDisplayName}
                    user={user}
                    onCloseAction={() => setShowSettingsModal(false)}
                />
            )}

            {/* Site Header */}
            <PageHeader
                user={user}
                readOnly={readOnly}
                displayName={displayName}
                shareAction={() => setShowShareModal(true)}
                settingsAction={() => setShowSettingsModal(true)}
                signOutAction={signOut}
                signInAction={() => setShowAuth(true)}
            />

            {/* Subheading / Big Title */}
            <div className="container mx-auto px-4 mt-4 mb-6 text-center">
                {user ? (
                    readOnly && queryUserId && queryUserId !== user.id ? (
                        <h2 className="text-3xl font-extrabold text-gray-800">
                            {`Viewing ${subheadingName}'s Oscar Ballot`}
                        </h2>
                    ) : (
                        <h2 className="text-3xl font-extrabold text-gray-800">
                            {`${subheadingName}'s Oscar Ballot`}
                        </h2>
                    )
                ) : (
                    <h2 className="text-3xl font-extrabold text-gray-800">Oscar Picks</h2>
                )}
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Movie List Panel */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-100">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900 header-font">
                                🎬 Watch List
                            </h2>
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
                            <h2 className="text-2xl font-semibold text-gray-900 header-font">
                                🏅 Categories
                            </h2>
                        </div>
                        <div className="p-4">
                            <CategoryList
                                seenMovies={seenMovies}
                                nominees={nominees}
                                readOnly={readOnly}
                                sharedUserId={sharedUserId ?? undefined}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
                <p>
                    Sponsored by{" "}
                    <a href="https://bravooutsider.com" className="text-blue-600 hover:underline">
                        The Bravo Outsider Podcast
                    </a>
                </p>
            </footer>
        </div>
    );
}

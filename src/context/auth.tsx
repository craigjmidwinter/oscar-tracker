"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
    user: User | null;
    signInWithEmail: (email: string, redirectUrl: string) => Promise<void>;
    signInWithGoogle: (redirectUrl: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function cleanRedirectUrlKeepUserId(rawUrl: string): string {
    try {
        const urlObj = new URL(rawUrl);
        const userId = urlObj.searchParams.get("userId"); // store it
        // Remove all params
        urlObj.searchParams.forEach((_, key) => {
            urlObj.searchParams.delete(key);
        });
        // Re-inject userId if found
        if (userId) {
            urlObj.searchParams.set("userId", userId);
        }
        // remove anchors
        urlObj.hash = "";
        return urlObj.toString();
    } catch {
        // fallback if rawUrl isn't parseable
        return rawUrl;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const value = useMemo<AuthContextType>(() => ({
        user,

        // Sign in by email (magic link)
        signInWithEmail: async (email, redirectUrl) => {
            const finalRedirect = cleanRedirectUrlKeepUserId(redirectUrl);
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: finalRedirect },
            });
            if (error) throw error;
        },

        // Sign in with Google
        signInWithGoogle: async (redirectUrl) => {
            const finalRedirect = cleanRedirectUrlKeepUserId(redirectUrl);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: finalRedirect },
            });
            if (error) throw error;
        },

        // Sign out
        signOut: async () => {
            await supabase.auth.signOut();
            setUser(null);
            localStorage.removeItem("seenMovies");
            localStorage.removeItem("picks");
        },
    }), [user]);

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkSession();

        // Listen for changes in auth state
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Update local user
            setUser(session?.user ?? null);

            // If there's a newly signed-in user, ensure display_name is set in user_preferences
            if (session?.user) {
                await ensureUserDisplayName(session.user);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    // 1) Checks user_preferences for display_name
    // 2) If missing, sets it to either the user_metadata.full_name or the user's email prefix
    async function ensureUserDisplayName(currUser: User) {
        const userId = currUser.id;
        try {
            // Fetch from user_preferences
            const { data: prefs, error } = await supabase
                .from("user_preferences")
                .select("display_name")
                .eq("user_id", userId)
                .single();

            if (error && error.code !== "PGRST116") {
                // PGRST116 => row not found
                console.error("Error fetching user_preferences:", error);
                return;
            }

            if (!prefs || !prefs.display_name) {
                // If no record or display_name is null
                // Use Google full_name if available
                const fullName = currUser.user_metadata?.full_name as string | undefined;
                // fallback to email prefix
                const fallback = currUser.email?.split("@")[0] || "User";
                const displayName = fullName || fallback;

                // Upsert into user_preferences
                const { error: upsertError } = await supabase
                    .from("user_preferences")
                    .upsert({ user_id: userId, display_name: displayName });

                if (upsertError) {
                    console.error("Error upserting display_name:", upsertError);
                } else {
                    console.log("Display name set to:", displayName);
                }
            }
        } catch (err) {
            console.error("Error in ensureUserDisplayName:", err);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

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

// Keep only userId param in URL
function cleanRedirectUrlKeepUserId(rawUrl: string): string {
    try {
        const urlObj = new URL(rawUrl);
        const userId = urlObj.searchParams.get("userId");
        // Remove all params
        urlObj.searchParams.forEach((_, key) => urlObj.searchParams.delete(key));
        // Re-inject userId
        if (userId) {
            urlObj.searchParams.set("userId", userId);
        }
        // Remove anchors
        urlObj.hash = "";
        return urlObj.toString();
    } catch {
        return rawUrl; // fallback if parse fails
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // 1) Only block the UI while we do the *initial* session check
    useEffect(() => {
        async function checkSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setInitialLoading(false);
        }

        checkSession();

        // 2) Listen for changes in auth state (login/logout)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription?.unsubscribe();
    }, []);

    // 3) If a new user logs in, ensure user_preferences.display_name is set
    useEffect(() => {
        if (user) {
            ensureUserDisplayName(user).catch((err) =>
                console.error("Error ensuring displayName:", err)
            );
        }
        // no else => if user logs out, we don’t need to do anything
    }, [user]);

    const value = useMemo<AuthContextType>(() => ({
        user,

        // 1) Email sign-in (OTP)
        signInWithEmail: async (email, redirectUrl) => {
            const finalRedirect = cleanRedirectUrlKeepUserId(redirectUrl);
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: finalRedirect },
            });
            if (error) throw error;
        },

        // 2) Google sign-in (OAuth)
        signInWithGoogle: async (redirectUrl) => {
            const finalRedirect = cleanRedirectUrlKeepUserId(redirectUrl);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: finalRedirect },
            });
            if (error) throw error;
        },

        // 3) Sign out
        signOut: async () => {
            await supabase.auth.signOut();
            setUser(null);
            localStorage.removeItem("seenMovies");
            localStorage.removeItem("picks");
        },
    }), [user]);

    // 4) Only block initial load
    if (initialLoading) return <div>Loading...</div>;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

/**
 * If no displayName in user_preferences, set it to either
 * user_metadata.full_name OR their email prefix
 */
async function ensureUserDisplayName(currUser: User) {
    const userId = currUser.id;

    const { data: prefs, error } = await supabase
        .from("user_preferences")
        .select("display_name")
        .eq("user_id", userId)
        .single();

    // if there's any error besides row not found
    if (error && error.code !== "PGRST116") {
        console.error("Error fetching user_preferences:", error);
        return;
    }

    if (!prefs || !prefs.display_name) {
        const fullName = currUser.user_metadata?.full_name as string | undefined;
        const fallback = currUser.email?.split("@")[0] || "User";
        const displayName = fullName || fallback;

        const { error: upsertError } = await supabase
            .from("user_preferences")
            .upsert({ user_id: userId, display_name: displayName });

        if (upsertError) {
            console.error("Error upserting display_name:", upsertError);
        } else {
            console.log("Display name set to:", displayName);
        }
    }
}

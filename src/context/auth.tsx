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
        urlObj.searchParams.forEach((_, key) => {
            urlObj.searchParams.delete(key); // remove everything
        });
        if (userId) {
            // re-inject userId
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

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription?.unsubscribe();
    }, []);

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

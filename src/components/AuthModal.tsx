"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";

export function AuthModal({ onCloseAction }: { onCloseAction: () => void }) {
    const { user, signInWithEmail, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [redirectUrl, setRedirectUrl] = useState("");

    useEffect(() => {
        if (user) onCloseAction();
        // Capture the current address bar URL as the redirect URL
        setRedirectUrl(window.location.href);
    }, [user, onCloseAction]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email.match(/^\S+@\S+\.\S+$/)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmail(email, redirectUrl);
            if (error) throw error;
            setMessage("Check your email for the login link!");
            setTimeout(onCloseAction, 3000);
        } catch (err) {
            console.error("Login error:", err);
            setError("Failed to send login link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");
            await signInWithGoogle(redirectUrl);
            // signInWithGoogle will redirect automatically
            // If there's an error, it will throw
        } catch (err) {
            console.error("Google sign-in error:", err);
            setError("Failed to sign in with Google. Please try again.");
            setLoading(false);
        }
    };

    if (user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
                        <button
                            onClick={onCloseAction}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-4 space-y-4">
                    {/* Google Sign-In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Please wait..." : "Sign In with Google"}
                    </button>

                    {/* Or divider */}
                    <div className="text-center text-gray-500 text-sm">or</div>

                    {/* Email Sign-In Form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-all"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending login link..." : "Send Magic Link"}
                        </button>
                    </form>

                    {message && (
                        <div className="mt-4 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                            ✅ {message}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        {"We'll send you a magic link to sign in. No password required."}
                    </p>
                </div>
            </div>
        </div>
    );
}

// app/components/ShareModal.tsx
'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

interface ShareModalProps {
    userId: string;
    onCloseAction: () => void;
}

export function ShareModal({ userId, onCloseAction }: ShareModalProps) {
    const [shareLink, setShareLink] = useState("");
    const [copySuccess, setCopySuccess] = useState("");
    const [seenPublic, setSeenPublic] = useState(false);
    const [picksPublic, setPicksPublic] = useState(false);

    // Fetch user preferences on mount.
    useEffect(() => {
        async function fetchPreferences() {
            const { data, error } = await supabase
                .from("user_preferences")
                .select("seen_public, picks_public")
                .eq("user_id", userId)
                .single();
            if (error) {
                console.error("Error fetching preferences:", error);
            }
            if (data) {
                // Coerce to boolean: if data.seen_public or data.picks_public is null, default to false.
                setSeenPublic(data.seen_public ?? false);
                setPicksPublic(data.picks_public ?? false);
            }
        }
        fetchPreferences();

        // Build shareable link.
        setShareLink(`${window.location.origin}/?userId=${userId}`);
    }, [userId]);

    const handleCopy = () => {
        navigator.clipboard
            .writeText(shareLink)
            .then(() => {
                setCopySuccess("Copied!");
                setTimeout(() => setCopySuccess(""), 2000);
            })
            .catch(() => setCopySuccess("Failed to copy"));
    };

    const toggleSeenPublic = async () => {
        const newValue = !seenPublic;
        setSeenPublic(newValue);
        await supabase
            .from("user_preferences")
            .upsert({ user_id: userId, seen_public: newValue });
    };

    const togglePicksPublic = async () => {
        const newValue = !picksPublic;
        setPicksPublic(newValue);
        await supabase
            .from("user_preferences")
            .upsert({ user_id: userId, picks_public: newValue });
    };

    // If neither preference is enabled, we consider the link as "greyed out".
    const linkDisabled = !seenPublic && !picksPublic;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Share Your Picks</h2>
                    <button onClick={onCloseAction} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shareable Link</label>
                    <div className="flex mt-1">
                        <input
                            type="text"
                            readOnly
                            value={shareLink}
                            disabled={linkDisabled}
                            className={`flex-1 border rounded-l-md px-2 py-1 focus:outline-none ${
                                linkDisabled
                                    ? "bg-gray-100 text-gray-500 border-gray-300"
                                    : "bg-white text-gray-900 border-gray-300"
                            }`}
                        />
                        <button
                            onClick={handleCopy}
                            disabled={linkDisabled}
                            className={`px-3 py-1 rounded-r-md ${
                                linkDisabled
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            Copy
                        </button>
                    </div>
                    {copySuccess && <p className="text-sm text-green-600 mt-1">{copySuccess}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seen Movies Public</label>
                    <label htmlFor="toggle-seen" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                id="toggle-seen"
                                type="checkbox"
                                className="sr-only"
                                checked={seenPublic}
                                onChange={toggleSeenPublic}
                            />
                            <div className={`block w-10 h-6 rounded-full ${seenPublic ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            <div
                                className={`dot absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition ${
                                    seenPublic ? 'transform translate-x-4' : ''
                                }`}
                            ></div>
                        </div>
                        <span className="ml-3 text-sm">{seenPublic ? "Visible" : "Hidden"}</span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Picks Public</label>
                    <label htmlFor="toggle-picks" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                id="toggle-picks"
                                type="checkbox"
                                className="sr-only"
                                checked={picksPublic}
                                onChange={togglePicksPublic}
                            />
                            <div className={`block w-10 h-6 rounded-full ${picksPublic ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                            <div
                                className={`dot absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition ${
                                    picksPublic ? 'transform translate-x-4' : ''
                                }`}
                            ></div>
                        </div>
                        <span className="ml-3 text-sm">{picksPublic ? "Visible" : "Hidden"}</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

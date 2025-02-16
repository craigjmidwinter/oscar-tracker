"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";
import debounceFn from "lodash/debounce";
import { User } from "@supabase/supabase-js";

interface SettingsModalProps {
    user: User;
    onCloseAction: () => void;
    setDisplayNameAction: (name: string) => void; // Update parent's displayName in real time
}

export function SettingsModal({
                                  user,
                                  onCloseAction,
                                  setDisplayNameAction,
                              }: SettingsModalProps) {
    const [localDisplayName, setLocalDisplayName] = useState("");
    const [seenPublic, setSeenPublic] = useState(false);
    const [picksPublic, setPicksPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch current settings from user_preferences
    useEffect(() => {
        async function fetchUserSettings() {
            setLoading(true);

            const { data: userProfile, error } = await supabase
                .from("user_preferences")
                .select("display_name, seen_public, picks_public")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error("Error fetching user preferences:", error);
            } else if (userProfile) {
                setLocalDisplayName(userProfile.display_name ?? "");
                setSeenPublic(userProfile.seen_public ?? false);
                setPicksPublic(userProfile.picks_public ?? false);
            }

            setLoading(false);
        }

        fetchUserSettings();
    }, [user.id]);

    // Debounce function to update display name in user_preferences
    const updateDisplayNameDebounced = useCallback(
        debounceFn(async (newName: string) => {
            const { error } = await supabase
                .from("user_preferences")
                .upsert({
                    user_id: user.id,
                    display_name: newName,
                });

            if (error) {
                console.error("Error updating display name in user_preferences:", error);
            } else {
                // Let the parent know so the UI (header) can reflect the new name
                setDisplayNameAction(newName);
            }
        }, 500),
        [user.id, setDisplayNameAction]
    );

    // Called on every keystroke for display name
    const handleLocalDisplayNameChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newName = e.target.value;
        setLocalDisplayName(newName);
        updateDisplayNameDebounced(newName);
    };

    // Toggling seenPublic
    const toggleSeenPublic = async () => {
        const newValue = !seenPublic;
        setSeenPublic(newValue);
        const { error } = await supabase.from("user_preferences").upsert({
            user_id: user.id,
            seen_public: newValue,
        });
        if (error) {
            console.error("Error updating seenPublic:", error);
        }
    };

    // Toggling picksPublic
    const togglePicksPublic = async () => {
        const newValue = !picksPublic;
        setPicksPublic(newValue);
        const { error } = await supabase.from("user_preferences").upsert({
            user_id: user.id,
            picks_public: newValue,
        });
        if (error) {
            console.error("Error updating picksPublic:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Settings</h2>
                    <button onClick={onCloseAction} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Display Name Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={localDisplayName}
                        onChange={handleLocalDisplayNameChange}
                        className="w-full border px-3 py-2 rounded-lg"
                        disabled={loading}
                    />
                </div>

                {/* Visibility Toggles */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seen Movies Public
                    </label>
                    <label htmlFor="toggle-seen" className="flex items-center cursor-pointer">
                        <input
                            id="toggle-seen"
                            type="checkbox"
                            className="sr-only"
                            checked={seenPublic}
                            onChange={toggleSeenPublic}
                        />
                        <div
                            className={`block w-10 h-6 rounded-full ${
                                seenPublic ? "bg-green-600" : "bg-gray-300"
                            }`}
                        />
                        <span className="ml-3 text-sm">{seenPublic ? "Visible" : "Hidden"}</span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Picks Public
                    </label>
                    <label htmlFor="toggle-picks" className="flex items-center cursor-pointer">
                        <input
                            id="toggle-picks"
                            type="checkbox"
                            className="sr-only"
                            checked={picksPublic}
                            onChange={togglePicksPublic}
                        />
                        <div
                            className={`block w-10 h-6 rounded-full ${
                                picksPublic ? "bg-green-600" : "bg-gray-300"
                            }`}
                        />
                        <span className="ml-3 text-sm">{picksPublic ? "Visible" : "Hidden"}</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

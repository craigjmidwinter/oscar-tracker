'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import debounceFn from 'lodash/debounce';

interface SettingsModalProps {
    user: User;
    onCloseAction: () => void;
    setDisplayNameAction: (name: string) => void; // Callback to update PageHeader's displayName
}

/**
 * This component debounces the update to Supabase so that
 * the input doesn't lose focus on every keystroke.
 * We'll track the displayName in local state and only
 * notify Supabase (and the parent) after the user
 * stops typing (500ms).
 */

export function SettingsModal({ user, onCloseAction, setDisplayNameAction }: SettingsModalProps) {
    const [localDisplayName, setLocalDisplayName] = useState('');
    const [seenPublic, setSeenPublic] = useState(false);
    const [picksPublic, setPicksPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch current settings when modal opens
    useEffect(() => {
        async function fetchUserSettings() {
            setLoading(true);

            // Get user preferences
            const { data: userProfile } = await supabase
                .from('user_preferences')
                .select('seen_public, picks_public')
                .eq('user_id', user.id)
                .single();

            if (userProfile) {
                setSeenPublic(userProfile.seen_public ?? false);
                setPicksPublic(userProfile.picks_public ?? false);
            }

            // Get current displayName from supabase auth
            const { data: userData } = await supabase.auth.getUser();
            const supabaseDisplayName = userData.user?.user_metadata?.displayName || '';
            setLocalDisplayName(supabaseDisplayName);

            setLoading(false);
        }
        fetchUserSettings();
    }, [user.id]);

    // Debounce supabase update
    const updateDisplayNameInSupabase = useCallback(
        debounceFn(async (newName: string) => {
            // Update in Supabase auth
            const { error } = await supabase.auth.updateUser({
                data: { displayName: newName }
            });

            if (error) {
                console.error('Error updating display name:', error);
            } else {
                // After the update is successful, update parent's displayName
                setDisplayNameAction(newName);
            }
        }, 500),
        [setDisplayNameAction]
    );

    // Called on every keystroke
    const handleLocalDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setLocalDisplayName(newName); // update local state instantly
        // Debounce the Supabase update
        updateDisplayNameInSupabase(newName);
    };

    // Toggling seenPublic
    const toggleSeenPublic = async () => {
        const newValue = !seenPublic;
        setSeenPublic(newValue);
        await supabase.from('user_preferences').upsert({
            user_id: user.id,
            seen_public: newValue
        });
    };

    // Toggling picksPublic
    const togglePicksPublic = async () => {
        const newValue = !picksPublic;
        setPicksPublic(newValue);
        await supabase.from('user_preferences').upsert({
            user_id: user.id,
            picks_public: newValue
        });
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

                {/* Display Name Input (debounced update) */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seen Movies Public</label>
                    <label htmlFor="toggle-seen" className="flex items-center cursor-pointer">
                        <input
                            id="toggle-seen"
                            type="checkbox"
                            className="sr-only"
                            checked={seenPublic}
                            onChange={toggleSeenPublic}
                        />
                        <div
                            className={`block w-10 h-6 rounded-full ${seenPublic ? 'bg-green-600' : 'bg-gray-300'}`}
                        />
                        <span className="ml-3 text-sm">{seenPublic ? 'Visible' : 'Hidden'}</span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Picks Public</label>
                    <label htmlFor="toggle-picks" className="flex items-center cursor-pointer">
                        <input
                            id="toggle-picks"
                            type="checkbox"
                            className="sr-only"
                            checked={picksPublic}
                            onChange={togglePicksPublic}
                        />
                        <div
                            className={`block w-10 h-6 rounded-full ${picksPublic ? 'bg-green-600' : 'bg-gray-300'}`}
                        />
                        <span className="ml-3 text-sm">{picksPublic ? 'Visible' : 'Hidden'}</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

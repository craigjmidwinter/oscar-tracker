import { User } from "@supabase/supabase-js";
import { LogIn, Share, Settings } from "lucide-react";

interface PageHeaderProps {
    user: User | null;
    displayName: string;
    readOnly: boolean;
    shareAction: () => void;
    settingsAction: () => void;
    signOutAction: () => Promise<void>;
    signInAction: () => void;
}

export function PageHeader({
                               user,
                               displayName,
                               readOnly,
                               shareAction,
                               settingsAction,
                               signOutAction,
                               signInAction,
                           }: PageHeaderProps) {
    return (
        <header className="bg-white shadow-md py-4">
            <div className="container mx-auto px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                {/* Left side: Title + Subtitle */}
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold header-font">oscar-tracker.com</h1>
                </div>

                {/* Right side: Controls (Share, Settings, etc.) */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
              <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                👋 {displayName || user.email?.split("@")[0]}
              </span>

                            {/* Share Button (hidden in readOnly mode) */}
                            {!readOnly && (
                                <button
                                    onClick={shareAction}
                                    className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
                                >
                                    <Share size={18} />
                                    Share
                                </button>
                            )}

                            {/* Settings Button */}
                            <button
                                onClick={settingsAction}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <Settings size={22} />
                            </button>

                            {/* Sign Out */}
                            <button
                                onClick={signOutAction}
                                className="text-sm text-gray-700 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={signInAction}
                            className="flex items-center gap-2 bg-green-600 text-white text-lg px-6 py-3 rounded-md shadow-md hover:bg-green-700 transition"
                        >
                            <LogIn size={20} />
                            Sign in to track your picks!
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

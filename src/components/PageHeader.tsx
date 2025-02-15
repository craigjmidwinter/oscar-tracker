import { User } from "@supabase/supabase-js";
import { LogIn, Share, Settings } from "lucide-react";

export function PageHeader(props: {
    user: User | null;
    displayName: string;
    readOnly: boolean;
    shareAction: () => void;
    settingsAction: () => void;
    signOutAction: () => Promise<void>;
    signInAction: () => void;
}) {
    return (
        <header className="bg-white shadow-md py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">

                <h1 className="text-4xl font-bold header-font">oscar-tracker.com</h1>

                <div className="flex items-center gap-4">
                    {props.user ? (
                        <>
                            <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                                👋 {props.displayName || props.user.email?.split("@")[0]}
                            </span>

                            {!props.readOnly && (
                                <button
                                    onClick={props.shareAction}
                                    className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
                                >
                                    <Share size={18} />
                                    Share
                                </button>
                            )}

                            {/* Settings Button */}
                            <button
                                onClick={props.settingsAction}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <Settings size={22} />
                            </button>

                            <button
                                onClick={props.signOutAction}
                                className="text-sm text-gray-700 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={props.signInAction}
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

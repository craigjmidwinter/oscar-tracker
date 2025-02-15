import {User} from "@supabase/supabase-js";
import {LogIn, Share} from "lucide-react";

export function PageHeader(props: {
    user: User | null,
    readOnly: boolean,
    onClick: () => void,
    onClick1: () => Promise<void>,
    onClick2: () => void
}) {
    return <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-4xl font-bold header-font">oscar-tracker.com</h1>

            <div className="flex items-center gap-4">
                {props.user ? (
                    <>
                                <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                                    👋 {props.user.email?.split("@")[0]}
                                </span>
                        {/* Share Button */}
                        {!props.readOnly && (
                            <button
                                onClick={props.onClick}
                                className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
                            >
                                <Share size={18}/>
                                Share
                            </button>
                        )}
                        <button
                            onClick={props.onClick1}
                            className="text-sm text-gray-700 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <button
                        onClick={props.onClick2}
                        className="flex items-center gap-2 bg-green-600 text-white text-lg px-6 py-3 rounded-md shadow-md hover:bg-green-700 transition"
                    >
                        <LogIn size={20}/>
                        Sign Up / Log In
                    </button>
                )}
            </div>
        </div>
    </header>;
}
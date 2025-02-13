import { useEffect, useState } from "react"

export function MergeSeenMoviesModal({
                                         localMovies,
                                         serverMovies,
                                         onSelect,
                                     }: {
    localMovies: Set<string>
    serverMovies: Set<string>
    onSelect: (selected: "local" | "server") => void
}) {
    const [selectedOption, setSelectedOption] = useState<"local" | "server" | null>(null)

    useEffect(() => {
        if (selectedOption) {
            onSelect(selectedOption)
        }
    }, [selectedOption, onSelect])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                <h2 className="text-lg font-semibold mb-4">Choose Your Seen Movies</h2>
                <p className="mb-4">We found different seen movies locally and on your account. Which list do you want to keep?</p>

                <div className="flex gap-4">
                    {/* Local Movies List */}
                    <div className="w-1/2 border rounded-lg p-3">
                        <h3 className="text-md font-semibold mb-2">📁 Local Movies</h3>
                        <div className="h-40 overflow-y-auto border p-2 rounded">
                            {localMovies.size > 0 ? (
                                <ul className="text-sm space-y-1">
                                    {[...localMovies].map((movie) => (
                                        <li key={movie} className="truncate">
                                            {movie}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">No movies saved locally.</p>
                            )}
                        </div>
                    </div>

                    {/* Server Movies List */}
                    <div className="w-1/2 border rounded-lg p-3">
                        <h3 className="text-md font-semibold mb-2">☁️ Account Movies</h3>
                        <div className="h-40 overflow-y-auto border p-2 rounded">
                            {serverMovies.size > 0 ? (
                                <ul className="text-sm space-y-1">
                                    {[...serverMovies].map((movie) => (
                                        <li key={movie} className="truncate">
                                            {movie}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">No movies stored in account.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={() => setSelectedOption("local")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Use Local Movies
                    </button>
                    <button
                        onClick={() => setSelectedOption("server")}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Use Account Movies
                    </button>
                </div>
            </div>
        </div>
    )
}

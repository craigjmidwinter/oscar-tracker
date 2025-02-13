import {Category} from "@/types/types";
import {CategoryCardHeader} from "@/components/CategoryCard/Header";

interface Props {
    category: Category;
    seenMovies: Set<string>;
    updatePick: (categoryId: string, nomineeId: string, type: "think" | "hope") => void;
    userPicks: { [categoryId: string]: { think: string | null; hope: string | null } }
}

export function CategoryCard({category, seenMovies, updatePick, userPicks}: Props) {


    const total = category.nominees?.length || 0
    const watched = category.nominees?.filter(n => seenMovies.has(n.movie.id)).length || 0
    const progress = Math.round((watched / total) * 100)
    return (
        <div
            key={category.id}
            className="break-inside-avoid bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100"
            // style={{columnBreakInside: 'avoid'}}
        >
            <CategoryCardHeader name={category.name} watched={watched} total={total} progress={progress}/>

            {/* Nominees List */}
            <div className="space-y-2">
                {category.nominees?.map(nominee => (
                    <div
                        key={nominee.id}
                        className={`group p-3 rounded-lg flex items-start justify-between ${
                            seenMovies.has(nominee.movie.id)
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    >
                        {/* Text Content */}
                        <div className="flex-1 min-w-0 mr-2">
                            <h3 className="text-sm font-medium text-gray-900 whitespace-normal">
                                {nominee.name}
                            </h3>
                            <p className="text-xs text-gray-500 whitespace-normal mt-1">
                                {nominee.movie.title}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                            <button
                                onClick={() => updatePick(category.id, nominee.id, "think")}
                                className={`p-2 rounded-md transition-colors ${
                                    userPicks[category.id]?.think === nominee.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-blue-100'
                                }`}
                            >
                                <span className="text-sm block">🧠</span>
                            </button>
                            <button
                                onClick={() => updatePick(category.id, nominee.id, "hope")}
                                className={`p-2 rounded-md transition-colors ${
                                    userPicks[category.id]?.hope === nominee.id
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-pink-100'
                                }`}
                            >
                                <span className="text-sm block">❤️</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

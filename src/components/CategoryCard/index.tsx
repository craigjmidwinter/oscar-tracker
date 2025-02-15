'use client';

import { Category } from "@/types/types";
import { CategoryCardHeader } from "@/components/CategoryCard/Header";

interface Props {
    category: Category;
    seenMovies: Set<string>;
    updatePick: (
        categoryId: string,
        nomineeId: string,
        type: "think" | "hope"
    ) => void;
    userPicks: { [categoryId: string]: { think: string | null; hope: string | null } };
    readOnly?: boolean;
}

export function CategoryCard({
                                 category,
                                 seenMovies,
                                 updatePick,
                                 userPicks,
                                 readOnly = false,
                             }: Props) {
    const total = category.nominees?.length || 0;
    const watched = category.nominees?.filter((n) => seenMovies.has(n.movie.id)).length || 0;
    const progress = Math.round((watched / total) * 100);

    // If all nominees are watched, show a golden background
    const containerClasses = `
    break-inside-avoid p-4 mb-4 rounded-xl shadow-lg relative
    ${
        watched === total
            ? "bg-gradient-to-r from-yellow-200 to-yellow-400 border-4 border-yellow-500"
            : "bg-white border border-gray-100"
    }
  `;

    return (
        <div key={category.id} className={containerClasses}>
            {/* Header */}
            <CategoryCardHeader
                name={category.name}
                watched={watched}
                total={total}
                progress={progress}
            />

            {/* Nominees List */}
            <div className="space-y-2">
                {category.nominees?.map((nominee) => {
                    const isSeen = seenMovies.has(nominee.movie.id);

                    // If the user has seen this nominee's movie, use a gold highlight
                    const nomineeClasses = isSeen
                        ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300"
                        : "bg-gray-50 hover:bg-gray-100";

                    return (
                        <div
                            key={nominee.id}
                            className={`group p-3 rounded-lg flex items-start justify-between transition-colors ${nomineeClasses}`}
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
                                    onClick={() => !readOnly && updatePick(category.id, nominee.id, "think")}
                                    disabled={readOnly}
                                    className={`p-2 rounded-md transition-colors ${
                                        userPicks[category.id]?.think === nominee.id
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-600 hover:bg-blue-100"
                                    }`}
                                >
                                    <span className="text-sm block">🧠</span>
                                </button>
                                <button
                                    onClick={() => !readOnly && updatePick(category.id, nominee.id, "hope")}
                                    disabled={readOnly}
                                    className={`p-2 rounded-md transition-colors ${
                                        userPicks[category.id]?.hope === nominee.id
                                            ? "bg-pink-500 text-white"
                                            : "bg-gray-200 text-gray-600 hover:bg-pink-100"
                                    }`}
                                >
                                    <span className="text-sm block">❤️</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

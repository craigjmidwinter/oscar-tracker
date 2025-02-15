'use client'

import { useEffect, useState } from "react";
import type { Nominee } from "@/types/types";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/auth";
import { CategoryCard } from "@/components/CategoryCard";

interface CategoryListProps {
    nominees: Nominee[];
    seenMovies: Set<string>;
    readOnly?: boolean;
    sharedUserId?: string;
}

export function CategoryList({ nominees, seenMovies, readOnly = false, sharedUserId }: CategoryListProps) {
    const { user } = useAuth();
    const [userPicks, setUserPicks] = useState<{
        [categoryId: string]: {
            think: string | null;
            hope: string | null;
        }
    }>({});

    useEffect(() => {
        // Determine which user id to load picks for:
        const idToLoad = readOnly ? sharedUserId : user?.id;
        console.log("CategoryList: Loading picks for id:", idToLoad);
        if (!idToLoad) return;

        const fetchUserPicks = async () => {
            const { data, error } = await supabase
                .from('user_picks')
                .select('category_id, think_will_win, hope_will_win')
                .eq('user_id', idToLoad);
            if (error) {
                console.error("Error fetching user picks:", error);
                return;
            }
            console.log("Fetched user picks data:", data);
            const picksMap = data.reduce((acc, pick) => ({
                ...acc,
                [pick.category_id]: {
                    think: pick.think_will_win,
                    hope: pick.hope_will_win
                }
            }), {});
            setUserPicks(picksMap);
        };

        fetchUserPicks();
    }, [user?.id, readOnly, sharedUserId]);

    // Group nominees into categories.
    const categories = Array.from(
        nominees.reduce((map, nominee) => {
            const category = nominee.category;
            if (!map.has(category.id)) {
                map.set(category.id, {
                    id: category.id,
                    name: category.name,
                    created_at: category.created_at ?? null,
                    type: category.type ?? null,
                    nominees: []
                });
            }
            map.get(category.id)!.nominees.push(nominee);
            return map;
        }, new Map<string, {
            id: string;
            name: string;
            created_at: string | null;
            type: string | null;
            nominees: Nominee[];
        }>()).values()
    );

    return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 p-4 w-full space-y-4">
            {categories.map((category, i) => (
                <CategoryCard
                    key={i}
                    category={category}
                    seenMovies={seenMovies}
                    updatePick={async (catId, nomineeId, type) => {
                        // Only allow updates if not readOnly
                        if (readOnly || !user?.id) return;
                        // You may consider adding debug logs here as well.
                        console.log(`Updating pick for category ${catId}, nominee ${nomineeId}, type ${type}`);
                        // Call the updatePick function from this component (if needed)
                    }}
                    userPicks={userPicks}
                    readOnly={readOnly}
                />
            ))}
        </div>
    );
}

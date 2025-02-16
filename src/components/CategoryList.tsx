"use client";

import { useEffect, useState } from "react";
import type { Category, Nominee } from "@/types/types";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/auth";
import { CategoryCard } from "@/components/CategoryCard";

interface CategoryListProps {
    nominees: Nominee[];
    seenMovies: Set<string>;
    readOnly?: boolean;
    sharedUserId?: string;
}

export function CategoryList({
                                 nominees,
                                 seenMovies,
                                 readOnly = false,
                                 sharedUserId,
                             }: CategoryListProps) {
    const { user } = useAuth();
    const [userPicks, setUserPicks] = useState<{
        [categoryId: string]: { think: string | null; hope: string | null };
    }>({});

    // Called when a user picks "think" or "hope"
    const updatePick = async (
        categoryId: string,
        nomineeId: string,
        type: "think" | "hope"
    ) => {
        if (!user?.id) return;

        setUserPicks((prev) => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                [type]: prev[categoryId]?.[type] === nomineeId ? null : nomineeId,
            },
        }));

        try {
            await supabase.from("user_picks").upsert({
                user_id: user.id,
                category_id: categoryId,
                think_will_win:
                    type === "think"
                        ? userPicks[categoryId]?.think === nomineeId
                            ? null
                            : nomineeId
                        : userPicks[categoryId]?.think,
                hope_will_win:
                    type === "hope"
                        ? userPicks[categoryId]?.hope === nomineeId
                            ? null
                            : nomineeId
                        : userPicks[categoryId]?.hope,
            });
        } catch (error) {
            console.error("Failed to update pick:", error);
        }
    };

    // Fetch picks for readOnly or logged-in user
    useEffect(() => {
        const idToLoad = readOnly ? sharedUserId : user?.id;
        if (!idToLoad) return;

        (async () => {
            const { data, error } = await supabase
                .from("user_picks")
                .select("category_id, think_will_win, hope_will_win")
                .eq("user_id", idToLoad);

            if (error) {
                console.error("Error fetching user picks:", error);
                return;
            }

            const picksMap = (data || []).reduce((acc, pick) => {
                return {
                    ...acc,
                    [pick.category_id]: {
                        think: pick.think_will_win,
                        hope: pick.hope_will_win,
                    },
                };
            }, {} as { [key: string]: { think: string | null; hope: string | null } });

            setUserPicks(picksMap);
        })();
    }, [user?.id, readOnly, sharedUserId]);

    // Group nominees by category
    const categories = Array.from(
        nominees.reduce((map, nominee) => {
            const cat = nominee.category;
            if (!map.has(cat.id)) {
                map.set(cat.id, {
                    id: cat.id,
                    name: cat.name,
                    type: cat.type ?? null,
                    created_at: cat.created_at ?? null,
                    sort_order: cat.sort_order ?? null,
                    nominees: [] as Nominee[],
                } as Category);
            }
            map.get(cat.id)!.nominees!.push(nominee);
            return map;
        }, new Map<string, Category>()).values()
    );

    // Sort by sort_order if present
    categories.sort((a, b) => {
        const orderA = a.sort_order ?? 9999;
        const orderB = b.sort_order ?? 9999;
        return orderA - orderB;
    });

    // We want 2 columns max: grid-cols-1 for small, grid-cols-2 for medium+.
    // If a category has more than 5 nominees, it spans both columns (md:col-span-2).
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full">
            {categories.map((category) => {
                if(!category.nominees) return null;
                const colSpanClass =
                    category.nominees.length > 5 ? "md:col-span-2" : "md:col-span-1";

                return (
                    <div key={category.id} className={colSpanClass}>
                        <CategoryCard
                            category={category}
                            seenMovies={seenMovies}
                            updatePick={(catId, nomineeId, type) => {
                                if (readOnly || !user?.id) return;
                                updatePick(catId, nomineeId, type);
                            }}
                            userPicks={userPicks}
                            readOnly={readOnly}
                        />
                    </div>
                );
            })}
        </div>
    );
}

// app/components/CategoryList.tsx
'use client'

import {useEffect, useState} from "react"
import type {Nominee} from "@/types/types"
import {supabase} from "@/utils/supabase"
import {useAuth} from "@/context/auth"
import {CategoryCard} from "@/components/CategoryCard";

export function CategoryList({nominees, seenMovies}: {
    nominees: Nominee[];
    seenMovies: Set<string>
}) {
    const {user} = useAuth()
    const [userPicks, setUserPicks] = useState<{
        [categoryId: string]: {
            think: string | null;
            hope: string | null
        }
    }>({})

    useEffect(() => {
        if (!user?.id) return

        const fetchUserPicks = async () => {
            const {data, error} = await supabase
                .from('user_picks')
                .select('category_id, think_will_win, hope_will_win')
                .eq('user_id', user.id)

            if (error) {
                console.error("Error fetching user picks:", error)
                return
            }

            const picksMap = data.reduce((acc, pick) => ({
                ...acc,
                [pick.category_id]: {
                    think: pick.think_will_win,
                    hope: pick.hope_will_win
                }
            }), {})

            setUserPicks(picksMap)
        }

        fetchUserPicks()
    }, [user?.id])

    const updatePick = async (categoryId: string, nomineeId: string, type: "think" | "hope") => {
        if (!user?.id) return

        setUserPicks(prev => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                [type]: prev[categoryId]?.[type] === nomineeId ? null : nomineeId
            }
        }))

        try {
            await supabase
                .from('user_picks')
                .upsert({
                    user_id: user.id,
                    category_id: categoryId,
                    think_will_win: type === "think"
                        ? userPicks[categoryId]?.think === nomineeId
                            ? null
                            : nomineeId
                        : userPicks[categoryId]?.think,
                    hope_will_win: type === "hope"
                        ? userPicks[categoryId]?.hope === nomineeId
                            ? null
                            : nomineeId
                        : userPicks[categoryId]?.hope
                })
        } catch (error) {
            console.error("Failed to update pick:", error)
        }
    }

    const categories = Array.from(
        nominees.reduce((map, nominee) => {
            const category = nominee.category
            if (!map.has(category.id)) {
                map.set(category.id, {
                    id: category.id,
                    name: category.name,
                    nominees: []
                })
            }
            map.get(category.id)!.nominees.push(nominee)
            return map
        }, new Map<string, {
            id: string;
            name: string;
            nominees: Nominee[]
        }>()).values()
    )
    return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 p-4 w-full space-y-4">
            {categories.map((category, i) => {

                return (
                    <CategoryCard
                        key={i}
                        category={category}
                        seenMovies={seenMovies}
                        updatePick={updatePick}
                        userPicks={userPicks}
                    />
                )
            })}
        </div>
    )
}
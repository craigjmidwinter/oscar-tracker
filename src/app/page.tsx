import { createClient } from "@supabase/supabase-js"
import { MovieList } from "@/components/MovieList"
import { Layout } from "@/components/Layout"
import { CategoryList } from "@/components/CategoryList"
import { AuthProvider } from "@/context/auth"
import { SeenMoviesProvider } from "@/context/SeenMoviesContext"
import { Database } from "@/types/schema"
import {Category, Movie, Nominee} from "@/types/types"

export default async function OscarPicks() {
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: rawNominees } = await supabase
        .from('nominees')
        .select(`
      id,
      name,
      movie:movies!inner(id, title),
      category:categories!inner(id, name)
    `)

    // ✅ Transform to match the Nominee type
    const nominees: Nominee[] = rawNominees?.map(nominee => ({
        id: nominee.id,
        name: nominee.name,
        movie: {
            id: nominee.movie?.id ?? "",
            title: nominee.movie?.title ?? "Unknown",
        } as Movie,
        category: {
            id: nominee.category?.id ?? "",
            name: nominee.category?.name ?? "Unknown",
        } as Category,
        category_id: nominee.category?.id ?? null,
        created_at: null,
        is_winner: null, // Default value (not stored in DB)
        movie_id: nominee.movie?.id ?? null
    })) ?? []

    if (!nominees) {
        return <div>Loading...</div>
    }

    return (
        <AuthProvider>
            <SeenMoviesProvider>
                <Layout
                    MovieListComponent={MovieList}
                    CategoryListComponent={CategoryList}
                    nominees={nominees}
                />
            </SeenMoviesProvider>
        </AuthProvider>
    )
}
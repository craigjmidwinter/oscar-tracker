import { createClient } from "@supabase/supabase-js"
import { MovieList } from "@/components/MovieList"
import { Layout } from "@/components/Layout"
import { CategoryList } from "@/components/CategoryList"
import { AuthProvider } from "@/context/auth"
import { SeenMoviesProvider } from "@/context/SeenMoviesContext"
import { Database } from "@/types/schema"
import {  Nominee} from "@/types/types"

export default async function OscarPicks() {
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: nominees } = await supabase
        .from('nominees')
        .select(`
      id,
      name,
      movie:movies!inner(id, title),
      category:categories!inner(id, name)
    `)

    return (
        <AuthProvider>
            <SeenMoviesProvider>
                <Layout
                    MovieListComponent={MovieList}
                    CategoryListComponent={CategoryList}
                    nominees={nominees as Nominee[]}
                />
            </SeenMoviesProvider>
        </AuthProvider>
    )
}
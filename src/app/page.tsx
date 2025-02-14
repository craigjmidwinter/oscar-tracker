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

    const { data: nominees, error } = await supabase
        .from('nominees')
        .select(`
      id,
      name,
      movie:movies!inner(id, title),
      category:categories!inner(id, name)
    `)

    if (error) {
        return (
            <div>
                <h1>Error fetching nominees</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        )
    }

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
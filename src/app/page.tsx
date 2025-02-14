import { MovieList } from "@/components/MovieList"
import { Layout } from "@/components/Layout"
import { CategoryList } from "@/components/CategoryList"
import { AuthProvider } from "@/context/auth"
import { SeenMoviesProvider } from "@/context/SeenMoviesContext"

export default async function OscarPicks() {

    return (
        <AuthProvider>
            <SeenMoviesProvider>
                <Layout
                    MovieListComponent={MovieList}
                    CategoryListComponent={CategoryList}
                />
            </SeenMoviesProvider>
        </AuthProvider>
    )
}
//src/app/page.tsx
import { Layout } from "@/components/Layout"
import { AuthProvider } from "@/context/auth"
import { SeenMoviesProvider } from "@/context/SeenMoviesContext"
import {supabase} from "@/utils/supabase";
import {Nominee} from "@/types/types";

export default async function OscarPicks() {

    const { data: nominees } = await supabase
        .from('nominees')
        .select(`
    id,
    name,
    movie:movies!inner(id, title),
    category:categories!inner(id, name, sort_order)
  `);

    return (
        <AuthProvider>
            <SeenMoviesProvider>
                <Layout
                    nominees={nominees as Nominee[]}
                />
            </SeenMoviesProvider>
        </AuthProvider>
    )
}
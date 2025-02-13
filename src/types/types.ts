
// ✅ Alias Supabase database types for clarity
import {Database} from "@/types/schema";

export type Movie = Database["public"]["Tables"]["movies"]["Row"] & {
    nominations?: number // Supabase doesn't track this, so make it optional
    seen?: boolean // Supabase doesn't track this, so make it optional
}

export type Category = Database["public"]["Tables"]["categories"]["Row"] & {
    nominees?: Nominee[] // Ensure this type is linked correctly
}

export type Nominee = Database["public"]["Tables"]["nominees"]["Row"] & {
    movie: Movie
    category: Category
}

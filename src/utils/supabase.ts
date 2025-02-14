// utils/supabase.ts
import { createClient } from '@supabase/supabase-js'
import {Database} from "@/types/schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Helper function to get user session on server
export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

// Helper function to get user data
export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
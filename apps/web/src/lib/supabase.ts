import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          category: string | null
          content: string
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          category?: string | null
          content: string
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string | null
          content?: string
          source?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
      }
    }
  }
}

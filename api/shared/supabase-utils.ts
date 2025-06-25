import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function getSupabaseClient() {
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
}

export async function updateNoteMetadata(noteId: string, updates: Record<string, unknown>) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)

  if (error) {
    console.error('Database update error:', error)
    throw new Error('Database update error')
  }
}

export const validCategories = ['task', 'idea', 'journal', 'meeting', 'reading', 'misc']
import { createBrowserClient } from '@supabase/ssr'
import mockSupabase from './mock-client'

// Supabase URLとキーが設定されているか確認
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')

export function createClient() {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured. Using mock client.')
    return mockSupabase as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
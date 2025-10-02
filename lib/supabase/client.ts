import { createBrowserClient } from '@supabase/ssr'
import mockSupabase from './mock-client'

// Supabase URLが無効な場合はモッククライアントを使用
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://qligfarbbfsbyarihnxw.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
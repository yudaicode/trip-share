import { createBrowserClient } from '@supabase/ssr'
import mockSupabase from './mock-client'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Supabase config check:', {
    url: supabaseUrl || 'missing',
    keyPresent: !!supabaseKey,
    keyLength: supabaseKey?.length || 0
  })

  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('https://')) {
    console.warn('⚠️ Supabase not configured. Using mock client.')
    return mockSupabase as any
  }

  console.log('✅ Using real Supabase client')
  return createBrowserClient(supabaseUrl, supabaseKey)
}
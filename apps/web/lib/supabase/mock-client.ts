// モック用Supabaseクライアント（開発用）
// 実際のSupabaseが利用できない場合のフォールバック

export const mockSupabase = {
  auth: {
    getSession: async () => ({
      data: {
        session: null
      },
      error: null
    }),
    signInWithPassword: async ({ email, password }: any) => ({
      data: {
        user: {
          id: 'mock-user-id',
          email: email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'mock-user-id',
            email: email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          }
        }
      },
      error: null
    }),
    signUp: async ({ email, password }: any) => ({
      data: {
        user: {
          id: 'mock-user-id',
          email: email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        },
        session: null
      },
      error: null
    }),
    signOut: async () => ({
      error: null
    }),
    onAuthStateChange: (callback: any) => {
      // モックでは何もしない
      return {
        data: { subscription: { unsubscribe: () => {} } }
      }
    }
  },
  from: (table: string) => ({
    select: () => ({
      data: [],
      error: null,
      eq: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null })
    }),
    insert: (data: any) => ({
      data: data,
      error: null,
      select: () => ({ data: [data], error: null })
    }),
    update: (data: any) => ({
      eq: () => ({ data: [data], error: null })
    }),
    delete: () => ({
      eq: () => ({ data: [], error: null })
    })
  })
}

console.warn('⚠️ Using mock Supabase client. Configure real Supabase for production.')

export default mockSupabase
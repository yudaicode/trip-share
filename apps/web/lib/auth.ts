import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
        twoFactorToken: { label: "2FAコード", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードを入力してください")
        }

        const supabase = await createClient()

        // プロフィールからユーザーを検索（2FA情報も含めて取得）
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, email, password_hash, full_name, avatar_url, username, two_factor_enabled')
          .eq('email', credentials.email)
          .single()

        if (error || !profile) {
          throw new Error("メールアドレスまたはパスワードが正しくありません")
        }

        if (!profile.password_hash) {
          throw new Error("このアカウントはソーシャルログインで登録されています")
        }

        // パスワードを検証
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          profile.password_hash
        )

        if (!isPasswordValid) {
          throw new Error("メールアドレスまたはパスワードが正しくありません")
        }

        // 2FAが有効な場合
        if (profile.two_factor_enabled) {
          // 2FAトークンが提供されていない場合
          if (!credentials.twoFactorToken) {
            throw new Error("2FA_REQUIRED")
          }

          // 2FAトークンを検証
          try {
            const verifyResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/2fa/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                token: credentials.twoFactorToken
              })
            })

            const verifyResult = await verifyResponse.json()

            if (!verifyResponse.ok || !verifyResult.valid) {
              throw new Error("検証コードが正しくありません")
            }
          } catch (error) {
            throw new Error("検証コードが正しくありません")
          }
        }

        return {
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.username,
          image: profile.avatar_url,
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        const supabase = await createClient()

        // GoogleまたはCredentialsプロバイダーの場合
        if (account?.provider === 'google') {
          // profilesテーブルにユーザー情報を保存（存在しない場合のみ）
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!existingProfile) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.name || user.email,
                avatar_url: user.image,
                username: user.email?.split('@')[0],
              })

            if (insertError) {
              console.error('Error creating profile:', insertError)
            }
          }
        }

        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
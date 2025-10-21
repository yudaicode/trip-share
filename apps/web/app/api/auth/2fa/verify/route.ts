import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { authenticator } from "otplib"
import bcrypt from "bcryptjs"

// ログイン時の2FA検証
export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: "メールアドレスと検証コードを入力してください" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // ユーザー情報を取得
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, two_factor_secret, two_factor_enabled, two_factor_backup_codes")
      .eq("email", email)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    if (!profile.two_factor_enabled || !profile.two_factor_secret) {
      return NextResponse.json(
        { error: "2段階認証が有効ではありません" },
        { status: 400 }
      )
    }

    // TOTP検証
    const isValidToken = authenticator.verify({
      token,
      secret: profile.two_factor_secret,
    })

    if (isValidToken) {
      return NextResponse.json({
        valid: true,
        userId: profile.id,
      })
    }

    // バックアップコードを確認
    if (profile.two_factor_backup_codes && profile.two_factor_backup_codes.length > 0) {
      for (let i = 0; i < profile.two_factor_backup_codes.length; i++) {
        const hashedCode = profile.two_factor_backup_codes[i]
        const isValidBackupCode = await bcrypt.compare(token, hashedCode)

        if (isValidBackupCode) {
          // 使用済みバックアップコードを削除
          const updatedBackupCodes = profile.two_factor_backup_codes.filter(
            (_code: string, index: number) => index !== i
          )

          await supabase
            .from("profiles")
            .update({ two_factor_backup_codes: updatedBackupCodes })
            .eq("id", profile.id)

          return NextResponse.json({
            valid: true,
            userId: profile.id,
            usedBackupCode: true,
          })
        }
      }
    }

    return NextResponse.json(
      { error: "検証コードが正しくありません" },
      { status: 400 }
    )
  } catch (error) {
    console.error("2FA検証エラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

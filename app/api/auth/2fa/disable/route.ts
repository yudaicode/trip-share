import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

// 2FA無効化
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: "パスワードを入力してください" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // パスワードを確認
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("password_hash, two_factor_enabled")
      .eq("id", session.user.id)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: "プロフィール情報の取得に失敗しました" },
        { status: 500 }
      )
    }

    if (!profile.two_factor_enabled) {
      return NextResponse.json(
        { error: "2段階認証は有効ではありません" },
        { status: 400 }
      )
    }

    if (!profile.password_hash) {
      return NextResponse.json(
        { error: "パスワード認証が設定されていません" },
        { status: 400 }
      )
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, profile.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 400 }
      )
    }

    // 2FAを無効化
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
      })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("2FA無効化エラー:", updateError)
      return NextResponse.json(
        { error: "2FAの無効化に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "2段階認証が無効になりました",
    })
  } catch (error) {
    console.error("2FA無効化エラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { authenticator } from "otplib"

// 2FA有効化（検証コードを確認してから有効化）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "検証コードを入力してください" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 秘密鍵を取得
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("two_factor_secret, two_factor_enabled")
      .eq("id", session.user.id)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: "プロフィール情報の取得に失敗しました" },
        { status: 500 }
      )
    }

    if (profile.two_factor_enabled) {
      return NextResponse.json(
        { error: "2段階認証は既に有効です" },
        { status: 400 }
      )
    }

    if (!profile.two_factor_secret) {
      return NextResponse.json(
        { error: "2FA設定が見つかりません。最初にセットアップしてください" },
        { status: 400 }
      )
    }

    // トークンを検証
    const isValid = authenticator.verify({
      token,
      secret: profile.two_factor_secret,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: "検証コードが正しくありません" },
        { status: 400 }
      )
    }

    // 2FAを有効化
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ two_factor_enabled: true })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("2FA有効化エラー:", updateError)
      return NextResponse.json(
        { error: "2FAの有効化に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "2段階認証が有効になりました",
    })
  } catch (error) {
    console.error("2FA有効化エラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

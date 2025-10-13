import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { authenticator } from "otplib"
import QRCode from "qrcode"
import bcrypt from "bcryptjs"

// 2FA設定を開始（QRコード生成）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const supabase = await createClient()

    // 既に2FAが有効か確認
    const { data: profile } = await supabase
      .from("profiles")
      .select("two_factor_enabled")
      .eq("id", session.user.id)
      .single()

    if (profile?.two_factor_enabled) {
      return NextResponse.json(
        { error: "2段階認証は既に有効です" },
        { status: 400 }
      )
    }

    // 秘密鍵を生成
    const secret = authenticator.generateSecret()

    // OTPAuthのURLを生成
    const otpauthUrl = authenticator.keyuri(
      session.user.email || session.user.id,
      "タビネタ",
      secret
    )

    // QRコードを生成
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

    // バックアップコードを生成（10個）
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    // バックアップコードをハッシュ化
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10))
    )

    // 一時的に秘密鍵を保存（まだ有効化されていない）
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        two_factor_secret: secret,
        two_factor_backup_codes: hashedBackupCodes,
        two_factor_enabled: false, // まだ無効のまま
      })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("2FA設定保存エラー:", updateError)
      return NextResponse.json(
        { error: "2FA設定の保存に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      secret,
      qrCode: qrCodeDataUrl,
      backupCodes, // プレーンテキストで返す（ユーザーに保存してもらう）
    })
  } catch (error) {
    console.error("2FA設定エラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

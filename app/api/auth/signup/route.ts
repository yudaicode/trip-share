import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "メールアドレス、パスワード、お名前を入力してください" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で入力してください" },
        { status: 400 }
      )
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 既存ユーザーチェック
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザー名を生成（メールアドレスの@前部分 + ランダム数字）
    const username = email.split("@")[0] + Math.floor(Math.random() * 10000)

    // ユーザーIDを生成（UUIDの代わりにランダム文字列）
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // プロフィールを作成
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        full_name: name,
        username: username,
        avatar_url: null,
      })
      .select()
      .single()

    if (insertError) {
      console.error("プロフィール作成エラー:", insertError)
      return NextResponse.json(
        { error: "アカウントの作成に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "アカウントが作成されました",
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("サインアップエラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

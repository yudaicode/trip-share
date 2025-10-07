import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "メールアドレス、パスワード、名前は必須です" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上である必要があります" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // メールアドレスの重複チェック
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザー名を生成（メールアドレスの@前部分）
    const username = email.split('@')[0]

    // ユニークなIDを生成（タイムスタンプ + ランダム文字列）
    const userId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // プロフィールを作成
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        password_hash: hashedPassword,
        full_name: name,
        username: username,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating profile:', insertError)
      return NextResponse.json(
        { error: "ユーザー登録に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "ユーザー登録が完了しました",
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.full_name
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました" },
      { status: 500 }
    )
  }
}

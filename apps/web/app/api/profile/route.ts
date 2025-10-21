import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    const { username, full_name, bio, avatar_url } = body

    // バリデーション
    if (username && username.length < 3) {
      return NextResponse.json(
        { error: "ユーザー名は3文字以上である必要があります" },
        { status: 400 }
      )
    }

    // ユーザー名の重複チェック
    if (username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', session.user.id)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: "このユーザー名は既に使用されています" },
          { status: 400 }
        )
      }
    }

    // 更新データを準備
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (username !== undefined) updateData.username = username
    if (full_name !== undefined) updateData.full_name = full_name
    if (bio !== undefined) updateData.bio = bio
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// フォロー状態を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ isFollowing: false, followerCount: 0, followingCount: 0 })
    }

    const supabase = await createClient()

    // フォロー状態を確認
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', session.user.id)
      .eq('following_id', id)
      .single()

    // フォロワー数を取得
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', id)

    // フォロー中の数を取得
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', id)

    return NextResponse.json({
      isFollowing: !!follow,
      followerCount: followerCount || 0,
      followingCount: followingCount || 0
    })
  } catch (error) {
    console.error("Error checking follow status:", error)
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    )
  }
}

// フォローする
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 自分自身をフォローできない
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // フォロー関係を作成
    const { error: insertError } = await supabase
      .from('follows')
      .insert({
        follower_id: session.user.id,
        following_id: id
      })

    if (insertError) {
      // 既にフォロー済みの場合はエラーを返す
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: "Already following" },
          { status: 400 }
        )
      }
      console.error("Error creating follow:", insertError)
      return NextResponse.json(
        { error: "Failed to follow" },
        { status: 500 }
      )
    }

    // 通知を作成
    await supabase
      .from('notifications')
      .insert({
        user_id: id,
        type: 'follow',
        content: 'があなたをフォローしました',
        from_user_id: session.user.id,
        is_read: false
      })

    return NextResponse.json({ message: "Followed successfully" })
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json(
      { error: "Failed to follow" },
      { status: 500 }
    )
  }
}

// フォロー解除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    // フォロー関係を削除
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', session.user.id)
      .eq('following_id', id)

    if (deleteError) {
      console.error("Error unfollowing:", deleteError)
      return NextResponse.json(
        { error: "Failed to unfollow" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Unfollowed successfully" })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json(
      { error: "Failed to unfollow" },
      { status: 500 }
    )
  }
}

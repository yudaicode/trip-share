import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { id } = await params

    // 既存のいいねを確認
    const { data: existingLike, error: checkError } = await supabase
      .from('trip_likes')
      .select('id')
      .eq('trip_schedule_id', id)
      .eq('user_id', session.user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing like:", checkError)
      return NextResponse.json(
        { error: "Failed to check like status" },
        { status: 500 }
      )
    }

    if (existingLike) {
      // いいねを削除
      const { error: deleteError } = await supabase
        .from('trip_likes')
        .delete()
        .eq('id', existingLike.id)

      if (deleteError) {
        console.error("Error deleting like:", deleteError)
        return NextResponse.json(
          { error: "Failed to unlike" },
          { status: 500 }
        )
      }

      // Get updated likes count
      const { count: likesCount } = await supabase
        .from('trip_likes')
        .select('*', { count: 'exact', head: true })
        .eq('trip_schedule_id', id)

      return NextResponse.json({ isLiked: false, likesCount: likesCount || 0 })
    } else {
      // いいねを追加
      const { error: insertError } = await supabase
        .from('trip_likes')
        .insert({
          trip_schedule_id: id,
          user_id: session.user.id
        })

      if (insertError) {
        console.error("Error creating like:", insertError)
        return NextResponse.json(
          { error: "Failed to like" },
          { status: 500 }
        )
      }

      // 旅行プランの所有者を取得して通知を作成
      const { data: trip } = await supabase
        .from('trip_schedules')
        .select('user_id, title')
        .eq('id', id)
        .single()

      if (trip && trip.user_id !== session.user.id) {
        // 自分自身へのいいねには通知を作成しない
        await supabase
          .from('notifications')
          .insert({
            user_id: trip.user_id,
            type: 'like',
            content: 'があなたの旅行プランにいいねしました',
            trip_schedule_id: id,
            from_user_id: session.user.id,
            is_read: false
          })
      }

      // Get updated likes count
      const { count: likesCount } = await supabase
        .from('trip_likes')
        .select('*', { count: 'exact', head: true })
        .eq('trip_schedule_id', id)

      return NextResponse.json({ isLiked: true, likesCount: likesCount || 0 })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const supabase = await createClient()

    const { id } = await params

    // 合計いいね数を取得
    const { count: likesCount, error: countError } = await supabase
      .from('trip_likes')
      .select('*', { count: 'exact', head: true })
      .eq('trip_schedule_id', id)

    if (countError) {
      console.error("Error getting likes count:", countError)
      return NextResponse.json(
        { error: "Failed to get likes count" },
        { status: 500 }
      )
    }

    // ユーザーがログインしている場合は、ユーザーのいいね状態を確認
    let userLiked = false
    if (session?.user) {
      const { data: userLike, error: userLikeError } = await supabase
        .from('trip_likes')
        .select('id')
        .eq('trip_schedule_id', id)
        .eq('user_id', session.user.id)
        .single()

      if (userLikeError && userLikeError.code !== 'PGRST116') {
        console.error("Error checking user like:", userLikeError)
      } else {
        userLiked = !!userLike
      }
    }

    return NextResponse.json({
      count: likesCount || 0,
      isLiked: userLiked,
    })
  } catch (error) {
    console.error("Error getting likes:", error)
    return NextResponse.json(
      { error: "Failed to get likes" },
      { status: 500 }
    )
  }
}
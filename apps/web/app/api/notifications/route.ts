import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// 通知一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      )
    }

    // 各通知の送信者情報を取得
    const notificationsWithUsers = await Promise.all(
      (notifications || []).map(async (notification) => {
        const { data: fromUser } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', notification.from_user_id)
          .single()

        let tripTitle = null
        if (notification.trip_schedule_id) {
          const { data: trip } = await supabase
            .from('trip_schedules')
            .select('title')
            .eq('id', notification.trip_schedule_id)
            .single()
          tripTitle = trip?.title
        }

        return {
          ...notification,
          from_user: fromUser,
          trip_title: tripTitle
        }
      })
    )

    return NextResponse.json(notificationsWithUsers)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// 通知を作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()
    const { user_id, type, content, trip_schedule_id } = body

    // 自分自身への通知は作成しない
    if (user_id === session.user.id) {
      return NextResponse.json({ message: "Cannot create notification to self" })
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        content,
        trip_schedule_id,
        from_user_id: session.user.id,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating notification:", error)
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

// 通知を既読にする
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()
    const { notification_id, mark_all_as_read } = body

    if (mark_all_as_read) {
      // すべての通知を既読にする
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id)
        .eq('is_read', false)

      if (error) {
        console.error("Error marking all notifications as read:", error)
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: "All notifications marked as read" })
    } else if (notification_id) {
      // 特定の通知を既読にする
      const { data: notification, error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notification_id)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) {
        console.error("Error marking notification as read:", error)
        return NextResponse.json(
          { error: "Failed to mark notification as read" },
          { status: 500 }
        )
      }

      return NextResponse.json(notification)
    }

    return NextResponse.json(
      { error: "notification_id or mark_all_as_read is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

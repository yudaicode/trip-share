import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ブックマークと関連する旅行プランを取得
    const { data: bookmarks, error } = await supabase
      .from('trip_bookmarks')
      .select(`
        id,
        created_at,
        trip_schedule_id
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching bookmarks:", error)
      return NextResponse.json(
        { error: "Failed to fetch bookmarks" },
        { status: 500 }
      )
    }

    // 各ブックマークに対して旅行プランの詳細を取得
    const formattedBookmarks = await Promise.all(
      (bookmarks || []).map(async (bookmark) => {
        // 旅行プランの詳細を取得
        const { data: tripSchedule, error: tripError } = await supabase
          .from('trip_schedules')
          .select('*')
          .eq('id', bookmark.trip_schedule_id)
          .single()

        if (tripError) {
          console.error("Error fetching trip schedule:", tripError)
          return null
        }

        // プロフィール情報を取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', tripSchedule.user_id)
          .single()

        // いいね数とコメント数を取得
        const { count: likesCount } = await supabase
          .from('trip_likes')
          .select('*', { count: 'exact', head: true })
          .eq('trip_schedule_id', tripSchedule.id)

        const { count: commentsCount } = await supabase
          .from('trip_comments')
          .select('*', { count: 'exact', head: true })
          .eq('trip_schedule_id', tripSchedule.id)

        return {
          id: bookmark.id,
          created_at: bookmark.created_at,
          trip_schedule: {
            ...tripSchedule,
            user: {
              id: profile?.id || tripSchedule.user_id,
              name: profile?.full_name || profile?.username || 'Unknown User',
              avatar: profile?.avatar_url
            },
            _count: {
              likes: likesCount || 0,
              comments: commentsCount || 0
            }
          }
        }
      })
    )

    // nullを除外
    const validBookmarks = formattedBookmarks.filter(bookmark => bookmark !== null)

    return NextResponse.json(validBookmarks)
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    )
  }
}
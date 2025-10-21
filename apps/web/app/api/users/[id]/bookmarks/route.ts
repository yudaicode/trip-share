import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    // 認証チェック
    if (!session?.user || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // ブックマークされた旅行プランを取得
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('trip_bookmarks')
      .select('trip_schedule_id')
      .eq('user_id', id)

    if (bookmarksError) {
      console.error("Error fetching bookmarks:", bookmarksError)
      return NextResponse.json(
        { error: "Failed to fetch bookmarks" },
        { status: 500 }
      )
    }

    const tripIds = bookmarks?.map(b => b.trip_schedule_id) || []

    if (tripIds.length === 0) {
      return NextResponse.json([])
    }

    // ブックマークされた旅行プランの詳細を取得
    const { data: trips, error: tripsError } = await supabase
      .from('trip_schedules')
      .select('*')
      .in('id', tripIds)
      .eq('is_public', true)

    if (tripsError) {
      console.error("Error fetching trips:", tripsError)
      return NextResponse.json(
        { error: "Failed to fetch trips" },
        { status: 500 }
      )
    }

    // 各プランのいいね数とコメント数を取得
    const tripsWithCounts = await Promise.all(
      (trips || []).map(async (trip) => {
        const { count: likesCount } = await supabase
          .from('trip_likes')
          .select('*', { count: 'exact', head: true })
          .eq('trip_schedule_id', trip.id)

        const { count: commentsCount } = await supabase
          .from('trip_comments')
          .select('*', { count: 'exact', head: true })
          .eq('trip_schedule_id', trip.id)

        // プロフィール情報を取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', trip.user_id)
          .single()

        return {
          id: trip.id,
          title: trip.title,
          description: trip.description,
          category: trip.category,
          startDate: trip.start_date,
          endDate: trip.end_date,
          travelerCount: trip.traveler_count,
          coverImage: trip.cover_image,
          isPublic: trip.is_public,
          createdAt: trip.created_at,
          user: {
            name: profile?.full_name || profile?.username || 'ゲストユーザー'
          },
          _count: {
            likes: likesCount || 0,
            comments: commentsCount || 0
          }
        }
      })
    )

    return NextResponse.json(tripsWithCounts)
  } catch (error) {
    console.error("Error fetching user bookmarks:", error)
    return NextResponse.json(
      { error: "Failed to fetch user bookmarks" },
      { status: 500 }
    )
  }
}

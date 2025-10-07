import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const session = await getServerSession(authOptions)
    const { id } = await params

    // 認証は必須ではない（公開データは誰でも見られる）
    const currentUserId = session?.user?.id

    // 自分のデータか、公開されているデータのみ取得可能
    const isOwnData = currentUserId === id

    let query = supabase
      .from('trip_schedules')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    if (!isOwnData) {
      query = query.eq('is_public', true)
    }

    const { data: trips, error } = await query

    if (error) {
      console.error("Error fetching user trips:", error)
      return NextResponse.json(
        { error: "Failed to fetch user trips" },
        { status: 500 }
      )
    }

    // いいね数とコメント数を追加
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

        return {
          ...trip,
          _count: {
            likes: likesCount || 0,
            comments: commentsCount || 0
          }
        }
      })
    )

    return NextResponse.json(tripsWithCounts)
  } catch (error) {
    console.error("Error fetching user trips:", error)
    return NextResponse.json(
      { error: "Failed to fetch user trips" },
      { status: 500 }
    )
  }
}
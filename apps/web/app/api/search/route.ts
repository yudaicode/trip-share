import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'created_at'

    const supabase = await createClient()

    // クエリを構築
    let dbQuery = supabase
      .from('trip_schedules')
      .select('*')
      .eq('is_public', true)

    // 検索クエリがある場合
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // カテゴリフィルター
    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category)
    }

    // ソート
    if (sort === 'popular') {
      // 人気順（いいね数でソート）は後で処理
      dbQuery = dbQuery.order('created_at', { ascending: false })
    } else if (sort === 'newest') {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    const { data: trips, error } = await dbQuery.limit(50)

    if (error) {
      console.error("Error searching trips:", error)
      return NextResponse.json(
        { error: "Failed to search trips" },
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
          ...trip,
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

    // 人気順の場合はいいね数でソート
    if (sort === 'popular') {
      tripsWithCounts.sort((a, b) => b._count.likes - a._count.likes)
    }

    return NextResponse.json(tripsWithCounts)
  } catch (error) {
    console.error("Error searching trips:", error)
    return NextResponse.json(
      { error: "Failed to search trips" },
      { status: 500 }
    )
  }
}

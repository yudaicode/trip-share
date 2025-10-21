import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface ActivityInput {
  time: string
  title: string
  type?: string
  location?: string
  description?: string
  duration?: string
  images?: string[]
  cost?: number
}

interface DayScheduleInput {
  dayNumber: number
  date: string
  title?: string
  activities?: ActivityInput[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const query = searchParams.get("q")
    const sort = searchParams.get("sort") || "latest"
    const isPublic = searchParams.get("public") !== "false"

    // 基本クエリを構築
    let supabaseQuery = supabase
      .from('trip_schedules')
      .select('*')

    // 公開状態フィルター
    if (isPublic) {
      supabaseQuery = supabaseQuery.eq('is_public', true)
    }

    // カテゴリーフィルター
    if (category && category !== "all") {
      supabaseQuery = supabaseQuery.eq('category', category)
    }

    // キーワード検索
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // ソート
    switch (sort) {
      case "latest":
      default:
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
        break
    }

    // 結果制限
    supabaseQuery = supabaseQuery.limit(50)

    const { data: trips, error } = await supabaseQuery

    if (error) {
      console.error("Error fetching trips:", error)
      return NextResponse.json(
        { error: "Failed to fetch trips" },
        { status: 500 }
      )
    }

    // ユーザー情報を追加してレスポンスを変換
    const transformedTrips = await Promise.all(
      (trips || []).map(async (trip) => {
        // プロフィール情報を取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', trip.user_id)
          .single()

        // いいね数とコメント数を取得
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
          user: {
            id: profile?.id || trip.user_id,
            name: profile?.full_name || profile?.username || 'Unknown User',
            avatar: profile?.avatar_url
          },
          _count: {
            likes: likesCount || 0,
            comments: commentsCount || 0
          }
        }
      })
    )

    return NextResponse.json(transformedTrips)
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const body = await request.json()
    const {
      title,
      description,
      startDate,
      endDate,
      category,
      travelerCount = 1,
      coverImage,
      isPublic = true,
      daySchedules
    } = body

    // 旅行プランを作成
    const { data: trip, error: tripError } = await supabase
      .from('trip_schedules')
      .insert({
        user_id: session.user.id,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        category,
        traveler_count: travelerCount,
        cover_image: coverImage,
        is_public: isPublic,
      })
      .select()
      .single()

    if (tripError) {
      console.error("Error creating trip:", tripError)
      return NextResponse.json(
        { error: "Failed to create trip", details: tripError.message },
        { status: 500 }
      )
    }

    // 日別スケジュールを作成
    if (daySchedules && daySchedules.length > 0) {
      const dayScheduleData = daySchedules.map((day: DayScheduleInput) => ({
        trip_schedule_id: trip.id,
        day_number: day.dayNumber,
        date: day.date,
        title: day.title || `${day.dayNumber}日目`,
      }))

      const { data: createdDaySchedules, error: dayError } = await supabase
        .from('day_schedules')
        .insert(dayScheduleData)
        .select()

      if (dayError) {
        console.error("Error creating day schedules:", dayError)
        return NextResponse.json(
          { error: "Failed to create day schedules" },
          { status: 500 }
        )
      }

      // アクティビティを作成
      for (let i = 0; i < daySchedules.length; i++) {
        const day = daySchedules[i]
        const daySchedule = createdDaySchedules[i]

        if (day.activities && day.activities.length > 0) {
          const activityData = day.activities.map((activity: ActivityInput) => ({
            day_schedule_id: daySchedule.id,
            time: activity.time,
            title: activity.title,
            type: activity.type || 'activity',
            location: activity.location,
            description: activity.description,
            duration: activity.duration,
            images: activity.images || [],
            cost: activity.cost
          }))

          const { error: activityError } = await supabase
            .from('activities')
            .insert(activityData)

          if (activityError) {
            console.error("Error creating activities:", activityError)
          }
        }
      }
    }

    return NextResponse.json(trip, { status: 201 })
  } catch (error) {
    console.error("Error creating trip:", error)
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    )
  }
}
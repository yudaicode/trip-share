import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // 旅行プランの基本情報を取得（簡素化版）
    const { data: trip, error: tripError } = await supabase
      .from('trip_schedules')
      .select('*')
      .eq('id', id)
      .single()

    if (tripError || !trip) {
      console.error("Trip fetch error:", JSON.stringify(tripError, null, 2))
      console.error("Trip ID:", id)
      console.error("Trip data:", trip)
      return NextResponse.json(
        {
          error: "Trip not found",
          details: tripError?.message,
          code: tripError?.code,
          hint: tripError?.hint,
          tripId: id
        },
        { status: 404 }
      )
    }

    // 日別スケジュールを取得
    const { data: daySchedules } = await supabase
      .from('day_schedules')
      .select(`
        *,
        activities(*)
      `)
      .eq('trip_schedule_id', id)
      .order('day_number', { ascending: true })

    // いいね数とコメント数を取得
    const { count: likesCount } = await supabase
      .from('trip_likes')
      .select('*', { count: 'exact', head: true })
      .eq('trip_schedule_id', id)

    const { count: commentsCount } = await supabase
      .from('trip_comments')
      .select('*', { count: 'exact', head: true })
      .eq('trip_schedule_id', id)

    // いいねデータを取得
    const { data: likes } = await supabase
      .from('trip_likes')
      .select('user_id')
      .eq('trip_schedule_id', id)

    // プロフィール情報を取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', trip.user_id)
      .single()

    // レスポンス形式を整形 (snake_case を camelCase に変換)
    const response = {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      category: trip.category,
      startDate: trip.start_date,
      endDate: trip.end_date,
      coverImage: trip.cover_image,
      isPublic: trip.is_public,
      createdAt: trip.created_at,
      travelerCount: trip.traveler_count,
      user: {
        id: profile?.id || trip.user_id,
        name: profile?.full_name || profile?.username || 'Unknown User',
        avatar: profile?.avatar_url
      },
      daySchedules: (daySchedules || []).map(day => ({
        id: day.id,
        dayNumber: day.day_number,
        date: day.date,
        title: day.title,
        tripScheduleId: day.trip_schedule_id,
        activities: day.activities || []
      })),
      likes: likes?.map(like => ({ userId: like.user_id })) || [],
      _count: {
        likes: likesCount || 0,
        comments: commentsCount || 0
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching trip:", error)
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    // ユーザー認証確認
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // 管理者権限でSupabaseにアクセス（RLSバイパス）
    const supabase = createAdminClient()

    // 旅行プランの所有者確認
    const { data: existingTrip, error: tripError } = await supabase
      .from('trip_schedules')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tripError || !existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    if (existingTrip.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const {
      title,
      description,
      startDate,
      endDate,
      category,
      coverImage,
      isPublic,
      travelerCount
    } = body

    // 更新データを準備（snake_caseに変換）
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.start_date = startDate
    if (endDate !== undefined) updateData.end_date = endDate
    if (category !== undefined) updateData.category = category
    if (coverImage !== undefined) updateData.cover_image = coverImage
    if (isPublic !== undefined) updateData.is_public = isPublic
    if (travelerCount !== undefined) updateData.traveler_count = travelerCount
    updateData.updated_at = new Date().toISOString()

    const { data: updatedTrip, error: updateError } = await supabase
      .from('trip_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating trip:", updateError)
      return NextResponse.json(
        { error: "Failed to update trip" },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedTrip)
  } catch (error) {
    console.error("Error updating trip:", error)
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    // ユーザー認証確認
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 管理者権限でSupabaseにアクセス（RLSバイパス）
    const supabase = createAdminClient()

    // 旅行プランの所有者確認
    const { data: existingTrip, error: tripError } = await supabase
      .from('trip_schedules')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tripError || !existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    if (existingTrip.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 旅行プランを削除（関連データもカスケード削除される）
    const { error: deleteError } = await supabase
      .from('trip_schedules')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error("Error deleting trip:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete trip" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Trip deleted successfully" })
  } catch (error) {
    console.error("Error deleting trip:", error)
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    )
  }
}
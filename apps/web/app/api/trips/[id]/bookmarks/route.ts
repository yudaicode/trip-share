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

    // 既存のブックマークを確認
    const { data: existingBookmark, error: checkError } = await supabase
      .from('trip_bookmarks')
      .select('id')
      .eq('trip_schedule_id', id)
      .eq('user_id', session.user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing bookmark:", checkError)
      return NextResponse.json(
        { error: "Failed to check bookmark status" },
        { status: 500 }
      )
    }

    if (existingBookmark) {
      // ブックマークを削除
      const { error: deleteError } = await supabase
        .from('trip_bookmarks')
        .delete()
        .eq('id', existingBookmark.id)

      if (deleteError) {
        console.error("Error deleting bookmark:", deleteError)
        return NextResponse.json(
          { error: "Failed to remove bookmark" },
          { status: 500 }
        )
      }

      return NextResponse.json({ isBookmarked: false })
    } else {
      // ブックマークを追加
      const { error: insertError } = await supabase
        .from('trip_bookmarks')
        .insert({
          trip_schedule_id: id,
          user_id: session.user.id
        })

      if (insertError) {
        console.error("Error creating bookmark:", insertError)
        return NextResponse.json(
          { error: "Failed to bookmark" },
          { status: 500 }
        )
      }

      return NextResponse.json({ isBookmarked: true })
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
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

    // ブックマーク数を取得
    const { count: bookmarksCount, error: countError } = await supabase
      .from('trip_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('trip_schedule_id', id)

    if (countError) {
      console.error("Error getting bookmarks count:", countError)
      return NextResponse.json(
        { error: "Failed to get bookmarks count" },
        { status: 500 }
      )
    }

    // ユーザーがログインしている場合は、ユーザーのブックマーク状態を確認
    let userBookmarked = false
    if (session?.user) {
      const { data: userBookmark, error: userBookmarkError } = await supabase
        .from('trip_bookmarks')
        .select('id')
        .eq('trip_schedule_id', id)
        .eq('user_id', session.user.id)
        .single()

      if (userBookmarkError && userBookmarkError.code !== 'PGRST116') {
        console.error("Error checking user bookmark:", userBookmarkError)
      } else {
        userBookmarked = !!userBookmark
      }
    }

    return NextResponse.json({
      count: bookmarksCount || 0,
      isBookmarked: userBookmarked,
    })
  } catch (error) {
    console.error("Error getting bookmarks:", error)
    return NextResponse.json(
      { error: "Failed to get bookmarks" },
      { status: 500 }
    )
  }
}
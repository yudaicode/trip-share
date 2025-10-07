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
    const { id } = await params

    const { data: comments, error } = await supabase
      .from('trip_comments')
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .eq('trip_schedule_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      )
    }

    // Get user details from profiles table
    const userIds = [...new Set(comments?.map(c => c.user_id) || [])]
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds)

    const userMap = new Map(users?.map(u => [u.id, u]) || [])

    const transformedComments = (comments || []).map((comment) => {
      const user = userMap.get(comment.user_id)

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: {
          id: comment.user_id,
          name: user?.full_name || user?.username || '匿名ユーザー',
          image: user?.avatar_url || null
        }
      }
    })

    return NextResponse.json(transformedComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

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
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    // Insert comment
    const { data: comment, error: commentError } = await supabase
      .from('trip_comments')
      .insert({
        trip_schedule_id: id,
        user_id: session.user.id,
        content: content.trim()
      })
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .single()

    if (commentError) {
      console.error("Error creating comment:", commentError)
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      )
    }

    // Get user details from profiles table
    const { data: user } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', session.user.id)
      .single()

    // Transform data to match expected format
    const transformedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        id: comment.user_id,
        name: user?.full_name || user?.username || session.user.name || '匿名ユーザー',
        image: user?.avatar_url || session.user.image || null
      }
    }

    return NextResponse.json(transformedComment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { id } = await params
    const url = new URL(request.url)
    const commentId = url.searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      )
    }

    // Check if comment exists and user owns it
    const { data: comment, error: fetchError } = await supabase
      .from('trip_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete comment
    const { error: deleteError } = await supabase
      .from('trip_comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error("Error deleting comment:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete comment" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}
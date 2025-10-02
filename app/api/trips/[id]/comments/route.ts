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

    // Get user details from NextAuth User table via Supabase
    const userIds = [...new Set(comments?.map(c => c.user_id) || [])]
    const { data: users } = await supabase
      .from('User')
      .select('id, name, avatar')
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
          name: user?.name || '匿名ユーザー',
          image: user?.avatar || null
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

    // Get user details from NextAuth User table via Supabase
    const { data: user } = await supabase
      .from('User')
      .select('name, avatar')
      .eq('id', session.user.id)
      .single()

    // Transform data to match expected format
    const transformedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        id: comment.user_id,
        name: user?.name || session.user.name || '匿名ユーザー',
        image: user?.avatar || session.user.image || null
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
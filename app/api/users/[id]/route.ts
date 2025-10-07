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

    // プロフィール情報を取得
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 現在のユーザーを取得
    const currentUserId = session?.user?.id
    const isOwnProfile = currentUserId === id

    // 非公開ユーザーの場合、自分以外は基本情報のみ表示
    if (!profile.is_public && !isOwnProfile) {
      return NextResponse.json({
        id: profile.id,
        name: profile.full_name || profile.username,
        avatar: profile.avatar_url,
        isPublic: false,
      })
    }

    // 統計情報を取得
    const { count: tripCount } = await supabase
      .from('trip_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)

    const { count: likesCount } = await supabase
      .from('trip_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)

    const { count: commentsCount } = await supabase
      .from('trip_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)

    return NextResponse.json({
      id: profile.id,
      name: profile.full_name || profile.username,
      avatar: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      interests: profile.interests ? JSON.parse(profile.interests) : [],
      isPublic: profile.is_public,
      createdAt: profile.created_at,
      _count: {
        tripSchedules: tripCount || 0,
        likes: likesCount || 0,
        comments: commentsCount || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 自分のプロフィールのみ編集可能
    if (user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      bio,
      location,
      website,
      birthDate,
      gender,
      interests,
      isPublic,
    } = body

    const updateData: any = {}
    if (name !== undefined) updateData.full_name = name
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website
    if (birthDate !== undefined) updateData.birth_date = birthDate
    if (gender !== undefined) updateData.gender = gender
    if (interests !== undefined) updateData.interests = JSON.stringify(interests)
    if (isPublic !== undefined) updateData.is_public = isPublic

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    // 統計情報を取得
    const { count: tripCount } = await supabase
      .from('trip_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)

    const { count: likesCount } = await supabase
      .from('trip_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)

    const { count: commentsCount } = await supabase
      .from('trip_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)

    return NextResponse.json({
      id: updatedProfile.id,
      name: updatedProfile.full_name || updatedProfile.username,
      avatar: updatedProfile.avatar_url,
      bio: updatedProfile.bio,
      location: updatedProfile.location,
      website: updatedProfile.website,
      birthDate: updatedProfile.birth_date,
      gender: updatedProfile.gender,
      interests: updatedProfile.interests ? JSON.parse(updatedProfile.interests) : [],
      isPublic: updatedProfile.is_public,
      createdAt: updatedProfile.created_at,
      _count: {
        tripSchedules: tripCount || 0,
        likes: likesCount || 0,
        comments: commentsCount || 0,
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
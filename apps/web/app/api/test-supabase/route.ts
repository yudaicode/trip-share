import { NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Supabase接続テスト
    const { data: { user } } = await supabase.auth.getUser()

    // テーブル存在確認
    const { data: trips, error: tripsError } = await supabase
      .from('trip_schedules')
      .select('*')
      .limit(5)

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      tables: {
        trip_schedules: {
          exists: !tripsError,
          error: tripsError?.message,
          count: trips?.length || 0,
          data: trips
        },
        profiles: {
          exists: !profilesError,
          error: profilesError?.message,
          count: profiles?.length || 0
        }
      }
    })
  } catch (error) {
    console.error("Supabase test error:", error)
    return NextResponse.json(
      { error: "Test failed", details: error },
      { status: 500 }
    )
  }
}
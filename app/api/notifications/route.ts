import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// TODO: Implement with Supabase
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Notifications not implemented yet" }, { status: 501 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Notifications not implemented yet" }, { status: 501 })
}
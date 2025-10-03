import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" }, { status: 400 })
    }

    const supabase = await createClient()

    // ファイル名の生成 (タイムスタンプ + ランダム文字列)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}_${randomString}.${extension}`

    // Supabase Storageにアップロード
    const bytes = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('trip-images')
      .upload(filename, bytes, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload to storage", details: uploadError.message },
        { status: 500 }
      )
    }

    // パブリックURLの取得
    const { data: publicUrlData } = supabase.storage
      .from('trip-images')
      .getPublicUrl(filename)

    const imageUrl = publicUrlData.publicUrl

    return NextResponse.json({
      success: true,
      imageUrl,
      filename
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
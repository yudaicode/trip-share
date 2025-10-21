"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import ImageUpload from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { ArrowLeft, Save, User, Loader2 } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { PageLoading } from "@/components/ui/page-loading"

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    avatar_url: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || ""
        })
      }
    } catch (error) {
      console.error("プロフィール取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('プロフィールを更新しました')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.error || 'プロフィールの更新に失敗しました')
      }
    } catch (error) {
      console.error("プロフィール更新エラー:", error)
      toast.error('プロフィールの更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <PageLoading message="プロフィール情報を読み込んでいます..." />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              プロフィール編集
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* アバター画像 */}
                <div>
                  <Label className="block mb-2">プロフィール画像</Label>
                  <ImageUpload
                    images={formData.avatar_url ? [formData.avatar_url] : []}
                    onImagesChange={(images) =>
                      setFormData(prev => ({ ...prev, avatar_url: images[0] || "" }))
                    }
                    maxImages={1}
                    enableServerUpload={true}
                    showLabel={false}
                  />
                </div>

                {/* ユーザー名 */}
                <div>
                  <Label htmlFor="username">
                    ユーザー名 *
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="例：travel_lover"
                    required
                    minLength={3}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    3文字以上で設定してください
                  </p>
                </div>

                {/* 表示名 */}
                <div>
                  <Label htmlFor="full_name">
                    表示名
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="例：旅好き太郎"
                    className="mt-2"
                  />
                </div>

                {/* 自己紹介 */}
                <div>
                  <Label htmlFor="bio">
                    自己紹介
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="旅行が大好きです！国内外問わず、美味しいものを食べ歩くのが趣味です。"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500文字
                  </p>
                </div>

                {/* メールアドレス（読み取り専用） */}
                <div>
                  <Label htmlFor="email">
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    value={session.user?.email || ""}
                    disabled
                    className="mt-2 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    メールアドレスは変更できません
                  </p>
                </div>

                {/* ボタン */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button variant="outline" type="button" className="w-full">
                      キャンセル
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSaving || !formData.username}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        変更を保存
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

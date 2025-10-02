"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import {
  User,
  Camera,
  X,
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  birthDate?: string
  gender?: string
  interests: string[]
  isPublic: boolean
}

const INTEREST_OPTIONS = [
  "旅行", "写真", "グルメ", "アウトドア", "歴史", "文化",
  "アート", "音楽", "スポーツ", "自然", "建築", "ショッピング",
  "温泉", "ビーチ", "山", "都市観光", "冒険", "リラックス"
]

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newInterest, setNewInterest] = useState("")

  const userId = params.id as string

  // 自分のプロフィールでない場合はリダイレクト
  useEffect(() => {
    if (session && session.user?.id !== userId) {
      router.push(`/users/${userId}`)
    }
  }, [session, userId, router])

  useEffect(() => {
    if (!userId || !session) return

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error("Failed to fetch user")
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      router.push(`/users/${userId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleAddInterest = () => {
    if (!newInterest.trim() || !user) return
    if (user.interests.includes(newInterest.trim())) return

    setUser({
      ...user,
      interests: [...user.interests, newInterest.trim()],
    })
    setNewInterest("")
  }

  const handleRemoveInterest = (interest: string) => {
    if (!user) return
    setUser({
      ...user,
      interests: user.interests.filter((i) => i !== interest),
    })
  }

  const handleInterestOptionClick = (interest: string) => {
    if (!user) return
    if (user.interests.includes(interest)) return

    setUser({
      ...user,
      interests: [...user.interests, interest],
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "プロフィールが見つかりません"}
          </h1>
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← 戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            プロフィール編集
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* アバター */}
            <div className="flex items-center gap-6">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || "User"}
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-[100px] h-[100px] bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  写真を変更
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG ファイル（最大 5MB）
                </p>
              </div>
            </div>

            {/* 名前 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名前
              </label>
              <input
                type="text"
                value={user.name || ""}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="あなたの名前"
              />
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介
              </label>
              <textarea
                value={user.bio || ""}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="あなたについて教えてください..."
              />
            </div>

            {/* 居住地 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                居住地
              </label>
              <input
                type="text"
                value={user.location || ""}
                onChange={(e) => setUser({ ...user, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例: 東京都, 日本"
              />
            </div>

            {/* ウェブサイト */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ウェブサイト
              </label>
              <input
                type="url"
                value={user.website || ""}
                onChange={(e) => setUser({ ...user, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com"
              />
            </div>

            {/* 生年月日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生年月日
              </label>
              <input
                type="date"
                value={user.birthDate ? user.birthDate.split('T')[0] : ""}
                onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性別
              </label>
              <select
                value={user.gender || ""}
                onChange={(e) => setUser({ ...user, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">選択しない</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* 興味・趣味 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                興味・趣味
              </label>

              {/* 現在の興味 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="hover:bg-indigo-200 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* 興味の追加 */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="新しい興味を追加"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  追加
                </button>
              </div>

              {/* おすすめの興味 */}
              <div>
                <p className="text-sm text-gray-600 mb-2">おすすめの興味・趣味:</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.filter(option => !user.interests.includes(option)).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleInterestOptionClick(option)}
                      className="px-3 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                    >
                      + {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* プライバシー設定 */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={user.isPublic}
                  onChange={(e) => setUser({ ...user, isPublic: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  プロフィールを公開する
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-7">
                オフにすると、あなたのプロフィールは他のユーザーに表示されません
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* 保存ボタン */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? "保存中..." : "変更を保存"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
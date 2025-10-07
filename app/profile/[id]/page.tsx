"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import TripCard from "@/components/TripCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { User, MapPin, Calendar, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

interface Trip {
  id: string
  title: string
  description: string
  category: string
  start_date: string
  end_date: string
  traveler_count: number
  cover_image: string | null
  is_public: boolean
  created_at: string
  _count: {
    likes: number
    comments: number
  }
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"trips" | "bookmarks">("trips")

  const isOwnProfile = session?.user?.id === params.id

  useEffect(() => {
    fetchProfileData()
  }, [params.id])

  const fetchProfileData = async () => {
    try {
      // プロフィール情報を取得
      const profileResponse = await fetch(`/api/users/${params.id}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData)
      }

      // ユーザーの旅行プランを取得
      const tripsResponse = await fetch(`/api/users/${params.id}/trips`)
      if (tripsResponse.ok) {
        const tripsData = await tripsResponse.json()
        setTrips(tripsData)
      }
    } catch (error) {
      console.error("プロフィールデータの取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ユーザーが見つかりません
          </h1>
          <Link href="/explore">
            <Button>探索に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 戻るボタン */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              戻る
            </Button>
          </div>

          {/* プロフィールカード */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* アバター */}
                <div className="flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username || "ユーザー"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>

                {/* プロフィール情報 */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-1">
                        {profile.full_name || profile.username || "ゲストユーザー"}
                      </h1>
                      {profile.username && profile.full_name && (
                        <p className="text-gray-500">@{profile.username}</p>
                      )}
                    </div>
                    {isOwnProfile && (
                      <Link href="/profile/edit">
                        <Button className="mt-4 sm:mt-0">
                          <Edit className="h-4 w-4 mr-2" />
                          プロフィールを編集
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* 自己紹介 */}
                  {profile.bio && (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  )}

                  {/* 統計情報 */}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{trips.length}</span>
                      <span>旅行プラン</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-pink-500" />
                      <span>参加日: {formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* タブ */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("trips")}
                  className={`pb-4 px-2 font-medium transition-colors relative ${
                    activeTab === "trips"
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  旅行プラン
                  {activeTab === "trips" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 旅行プラン一覧 */}
          {trips.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-4">
                  {isOwnProfile
                    ? "まだ旅行プランを作成していません"
                    : "まだ公開されている旅行プランがありません"}
                </p>
                {isOwnProfile && (
                  <Link href="/trips/new">
                    <Button>
                      旅行プランを作成
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TripCard
                    id={trip.id}
                    title={trip.title}
                    description={trip.description}
                    category={trip.category}
                    startDate={new Date(trip.start_date)}
                    endDate={new Date(trip.end_date)}
                    travelerCount={trip.traveler_count}
                    likes={trip._count.likes}
                    comments={trip._count.comments}
                    userName={profile.full_name || profile.username || "ゲストユーザー"}
                    coverImage={trip.cover_image}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

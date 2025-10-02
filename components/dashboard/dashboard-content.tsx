'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TripCard from "@/components/TripCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  User, MapPin, Heart, MessageCircle, Plus, Calendar,
  TrendingUp, BarChart3, Eye, Bookmark
} from "lucide-react"
import Link from "next/link"
import { User as SupabaseUser } from '@supabase/supabase-js'

interface UserTrip {
  id: string
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  travelerCount: number
  coverImage: string | null
  isPublic: boolean
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
}

interface DashboardStats {
  totalTrips: number
  totalLikes: number
  totalComments: number
  totalViews: number
}

interface DashboardContentProps {
  user: SupabaseUser
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter()
  const [userTrips, setUserTrips] = useState<UserTrip[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // ユーザーの旅行プランを取得
      const tripsResponse = await fetch(`/api/users/${user.id}/trips`)
      if (tripsResponse.ok) {
        const trips = await tripsResponse.json()
        setUserTrips(trips)

        // 統計を計算
        const totalTrips = trips.length
        const totalLikes = trips.reduce((sum: number, trip: UserTrip) => sum + trip._count.likes, 0)
        const totalComments = trips.reduce((sum: number, trip: UserTrip) => sum + trip._count.comments, 0)

        setStats({
          totalTrips,
          totalLikes,
          totalComments,
          totalViews: totalLikes * 10 // 仮の計算
        })
      }
    } catch (error) {
      console.error("データ取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* クイックアクセス */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">新しいプラン作成</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/bookmarks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Bookmark className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                <p className="font-medium">保存済みプラン</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/explore">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium">プランを探す</p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/users/${user.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">プロフィール</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* ユーザー情報ヘッダー */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  ダッシュボード
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  ユーザーID: {user.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">作成したプラン</p>
                  <p className="text-2xl font-bold">{stats.totalTrips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総いいね数</p>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総コメント数</p>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総閲覧数</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 作成したプラン一覧 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                作成した旅行プラン ({userTrips.length})
              </CardTitle>
              <Link href="/create">
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  新しいプランを作成
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {userTrips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-4">
                  まだ旅行プランを作成していません
                </p>
                <Link href="/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    最初のプランを作成
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTrips.map((trip, index) => (
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
                      startDate={new Date(trip.startDate)}
                      endDate={new Date(trip.endDate)}
                      travelerCount={trip.travelerCount}
                      likes={trip._count.likes}
                      comments={trip._count.comments}
                      userName={user.email?.split('@')[0] || "ユーザー"}
                      coverImage={trip.coverImage}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import CommentSection from "@/components/CommentSection"
import ShareButton from "@/components/ShareButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  ArrowLeft, Calendar, MapPin, User, Users, Heart, MessageCircle,
  Share2, Clock, Tag, Edit, Trash2, ZoomIn, Bookmark, Copy
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface TripDetail {
  id: string
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  coverImage: string | null
  isPublic: boolean
  createdAt: string
  travelerCount?: number
  user: {
    id: string
    name: string
    avatar: string | null
  }
  daySchedules: Array<{
    id: string
    dayNumber: number
    date: string
    title: string
    activities: Array<{
      id: string
      time: string
      title: string
      type: string
      location: string | null
      description: string | null
      duration: string | null
      images: string[] | string
    }>
  }>
  likes?: Array<{ userId: string }>
  comments?: Array<any>
  _count: {
    likes: number
    comments: number
  }
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)

  useEffect(() => {
    fetchTripDetail()
  }, [params.id, session])

  const fetchTripDetail = async () => {
    try {
      const response = await fetch(`/api/trips/${params.id}`)
      if (!response.ok) {
        throw new Error('旅行プランの取得に失敗しました')
      }
      const data = await response.json()
      setTrip(data)
      setLikesCount(data._count?.likes || 0)

      // ユーザーがいいねしているかチェック
      if (session?.user) {
        const likeResponse = await fetch(`/api/trips/${params.id}/likes`)
        if (likeResponse.ok) {
          const likeData = await likeResponse.json()
          setIsLiked(likeData.isLiked)
        }
      }

      // ブックマーク状態を取得
      if (session?.user) {
        const bookmarkResponse = await fetch(`/api/trips/${params.id}/bookmarks`)
        if (bookmarkResponse.ok) {
          const bookmarkData = await bookmarkResponse.json()
          setIsBookmarked(bookmarkData.isBookmarked)
        }
      }
    } catch (error) {
      console.error('取得エラー:', error)
      alert('旅行プランが見つかりませんでした')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setIsLikeLoading(true)
    try {
      const response = await fetch(`/api/trips/${params.id}/likes`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      console.error('いいねエラー:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setIsBookmarkLoading(true)
    try {
      const response = await fetch(`/api/trips/${params.id}/bookmarks`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsBookmarked(data.isBookmarked)
      }
    } catch (error) {
      console.error('ブックマークエラー:', error)
    } finally {
      setIsBookmarkLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの旅行プランを削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('旅行プランを削除しました')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(`削除に失敗しました: ${error.error}`)
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyTrip = async () => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    if (!confirm('このプランをコピーして新しい旅行プランを作成しますか？')) {
      return
    }

    setIsCopying(true)
    try {
      if (!trip) return

      // 日別スケジュールを整形
      const daySchedules = trip.daySchedules.map(day => ({
        dayNumber: day.dayNumber,
        date: day.date,
        title: day.title,
        activities: day.activities.map(activity => ({
          time: activity.time,
          title: activity.title,
          type: activity.type,
          location: activity.location,
          description: activity.description,
          duration: activity.duration,
          // imagesはすでにJSONB型なのでそのまま使用
          images: Array.isArray(activity.images) ? activity.images : [],
        }))
      }))

      // 新しいプランを作成
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${trip.title} (コピー)`,
          description: trip.description,
          category: trip.category,
          startDate: trip.startDate,
          endDate: trip.endDate,
          travelerCount: trip.travelerCount || 1,
          coverImage: trip.coverImage,
          isPublic: false, // コピーはデフォルトで非公開
          daySchedules
        })
      })

      if (!response.ok) {
        throw new Error('プランのコピーに失敗しました')
      }

      const createdTrip = await response.json()
      alert('プランをコピーしました！編集ページに移動します。')
      router.push(`/trips/${createdTrip.id}/edit`)
    } catch (error) {
      console.error('コピーエラー:', error)
      alert('プランのコピーに失敗しました')
    } finally {
      setIsCopying(false)
    }
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString)
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    return dayNames[date.getDay()]
  }

  const getActivityTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      activity: "アクティビティ",
      transport: "移動",
      meeting: "集合・待ち合わせ",
      meal: "食事",
      accommodation: "宿泊",
      shopping: "ショッピング",
      sightseeing: "観光"
    }
    return types[type] || "その他"
  }

  const getActivityTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      activity: "bg-blue-100 text-blue-600 border-blue-200",
      transport: "bg-green-100 text-green-600 border-green-200",
      meeting: "bg-purple-100 text-purple-600 border-purple-200",
      meal: "bg-orange-100 text-orange-600 border-orange-200",
      accommodation: "bg-indigo-100 text-indigo-600 border-indigo-200",
      shopping: "bg-pink-100 text-pink-600 border-pink-200",
      sightseeing: "bg-teal-100 text-teal-600 border-teal-200"
    }
    return colors[type] || "bg-gray-100 text-gray-600 border-gray-200"
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

  if (!trip) {
    return null
  }

  const totalDays = trip.daySchedules.length
  const totalActivities = trip.daySchedules.reduce(
    (total, day) => total + day.activities.length, 
    0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">戻る</span>
              </Button>
            </Link>
            <div className="flex gap-1 sm:gap-2">
              {session?.user?.id === trip.user.id && (
                <>
                  <Link href={`/trips/${trip.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">編集</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{isDeleting ? '削除中...' : '削除'}</span>
                  </Button>
                </>
              )}
              {session?.user?.id !== trip.user.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTrip}
                  disabled={isCopying}
                >
                  <Copy className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">{isCopying ? 'コピー中...' : 'コピーして作成'}</span>
                </Button>
              )}
              <ShareButton
                tripId={trip.id}
                title={trip.title}
                description={trip.description}
              />
            </div>
          </div>

          {/* カバー画像 */}
          {trip.coverImage && (
            <Card className="mb-4 sm:mb-6 overflow-hidden">
              <div className="relative h-48 sm:h-64 md:h-80">
                <Image
                  src={trip.coverImage}
                  alt={trip.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{trip.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trip.category === '国内旅行' ? 'bg-blue-100 text-blue-600' :
                    trip.category === '海外旅行' ? 'bg-green-100 text-green-600' :
                    trip.category === 'グルメ旅' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {trip.category}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* ヘッダー情報 */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              {!trip.coverImage && (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{trip.title}</h1>
                    <p className="text-gray-600 text-sm sm:text-base">{trip.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trip.category === '国内旅行' ? 'bg-blue-100 text-blue-600' :
                    trip.category === '海外旅行' ? 'bg-green-100 text-green-600' :
                    trip.category === 'グルメ旅' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {trip.category}
                  </span>
                </div>
              )}
              {trip.coverImage && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm sm:text-base">{trip.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">{totalDays}日間 / {totalActivities}アクティビティ</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm">作成者: {trip.user.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">人数: {trip.travelerCount || 1}人</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  disabled={isLikeLoading}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {likesCount}
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {trip._count?.comments || 0}
                </Button>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? '保存済み' : '保存'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 日別スケジュール */}
          <div className="space-y-6">
            {trip.daySchedules.map((day) => (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                      {day.dayNumber}日目 - {formatDate(day.date)}({getDayOfWeek(day.date)})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {day.activities.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        まだアクティビティが登録されていません
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {day.activities.map((activity, index) => {
                          const images = (() => {
                            try {
                              if (typeof activity.images === 'string') {
                                return JSON.parse(activity.images)
                              }
                              return Array.isArray(activity.images) ? activity.images : []
                            } catch {
                              return []
                            }
                          })()
                          return (
                            <div key={activity.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                  {index + 1}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="font-medium text-sm sm:text-base">{activity.time}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                                    {getActivityTypeLabel(activity.type)}
                                  </span>
                                  {activity.duration && (
                                    <span className="text-xs sm:text-sm text-gray-500">({activity.duration})</span>
                                  )}
                                </div>
                                <h4 className="font-medium mb-1 text-sm sm:text-base">{activity.title}</h4>
                                {activity.location && (
                                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{activity.location}</span>
                                  </div>
                                )}
                                {activity.description && (
                                  <p className="text-xs sm:text-sm text-gray-600">{activity.description}</p>
                                )}
                                {images.length > 0 && (
                                  <div className="flex gap-1 sm:gap-2 mt-2 overflow-x-auto">
                                    {images.map((img: string, i: number) => (
                                      <div
                                        key={i}
                                        className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setSelectedImage(img)}
                                      >
                                        <Image
                                          src={img}
                                          alt={`${activity.title} - 画像 ${i + 1}`}
                                          fill
                                          className="object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 rounded-lg transition-opacity">
                                          <ZoomIn className="h-4 w-4 text-white" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* コメントセクション */}
          <div className="mt-6">
            <CommentSection
              tripId={trip.id}
              initialCommentsCount={trip._count?.comments || 0}
            />
          </div>
        </motion.div>
      </div>

      {/* 画像モーダル */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-8 right-0 text-white hover:text-gray-300 text-sm"
            >
              閉じる ×
            </button>
            <Image
              src={selectedImage}
              alt="拡大画像"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
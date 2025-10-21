"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import DaySchedule from "@/components/DaySchedule"
import ImageUpload from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Activity } from "@/components/ActivityItem"
import toast from "react-hot-toast"

interface TripDetail {
  id: string
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  coverImage: string | null
  isPublic: boolean
  travelerCount: number
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
}

const categories = [
  "国内旅行",
  "海外旅行",
  "グルメ旅",
  "アクティビティ",
  "日帰り旅行",
  "温泉・リラックス",
  "文化・歴史",
  "自然・アウトドア"
]

export default function EditTripPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    isPublic: true,
    coverImage: "",
    travelerCount: 1,
    schedule: {} as { [day: number]: Activity[] }
  })
  const [showSchedule, setShowSchedule] = useState(true)
  const [tripDays, setTripDays] = useState<Array<{ dayNumber: number; date: string }>>([])

  useEffect(() => {
    if (status === "authenticated") {
      fetchTripDetail()
    }
  }, [status, params.id])

  const fetchTripDetail = async () => {
    try {
      const response = await fetch(`/api/trips/${params.id}`)
      if (!response.ok) {
        throw new Error('旅行プランの取得に失敗しました')
      }
      const data = await response.json()

      // 権限チェック
      if (data.user.id !== session?.user?.id) {
        toast.error('編集権限がありません')
        router.push(`/trips/${params.id}`)
        return
      }

      setTrip(data)

      // フォームデータに変換
      const schedule: { [day: number]: Activity[] } = {}
      data.daySchedules.forEach((day: any) => {
        schedule[day.dayNumber] = day.activities.map((activity: any) => ({
          id: activity.id,
          time: activity.time || "",
          title: activity.title || "",
          type: activity.type || "観光",
          location: activity.location || "",
          description: activity.description || "",
          duration: activity.duration || "",
          images: Array.isArray(activity.images) ? activity.images : []
        }))
      })

      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        coverImage: data.coverImage || "",
        travelerCount: data.travelerCount || 1,
        schedule
      })

    } catch (error) {
      console.error("取得エラー:", error)
      toast.error("旅行プランの取得に失敗しました")
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'travelerCount' ? parseInt(value) : value
    }))
  }

  const generateTripDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = []

    const current = new Date(start)
    let dayNumber = 1

    while (current <= end) {
      days.push({
        dayNumber,
        date: current.toISOString().split('T')[0]
      })
      current.setDate(current.getDate() + 1)
      dayNumber++
    }

    return days
  }

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = generateTripDays(formData.startDate, formData.endDate)
      setTripDays(days)

      // 既存のスケジュールデータを保持しつつ、新しい日程用の空配列を準備
      const newSchedule = { ...formData.schedule }
      days.forEach(day => {
        if (!newSchedule[day.dayNumber]) {
          newSchedule[day.dayNumber] = []
        }
      })

      // 不要な日程のデータを削除
      Object.keys(newSchedule).forEach(dayStr => {
        const dayNum = parseInt(dayStr)
        if (!days.find(d => d.dayNumber === dayNum)) {
          delete newSchedule[dayNum]
        }
      })

      setFormData(prev => ({ ...prev, schedule: newSchedule }))

      if (days.length > 0) {
        setShowSchedule(true)
      }
    } else {
      setTripDays([])
      setShowSchedule(false)
    }
  }, [formData.startDate, formData.endDate])

  const handleUpdateActivities = (dayNumber: number, activities: Activity[]) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayNumber]: activities
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // 日別スケジュールを整形
      const daySchedules = tripDays.map(day => ({
        dayNumber: day.dayNumber,
        date: day.date,
        title: `${day.dayNumber}日目`,
        activities: formData.schedule[day.dayNumber] || []
      }))

      // API用のデータを作成
      const tripData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelerCount: formData.travelerCount,
        coverImage: formData.coverImage || null,
        isPublic: formData.isPublic,
        daySchedules
      }

      const response = await fetch(`/api/trips/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '更新に失敗しました')
      }

      toast.success('旅行プランを更新しました')
      router.push(`/trips/${params.id}`)
    } catch (error) {
      console.error("更新エラー:", error)
      toast.error("旅行プランの更新に失敗しました。もう一度お試しください。")
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = formData.title && formData.description && formData.category && formData.startDate && formData.endDate
  const totalDays = tripDays.length

  // 認証チェック
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // ローディング中
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 未認証の場合
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <Link href={`/trips/${params.id}`}>
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              旅を編集
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                旅行プラン情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="例：東京3日間の食べ歩き旅"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    説明 *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="旅行プランの詳細を記入してください..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カバー画像
                  </label>
                  <ImageUpload
                    images={formData.coverImage ? [formData.coverImage] : []}
                    onImagesChange={(images) =>
                      setFormData(prev => ({ ...prev, coverImage: images[0] || "" }))
                    }
                    maxImages={1}
                    enableServerUpload={true}
                    showLabel={false}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリー *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">カテゴリーを選択</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      開始日 *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      終了日 *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="travelerCount" className="block text-sm font-medium text-gray-700 mb-2">
                      人数 *
                    </label>
                    <select
                      id="travelerCount"
                      name="travelerCount"
                      value={formData.travelerCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}人
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {showSchedule && totalDays > 0 && (
                  <div>
                    <div
                      className="flex items-center justify-between cursor-pointer mb-4"
                      onClick={() => setShowSchedule(!showSchedule)}
                    >
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          詳細スケジュール ({totalDays}日間)
                        </h3>
                      </div>
                      {showSchedule ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        各日のアクティビティを時間順に追加して、詳細な旅行スケジュールを作成しましょう。
                      </p>

                      {tripDays.map((day) => (
                        <DaySchedule
                          key={day.dayNumber}
                          dayNumber={day.dayNumber}
                          date={day.date}
                          activities={formData.schedule[day.dayNumber] || []}
                          onUpdateActivities={handleUpdateActivities}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6">
                  <Link href={`/trips/${params.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" type="button" className="w-full">
                      キャンセル
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSaving || !isFormValid}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
                  >
                    {isSaving ? (
                      "保存中..."
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

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
// import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import DaySchedule from "@/components/DaySchedule"
import ImageUpload from "@/components/ImageUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Loader2, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Activity } from "@/components/ActivityItem"

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
      images: string
    }>
  }>
}

export default function EditTripPage() {
  const params = useParams()
  const router = useRouter()
  // const { data: session, status } = useSession()
  const session = { user: { name: "テストユーザー", email: "test@example.com", id: "1" } }
  const status = "authenticated" as const
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
  const [showSchedule, setShowSchedule] = useState(false)
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
        alert('編集権限がありません')
        router.push(`/trips/${params.id}`)
        return
      }

      setTrip(data)

      // フォームデータに変換
      const schedule: { [day: number]: Activity[] } = {}
      data.daySchedules.forEach((day: any) => {
        schedule[day.dayNumber] = day.activities.map((activity: any) => ({
          id: activity.id,
          time: activity.time,
          title: activity.title,
          type: activity.type,
          location: activity.location || '',
          description: activity.description || '',
          duration: activity.duration || '',
          images: JSON.parse(activity.images || '[]')
        }))
      })

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        startDate: data.startDate.split('T')[0],
        endDate: data.endDate.split('T')[0],
        isPublic: data.isPublic,
        coverImage: data.coverImage || '',
        travelerCount: data.travelerCount || 1,
        schedule
      })

      setShowSchedule(true)
    } catch (error) {
      console.error('取得エラー:', error)
      alert('旅行プランが見つかりませんでした')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('タイトルと説明は必須です')
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('終了日は開始日以降に設定してください')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/trips/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('旅行プランを更新しました')
        router.push(`/trips/${params.id}`)
      } else {
        const error = await response.json()
        alert(`更新に失敗しました: ${error.error}`)
      }
    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
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

  if (!session || !trip) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Link href={`/trips/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">旅行プランを編集</h1>
            <div></div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="旅行プランのタイトル"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">説明 *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="旅行プランの説明"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリー</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="国内旅行">国内旅行</SelectItem>
                      <SelectItem value="海外旅行">海外旅行</SelectItem>
                      <SelectItem value="グルメ旅">グルメ旅</SelectItem>
                      <SelectItem value="アウトドア">アウトドア</SelectItem>
                      <SelectItem value="文化・歴史">文化・歴史</SelectItem>
                      <SelectItem value="リラックス">リラックス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">開始日</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">終了日</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelerCount">人数</Label>
                  <Select
                    value={formData.travelerCount.toString()}
                    onValueChange={(value) => handleInputChange('travelerCount', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="人数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}人
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>公開設定</Label>
                  <Select 
                    value={formData.isPublic.toString()} 
                    onValueChange={(value) => handleInputChange('isPublic', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">公開</SelectItem>
                      <SelectItem value="false">非公開</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </>
                    )}
                  </Button>
                  <Link href={`/trips/${params.id}`}>
                    <Button type="button" variant="outline">
                      キャンセル
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
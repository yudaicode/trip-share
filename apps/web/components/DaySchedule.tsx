"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ActivityItem, { Activity, ActivityType, activityTypes } from "./ActivityItem"
import ImageUpload from "./ImageUpload"
import { Plus, Calendar } from "lucide-react"

interface DayScheduleProps {
  dayNumber: number
  date: string
  activities: Activity[]
  onUpdateActivities: (dayNumber: number, activities: Activity[]) => void
}

export default function DaySchedule({ dayNumber, date, activities, onUpdateActivities }: DayScheduleProps) {
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    time: "",
    title: "",
    type: "activity" as ActivityType,
    location: "",
    description: "",
    duration: "",
    images: []
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    const dayOfWeek = dayNames[date.getDay()]
    return `${date.getMonth() + 1}/${date.getDate()}(${dayOfWeek})`
  }

  const handleAddActivity = () => {
    if (!newActivity.time || !newActivity.title || !newActivity.type) return

    const activity: Activity = {
      ...newActivity,
      id: Date.now().toString()
    }

    const updatedActivities = [...activities, activity].sort((a, b) => {
      return a.time.localeCompare(b.time)
    })

    onUpdateActivities(dayNumber, updatedActivities)
    setNewActivity({
      time: "",
      title: "",
      type: "activity" as ActivityType,
      location: "",
      description: "",
      duration: "",
      images: []
    })
    setIsAddingActivity(false)
  }

  const handleUpdateActivity = (updatedActivity: Activity) => {
    const updatedActivities = activities.map(activity =>
      activity.id === updatedActivity.id ? updatedActivity : activity
    ).sort((a, b) => a.time.localeCompare(b.time))

    onUpdateActivities(dayNumber, updatedActivities)
  }

  const handleDeleteActivity = (activityId: string) => {
    const updatedActivities = activities.filter(activity => activity.id !== activityId)
    onUpdateActivities(dayNumber, updatedActivities)
  }

  const handleCancel = () => {
    setNewActivity({
      time: "",
      title: "",
      type: "activity" as ActivityType,
      location: "",
      description: "",
      duration: "",
      images: []
    })
    setIsAddingActivity(false)
  }

  return (
    <div className="mb-6">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              {dayNumber}日目 - {formatDate(date)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1">
            {/* スケジュール部分 */}
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onUpdate={handleUpdateActivity}
                  onDelete={handleDeleteActivity}
                />
              ))}

              {isAddingActivity ? (
          <Card className="mb-3 border-green-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    時間 *
                  </label>
                  <input
                    type="time"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイプ *
                  </label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    required
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所要時間
                  </label>
                  <input
                    type="text"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="例：2時間"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容 *
                </label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={newActivity.type === "transport" ? "例：新宿駅から浅草駅へ" : 
                              newActivity.type === "meeting" ? "例：ホテルロビーで集合" :
                              newActivity.type === "meal" ? "例：浅草でてんぷらランチ" :
                              newActivity.type === "accommodation" ? "例：ホテルニューオータニチェックイン" :
                              newActivity.type === "shopping" ? "例：仲見世通りでお土産購入" :
                              newActivity.type === "sightseeing" ? "例：東京スカイツリー観光" :
                              "例：浅草寺参拝"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  場所
                </label>
                <input
                  type="text"
                  value={newActivity.location || ""}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="例：東京都台東区浅草"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  詳細・メモ
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="詳細な説明やメモを入力..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="mb-4">
                <ImageUpload
                  images={newActivity.images || []}
                  onImagesChange={(images) => setNewActivity(prev => ({ ...prev, images }))}
                  maxImages={3}
                  enableServerUpload={true}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  キャンセル
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAddActivity} 
                  disabled={!newActivity.title || !newActivity.time || !newActivity.type}
                  className="bg-green-600 hover:bg-green-700"
                >
                  追加
                </Button>
              </div>
            </CardContent>
          </Card>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingActivity(true)}
                  className="w-full border-dashed border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  アクティビティを追加
                </Button>
              )}

              {activities.length === 0 && !isAddingActivity && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">まだアクティビティが追加されていません</p>
                  <p className="text-xs">「アクティビティを追加」ボタンから始めましょう</p>
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
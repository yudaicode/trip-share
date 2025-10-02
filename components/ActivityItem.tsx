"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ImageUpload from "./ImageUpload"
import { Clock, MapPin, Trash2, Edit3, Car, Users, Camera, Utensils, Bed, ShoppingBag, Train } from "lucide-react"
import Image from "next/image"

export type ActivityType = 
  | "activity"     // アクティビティ
  | "transport"    // 移動
  | "meeting"      // 集合・待ち合わせ
  | "meal"         // 食事
  | "accommodation" // 宿泊
  | "shopping"     // ショッピング
  | "sightseeing"  // 観光

export interface Activity {
  id: string
  time: string
  title: string
  type: ActivityType
  location?: string
  description?: string
  duration?: string
  images?: string[]
}

export const activityTypes: { value: ActivityType; label: string; icon: any; color: string }[] = [
  { value: "activity", label: "アクティビティ", icon: Camera, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { value: "transport", label: "移動", icon: Car, color: "bg-green-100 text-green-600 border-green-200" },
  { value: "meeting", label: "集合・待ち合わせ", icon: Users, color: "bg-purple-100 text-purple-600 border-purple-200" },
  { value: "meal", label: "食事", icon: Utensils, color: "bg-orange-100 text-orange-600 border-orange-200" },
  { value: "accommodation", label: "宿泊", icon: Bed, color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { value: "shopping", label: "ショッピング", icon: ShoppingBag, color: "bg-pink-100 text-pink-600 border-pink-200" },
  { value: "sightseeing", label: "観光", icon: Train, color: "bg-teal-100 text-teal-600 border-teal-200" },
]

interface ActivityItemProps {
  activity: Activity
  onUpdate: (activity: Activity) => void
  onDelete: (id: string) => void
}

export default function ActivityItem({ activity, onUpdate, onDelete }: ActivityItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Activity>(activity)

  const getActivityTypeConfig = (type: ActivityType) => {
    return activityTypes.find(t => t.value === type) || activityTypes[0]
  }

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(activity)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card className="mb-3 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                時間 *
              </label>
              <input
                type="time"
                value={editData.time}
                onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイプ *
              </label>
              <select
                value={editData.type}
                onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                value={editData.duration || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="例：2時間"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容 *
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={editData.type === "transport" ? "例：新宿駅から浅草駅へ" : 
                          editData.type === "meeting" ? "例：ホテルロビーで集合" :
                          editData.type === "meal" ? "例：浅草でてんぷらランチ" :
                          editData.type === "accommodation" ? "例：ホテルニューオータニチェックイン" :
                          editData.type === "shopping" ? "例：仕応見通りでお土産購入" :
                          editData.type === "sightseeing" ? "例：東京スカイツリー観光" :
                          "例：浅草寺参拝"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              場所
            </label>
            <input
              type="text"
              value={editData.location || ""}
              onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="例：東京都台東区浅草"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              詳細・メモ
            </label>
            <textarea
              value={editData.description || ""}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="詳細な説明やメモを入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="mb-4">
            <ImageUpload
              images={editData.images || []}
              onImagesChange={(images) => setEditData(prev => ({ ...prev, images }))}
              maxImages={3}
              enableServerUpload={true}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!editData.title || !editData.time || !editData.type}>
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const typeConfig = getActivityTypeConfig(activity.type)
  const TypeIcon = typeConfig.icon

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-blue-500 mr-2" />
              <span className="font-medium text-sm text-blue-600">
                {activity.time}
                {activity.duration && (
                  <span className="text-gray-500 ml-2">（{activity.duration}）</span>
                )}
              </span>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-3 border ${typeConfig.color}`}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
            
            {activity.location && (
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{activity.location}</span>
              </div>
            )}
            
            {activity.description && (
              <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
            )}

            {activity.images && activity.images.length > 0 && (
              <div className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {activity.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image}
                        alt={`${activity.title} - 画像 ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                  {activity.images.length > 3 && (
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{activity.images.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-1 ml-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="p-1 h-8 w-8"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(activity.id)}
              className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
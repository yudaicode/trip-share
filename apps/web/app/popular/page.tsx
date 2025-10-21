"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import TripCard from "@/components/TripCard"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { TrendingUp, Calendar, Users, Star } from "lucide-react"

interface Trip {
  id: string
  title: string
  description: string
  category: string
  start_date: string
  end_date: string
  traveler_count: number
  cover_image: string | null
  user: {
    id: string
    name: string
    avatar?: string
  }
  _count: {
    likes: number
    comments: number
  }
}


const categories = [
  { name: "全て", value: "all" },
  { name: "国内旅行", value: "国内旅行" },
  { name: "グルメ旅", value: "グルメ旅" },
  { name: "アクティビティ", value: "アクティビティ" },
  { name: "温泉旅行", value: "温泉旅行" },
  { name: "文化・歴史", value: "文化・歴史" },
  { name: "アウトドア", value: "アウトドア" },
  { name: "日帰り旅行", value: "日帰り旅行" },
]

const sortOptions = [
  { name: "人気順", value: "likes" },
  { name: "新着順", value: "date" },
  { name: "コメント数順", value: "comments" },
]

export default function PopularPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("likes")
  const [displayTrips, setDisplayTrips] = useState<Trip[]>([])

  useEffect(() => {
    fetchTrips()
  }, [])

  useEffect(() => {
    filterAndSortTrips()
  }, [selectedCategory, sortBy, trips])

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips')
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortTrips = () => {
    let filtered = [...trips]

    if (selectedCategory !== "all") {
      filtered = filtered.filter(trip => trip.category === selectedCategory)
    }

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return (b._count?.likes || 0) - (a._count?.likes || 0)
        case "comments":
          return (b._count?.comments || 0) - (a._count?.comments || 0)
        case "date":
        default:
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      }
    })

    setDisplayTrips(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header />

      <div className="py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" />
              人気急上昇
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                人気の旅行プラン
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              みんなが注目している旅行プランを発見しよう。
              いいね数やコメント数の多いプランから、あなたの次の旅のインスピレーションを見つけてください。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className="text-sm"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  並び順
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {displayTrips.length}件のプラン
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                総計{displayTrips.reduce((acc, trip) => acc + trip.traveler_count, 0)}人が利用
              </span>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <TripCard
                    id={trip.id}
                    title={trip.title}
                    description={trip.description}
                    category={trip.category}
                    startDate={new Date(trip.start_date)}
                    endDate={new Date(trip.end_date)}
                    travelerCount={trip.traveler_count}
                    likes={trip._count?.likes || 0}
                    comments={trip._count?.comments || 0}
                    userName={trip.user?.name || 'ゲストユーザー'}
                    coverImage={trip.cover_image}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {displayTrips.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-gray-600 text-lg">
                選択したカテゴリーにはプランがありません
              </p>
              <Button
                onClick={() => setSelectedCategory("all")}
                variant="outline"
                className="mt-4"
              >
                すべてのカテゴリーを表示
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
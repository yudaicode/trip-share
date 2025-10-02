"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import TripCard from "@/components/TripCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { 
  Search, Filter, Calendar, MapPin, TrendingUp, 
  Clock, Heart, Grid, List, ChevronDown
} from "lucide-react"

const categories = [
  { value: "all", label: "すべて", color: "bg-gray-100 text-gray-600" },
  { value: "国内旅行", label: "国内旅行", color: "bg-blue-100 text-blue-600" },
  { value: "海外旅行", label: "海外旅行", color: "bg-green-100 text-green-600" },
  { value: "グルメ旅", label: "グルメ旅", color: "bg-orange-100 text-orange-600" },
  { value: "アクティビティ", label: "アクティビティ", color: "bg-purple-100 text-purple-600" },
  { value: "日帰り旅行", label: "日帰り旅行", color: "bg-yellow-100 text-yellow-600" },
  { value: "温泉・リラックス", label: "温泉・リラックス", color: "bg-pink-100 text-pink-600" },
  { value: "文化・歴史", label: "文化・歴史", color: "bg-indigo-100 text-indigo-600" },
  { value: "自然・アウトドア", label: "自然・アウトドア", color: "bg-teal-100 text-teal-600" },
]

const sortOptions = [
  { value: "latest", label: "新着順", icon: Clock },
  { value: "popular", label: "人気順", icon: TrendingUp },
  { value: "likes", label: "いいね順", icon: Heart },
]

const durationOptions = [
  { value: "all", label: "すべて" },
  { value: "1", label: "日帰り" },
  { value: "2-3", label: "1泊2日〜2泊3日" },
  { value: "4-7", label: "3泊4日〜1週間" },
  { value: "8+", label: "1週間以上" },
]

const dateRangeOptions = [
  { value: "all", label: "いつでも" },
  { value: "this_week", label: "今週" },
  { value: "this_month", label: "今月" },
  { value: "next_month", label: "来月" },
  { value: "next_3_months", label: "3ヶ月以内" },
]

const travelerCountOptions = [
  { value: "all", label: "すべて" },
  { value: "1", label: "1人" },
  { value: "2", label: "2人" },
  { value: "3", label: "3人" },
  { value: "4", label: "4人" },
  { value: "5", label: "5人以上" },
]

const searchSuggestions = [
  "東京",
  "京都",
  "大阪",
  "沖縄",
  "北海道",
  "温泉",
  "グルメ",
  "日帰り",
  "海外",
  "アクティビティ"
]

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [trips, setTrips] = useState<Array<{
    id: string
    title: string
    description: string
    category: string
    start_date: string
    end_date: string
    traveler_count: number
    cover_image: string | null
    user?: { name: string }
    _count?: { likes: number; comments: number }
  }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [selectedTravelerCount, setSelectedTravelerCount] = useState("all")

  // デバウンス付き検索
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (value: string) => {
        setIsSearching(true)
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setSearchQuery(value)
          setIsSearching(false)
        }, 500)
      }
    })(),
    []
  )

  useEffect(() => {
    // URLパラメータから初期値を設定
    const category = searchParams.get("category")
    const query = searchParams.get("q")
    const sort = searchParams.get("sort")
    const duration = searchParams.get("duration")
    const dateRange = searchParams.get("dateRange")
    const travelerCount = searchParams.get("travelerCount")

    if (category) setSelectedCategory(category)
    if (query) {
      setSearchQuery(query)
      setSearchInput(query)
    }
    if (sort) setSortBy(sort)
    if (duration) setSelectedDuration(duration)
    if (dateRange) setSelectedDateRange(dateRange)
    if (travelerCount) setSelectedTravelerCount(travelerCount)

    fetchTrips()
  }, [searchParams])

  // 検索クエリが変更された時の自動検索
  useEffect(() => {
    if (searchQuery !== searchInput) {
      fetchTrips()
    }
  }, [searchQuery])

  const fetchTrips = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      if (searchQuery) {
        params.append("q", searchQuery)
      }
      if (sortBy) {
        params.append("sort", sortBy)
      }
      if (selectedDuration !== "all") {
        if (selectedDuration === "1") {
          params.append("maxDuration", "1")
        } else if (selectedDuration === "2-3") {
          params.append("minDuration", "2")
          params.append("maxDuration", "3")
        } else if (selectedDuration === "4-7") {
          params.append("minDuration", "4")
          params.append("maxDuration", "7")
        } else if (selectedDuration === "8+") {
          params.append("minDuration", "8")
        }
      }
      if (selectedDateRange !== "all") {
        params.append("dateRange", selectedDateRange)
      }
      if (selectedTravelerCount !== "all") {
        if (selectedTravelerCount === "5") {
          // 5人以上の場合は特別な処理が必要かもしれませんが、今回は5人として扱います
          params.append("travelerCount", "5")
        } else {
          params.append("travelerCount", selectedTravelerCount)
        }
      }

      const response = await fetch(`/api/trips?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    updateURL({ q: searchInput })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateURL({ category })
    // 自動で検索を実行
    setTimeout(() => fetchTrips(), 100)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    updateURL({ sort })
    // 自動で検索を実行
    setTimeout(() => fetchTrips(), 100)
  }

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration)
    updateURL({ duration })
    setTimeout(() => fetchTrips(), 100)
  }

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange)
    updateURL({ dateRange })
    setTimeout(() => fetchTrips(), 100)
  }

  const handleTravelerCountChange = (travelerCount: string) => {
    setSelectedTravelerCount(travelerCount)
    updateURL({ travelerCount })
    setTimeout(() => fetchTrips(), 100)
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
    debouncedSearch(value)
  }

  const updateURL = (updates: Partial<{ category: string; q: string; sort: string; duration: string; dateRange: string; travelerCount: string }> = {}) => {
    const params = new URLSearchParams()

    const category = updates.category !== undefined ? updates.category : selectedCategory
    const query = updates.q !== undefined ? updates.q : searchQuery
    const sort = updates.sort !== undefined ? updates.sort : sortBy
    const duration = updates.duration !== undefined ? updates.duration : selectedDuration
    const dateRange = updates.dateRange !== undefined ? updates.dateRange : selectedDateRange
    const travelerCount = updates.travelerCount !== undefined ? updates.travelerCount : selectedTravelerCount

    if (category !== "all") params.append("category", category)
    if (query) params.append("q", query)
    if (sort !== "latest") params.append("sort", sort)
    if (duration !== "all") params.append("duration", duration)
    if (dateRange !== "all") params.append("dateRange", dateRange)
    if (travelerCount !== "all") params.append("travelerCount", travelerCount)

    router.push(`/explore${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSearchInput("")
    setSelectedCategory("all")
    setSortBy("latest")
    setSelectedDuration("all")
    setSelectedDateRange("all")
    setSelectedTravelerCount("all")
    router.push("/explore")
  }

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (sortBy !== "latest" ? 1 : 0) +
    (selectedDuration !== "all" ? 1 : 0) +
    (selectedDateRange !== "all" ? 1 : 0) +
    (selectedTravelerCount !== "all" ? 1 : 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* ページヘッダー */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              旅行プランを探す
            </h1>
            <p className="text-gray-600">
              みんなが作った素敵な旅行プランを見つけよう
            </p>
          </div>

          {/* 検索バー */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="旅行プランを検索..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {/* 検索候補 */}
                  {showSuggestions && searchInput === "" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-2">
                        <p className="text-xs text-gray-500 mb-2">人気のキーワード</p>
                        <div className="flex flex-wrap gap-1">
                          {searchSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setSearchInput(suggestion)
                                debouncedSearch(suggestion)
                                setShowSuggestions(false)
                              }}
                              className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-600 px-2 py-1 rounded transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 sm:flex-shrink-0">
                  <Button type="submit" className="flex-1 sm:flex-initial">
                    検索
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative flex-1 sm:flex-initial"
                  >
                  <Filter className="h-4 w-4 mr-1" />
                  フィルター
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* フィルターセクション */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <CardContent className="p-4">
                  {/* カテゴリーフィルター */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">カテゴリー</h3>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryChange(category.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === category.value
                              ? category.color
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 期間フィルター */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">旅行期間</h3>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      {durationOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDurationChange(option.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedDuration === option.value
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 時期フィルター */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">旅行時期</h3>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      {dateRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDateRangeChange(option.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedDateRange === option.value
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 人数フィルター */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">旅行人数</h3>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      {travelerCountOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleTravelerCountChange(option.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedTravelerCount === option.value
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ソート */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">並び順</h3>
                    <div className="grid grid-cols-3 sm:flex gap-2">
                      {sortOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              sortBy === option.value
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* フィルタークリア */}
                  {activeFiltersCount > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-600"
                      >
                        フィルターをクリア
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 結果ヘッダー */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <p className="text-gray-600">
              {isLoading ? (
                "読み込み中..."
              ) : (
                <>
                  <span className="font-medium">{trips.length}件</span>の旅行プラン
                  {searchQuery && (
                    <span> 「{searchQuery}」の検索結果</span>
                  )}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 検索結果 */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : trips.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== "all" 
                    ? "条件に合う旅行プランが見つかりませんでした"
                    : "まだ旅行プランが登録されていません"}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  条件をクリア
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
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
        </motion.div>
      </div>
    </div>
  )
}
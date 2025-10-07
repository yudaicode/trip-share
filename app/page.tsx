"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Header from "@/components/Header"
import TripCard from "@/components/TripCard"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Users, Share2, Globe } from "lucide-react"

const mockTrips = [
  {
    id: "1",
    title: "東京3日間の食べ歩き旅",
    description: "東京の隠れた名店を巡る美食の旅。朝から晩まで食べ歩きを楽しむ3日間のプランです。",
    category: "国内旅行",
    startDate: new Date("2024-03-15"),
    endDate: new Date("2024-03-17"),
    travelerCount: 2,
    likes: 234,
    comments: 45,
    userName: "田中太郎",
    coverImage: null,
  },
  {
    id: "2",
    title: "京都の紅葉を巡る秋の旅",
    description: "京都の有名な紅葉スポットを効率よく回るプラン。写真撮影にもぴったりのコースです。",
    category: "国内旅行",
    startDate: new Date("2024-11-20"),
    endDate: new Date("2024-11-22"),
    travelerCount: 1,
    likes: 567,
    comments: 89,
    userName: "山田花子",
    coverImage: null,
  },
  {
    id: "3",
    title: "沖縄でマリンスポーツ三昧",
    description: "青い海でダイビング、シュノーケリング、カヤックなど様々なマリンスポーツを楽しむ旅。",
    category: "アクティビティ",
    startDate: new Date("2024-07-10"),
    endDate: new Date("2024-07-14"),
    travelerCount: 4,
    likes: 432,
    comments: 67,
    userName: "鈴木一郎",
    coverImage: null,
  },
  {
    id: "4",
    title: "北海道グルメツアー",
    description: "札幌、小樽、函館を巡りながら、新鮮な海鮮や名物料理を堪能する美食の旅。",
    category: "グルメ旅",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-05"),
    travelerCount: 3,
    likes: 789,
    comments: 123,
    userName: "佐藤美咲",
    coverImage: null,
  },
  {
    id: "5",
    title: "鎌倉日帰り散策プラン",
    description: "鎌倉の寺社仏閣を巡りながら、おしゃれなカフェでゆったり過ごす日帰りプラン。",
    category: "日帰り旅行",
    startDate: new Date("2024-04-20"),
    endDate: new Date("2024-04-20"),
    travelerCount: 2,
    likes: 345,
    comments: 56,
    userName: "高橋健太",
    coverImage: null,
  },
  {
    id: "6",
    title: "大阪食い倒れツアー",
    description: "たこ焼き、お好み焼き、串カツなど大阪の名物グルメを制覇する2日間。",
    category: "グルメ旅",
    startDate: new Date("2024-05-15"),
    endDate: new Date("2024-05-16"),
    travelerCount: 2,
    likes: 456,
    comments: 78,
    userName: "伊藤さくら",
    coverImage: null,
  },
]

const features = [
  {
    icon: Sparkles,
    title: "簡単作成",
    description: "直感的な操作で旅行プランを簡単に作成",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: Users,
    title: "みんなでシェア",
    description: "友達や家族と旅行プランを共有",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: Share2,
    title: "インスピレーション",
    description: "他の人の旅行プランから新しい発見",
    color: "from-pink-400 to-rose-500",
  },
  {
    icon: Globe,
    title: "世界中の旅",
    description: "国内外の様々な旅行プランを探索",
    color: "from-green-400 to-emerald-500",
  },
]

export default function Home() {
  const { data: session } = useSession()
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

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips')
      if (response.ok) {
        const data = await response.json()
        // 最新6件のみ表示
        setTrips(data.slice(0, 6))
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-pink-100/50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto text-center relative z-10"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              旅のネタを
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
              みんなでシェア
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            タビネタで素敵な旅行プランを作成して、
            旅のネタをみんなと交換しましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <>
                <Link href="/create">
                  <Button size="lg" className="text-lg px-8">
                    旅を作成する
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    マイページ
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8">
                    無料で始める
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    プランを探す
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                人気の旅行プラン
              </span>
            </h2>
            <p className="text-gray-600">
              みんなが注目している旅行プランをチェック
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : trips.length > 0 ? (
              trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                  userId={trip.user_id}
                  coverImage={trip.cover_image}
                />
              </motion.div>
            ))
            ) : (
              mockTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <TripCard {...trip} />
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/explore">
              <Button size="lg" variant="outline">
                もっと見る
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-500 to-pink-500 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              今すぐ始めよう
            </h2>
            <p className="text-xl mb-8 opacity-90">
              あなたの素敵な旅のネタをみんなとシェアしましょう
            </p>
            {session ? (
              <Link href="/create">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  旅を作成する
                  <Sparkles className="ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  無料で始める
                  <Sparkles className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
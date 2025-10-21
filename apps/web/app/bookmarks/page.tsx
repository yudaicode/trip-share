"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import TripCard from "@/components/TripCard"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Bookmark, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface BookmarkedTrip {
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
  user: {
    name: string
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkedTrip[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user) {
      fetchBookmarks()
    }
  }, [status, session, router])

  const fetchBookmarks = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/users/${session.user.id}/bookmarks`)
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('ブックマークの取得に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
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

  if (!session) {
    return null
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
          <div className="flex items-center mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            </Link>
            <div className="flex items-center">
              <Bookmark className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                保存した旅行プラン
              </h1>
            </div>
          </div>

          {bookmarks.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-4">
                  まだ旅行プランを保存していません
                </p>
                <Link href="/explore">
                  <Button>
                    プランを探す
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                {bookmarks.length}件の保存済みプラン
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TripCard
                      id={bookmark.id}
                      title={bookmark.title}
                      description={bookmark.description}
                      category={bookmark.category}
                      startDate={new Date(bookmark.startDate)}
                      endDate={new Date(bookmark.endDate)}
                      travelerCount={bookmark.travelerCount}
                      likes={bookmark._count.likes}
                      comments={bookmark._count.comments}
                      userName={bookmark.user.name}
                      coverImage={bookmark.coverImage}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar, Heart, MapPin, MessageCircle, Users, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

interface TripCardProps {
  id: string
  title: string
  description: string
  coverImage?: string | null
  category: string
  startDate: Date
  endDate: Date
  travelerCount: number
  likes: number
  comments: number
  userName: string
  userAvatar?: string
  userId?: string
}

export default function TripCard({
  id,
  title,
  description,
  coverImage,
  category,
  startDate,
  endDate,
  travelerCount,
  likes: initialLikes,
  comments,
  userName,
  userAvatar,
  userId,
}: TripCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (session?.user) {
        try {
          // いいね状態を取得
          const response = await fetch(`/api/trips/${id}/likes`)
          if (response.ok) {
            const data = await response.json()
            setIsLiked(data.isLiked)
            setLikesCount(data.count)
          }
        } catch (error) {
          console.error('いいね状態の取得に失敗:', error)
        }
      }
    }
    fetchLikeStatus()
  }, [id, session])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setIsLikeLoading(true)
    try {
      const response = await fetch(`/api/trips/${id}/likes`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1)
      } else {
        console.error('いいね操作に失敗しました')
      }
    } catch (error) {
      console.error('いいねエラー:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    })
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/trips/${id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url
        })
      } catch (err) {
        console.error('共有に失敗しました:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        alert('URLをクリップボードにコピーしました！')
      } catch (err) {
        console.error('コピーに失敗しました:', err)
      }
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link href={`/trips/${id}`}>
        <Card className="overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300">
          <div className="relative h-48 bg-gradient-to-br from-blue-400 to-pink-400">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-16 w-16 text-white/50" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                {category}
              </span>
            </div>
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{travelerCount}人</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              {userId ? (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/profile/${userId}`)
                  }}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline text-left"
                >
                  {userName}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t bg-gray-50/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  disabled={isLikeLoading}
                  className={`flex items-center space-x-1 transition-colors ${
                    isLiked
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-600 hover:text-red-500'
                  } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likesCount}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{comments}</span>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
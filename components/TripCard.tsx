"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar, Heart, MapPin, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

interface TripCardProps {
  id: string
  title: string
  description: string
  coverImage?: string
  category: string
  startDate: Date
  endDate: Date
  likes: number
  comments: number
  userName: string
  userAvatar?: string
}

export default function TripCard({
  id,
  title,
  description,
  coverImage,
  category,
  startDate,
  endDate,
  likes,
  comments,
  userName,
  userAvatar,
}: TripCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    })
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
            
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t bg-gray-50/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{likes}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{comments}</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
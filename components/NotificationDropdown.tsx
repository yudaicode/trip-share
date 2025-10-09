"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  id: string
  type: "like" | "comment" | "follow"
  content: string
  trip_schedule_id: string | null
  from_user_id: string
  is_read: boolean
  created_at: string
  from_user: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  trip_title: string | null
}

export default function NotificationDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
      // 30秒ごとに更新
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchNotifications = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length)
      }
    } catch (error) {
      console.error('通知の取得に失敗しました:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId })
      })

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('通知の既読化に失敗しました:', error)
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mark_all_as_read: true })
      })

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('通知の一括既読化に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)

    if (notification.trip_schedule_id) {
      router.push(`/trips/${notification.trip_schedule_id}`)
    } else if (notification.type === 'follow') {
      router.push(`/profile/${notification.from_user_id}`)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'たった今'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}日前`
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }

  if (!session?.user) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="font-semibold text-sm">通知</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="h-auto py-1 px-2 text-xs text-blue-600 hover:text-blue-700"
            >
              すべて既読
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            通知はありません
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <DropdownMenuItem
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3 w-full">
                    <div className="flex-shrink-0">
                      {notification.from_user?.avatar_url ? (
                        <img
                          src={notification.from_user.avatar_url}
                          alt={notification.from_user.full_name || notification.from_user.username || ''}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {(notification.from_user?.full_name || notification.from_user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {notification.from_user?.full_name || notification.from_user?.username || 'ゲストユーザー'}
                        </span>
                        {' '}
                        <span className="text-gray-700">{notification.content}</span>
                      </p>
                      {notification.trip_title && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          「{notification.trip_title}」
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

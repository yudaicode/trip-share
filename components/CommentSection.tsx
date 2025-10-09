"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, User, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import toast from "react-hot-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CommentSectionProps {
  tripId: string
  initialCommentsCount?: number
}

export default function CommentSection({ tripId, initialCommentsCount = 0 }: CommentSectionProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [tripId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("コメント取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      router.push("/login")
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment("")
        toast.success("コメントを投稿しました")
      } else {
        toast.error("コメントの投稿に失敗しました")
      }
    } catch (error) {
      console.error("コメント投稿エラー:", error)
      toast.error("コメントの投稿に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("このコメントを削除しますか？")) return

    setDeletingId(commentId)
    try {
      const response = await fetch(
        `/api/trips/${tripId}/comments?commentId=${commentId}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
        toast.success("コメントを削除しました")
      } else {
        toast.error("コメントの削除に失敗しました")
      }
    } catch (error) {
      console.error("コメント削除エラー:", error)
      toast.error("コメントの削除に失敗しました")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}分前`
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays}日前`
      } else {
        return date.toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          コメント ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* コメント投稿フォーム */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "ユーザー"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  session?.user
                    ? "この旅行プランについてコメントを書く..."
                    : "コメントするにはログインが必要です"
                }
                disabled={!session?.user || isSubmitting}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500文字
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!session?.user || !newComment.trim() || isSubmitting || newComment.length > 500}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isSubmitting ? "投稿中..." : "投稿"}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* コメント一覧 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : comments.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="まだコメントがありません"
              description="最初のコメントを投稿してみましょう！"
            />
          ) : (
            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  {comment.user.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name || "ユーザー"}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${comment.user.id}`}
                          className="font-medium text-sm hover:text-blue-600 hover:underline"
                        >
                          {comment.user.name || "匿名ユーザー"}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      {session?.user?.id === comment.user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === comment.id ? (
                            <LoadingSpinner size="sm" className="border-b-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
"use client"

import { useState } from "react"
import { Share2, Twitter, MessageCircle, Link as LinkIcon, Copy, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ShareButtonProps {
  tripId: string
  title: string
  description: string
}

export default function ShareButton({ tripId, title, description }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/trips/${tripId}` : ''
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)
  const encodedUrl = encodeURIComponent(currentUrl)

  const shareOptions = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=旅行,タビネタ`,
      color: "hover:bg-blue-50 hover:text-blue-600"
    },
    {
      name: "LINE",
      icon: MessageCircle,
      url: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-green-50 hover:text-green-600"
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: currentUrl
        })
      } catch (err) {
        console.error('共有に失敗しました:', err)
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span>共有</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border z-30"
            >
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">この旅行プランを共有</h3>

                <div className="space-y-2">
                  {/* SNS共有ボタン */}
                  {shareOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <a
                        key={option.name}
                        href={option.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${option.color}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{option.name}で共有</span>
                      </a>
                    )
                  })}

                  {/* ネイティブ共有（モバイル） */}
                  {typeof navigator !== 'undefined' && typeof navigator.share !== 'undefined' && (
                    <button
                      onClick={() => {
                        handleNativeShare()
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="font-medium">その他の方法で共有</span>
                    </button>
                  )}

                  {/* URL コピー */}
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-600">コピーしました！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span className="font-medium">URLをコピー</span>
                      </>
                    )}
                  </button>
                </div>

                {/* URL表示 */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-600">URL</span>
                  </div>
                  <p className="text-sm text-gray-800 break-all mt-1">
                    {currentUrl}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
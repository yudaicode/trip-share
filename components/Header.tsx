"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, User, LogOut, Settings, Menu, X } from "lucide-react"
import { useState } from "react"
import NotificationDropdown from "@/components/NotificationDropdown"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setShowUserMenu(false)
    setShowMobileMenu(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 border-b border-gray-200/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            タビネタ
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
            探索する
          </Link>
          <Link href="/popular" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
            人気の旅
          </Link>
          <Link href="/how-to-use" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
            使い方
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/create" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              旅を作成
            </Button>
          </Link>

          {/* モバイル用作成ボタン */}
          <Link href="/create" className="sm:hidden">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>

          {session?.user ? (
            <>
              <NotificationDropdown />
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="h-5 w-5" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.name || session.user.email?.split('@')[0] || "ユーザー"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.user.email}
                        </p>
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="inline h-4 w-4 mr-2" />
                        マイページ
                      </Link>
                      <Link href={`/users/${session.user.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="inline h-4 w-4 mr-2" />
                        プロフィール
                      </Link>
                      <Link href="/profile/edit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="inline h-4 w-4 mr-2" />
                        プロフィール編集
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        ログアウト
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">ログイン</span>
              </Button>
            </Link>
          )}

          {/* モバイルメニューボタン */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <Link
              href="/explore"
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              探索する
            </Link>
            <Link
              href="/popular"
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              人気の旅
            </Link>
            <Link
              href="/how-to-use"
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              使い方
            </Link>
            {session?.user && (
              <>
                <hr className="my-2" />
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="inline h-4 w-4 mr-2" />
                  マイページ
                </Link>
                <Link
                  href={`/users/${session.user.id}`}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="inline h-4 w-4 mr-2" />
                  プロフィール
                </Link>
                <Link
                  href="/profile/edit"
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  プロフィール編集
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  <LogOut className="inline h-4 w-4 mr-2" />
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
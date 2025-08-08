"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, User } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 border-b border-gray-200/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            TripShare
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
            探索する
          </Link>
          <Link href="/popular" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
            人気の旅
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
            使い方
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm">
            <Plus className="mr-1" />
            旅を作成
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
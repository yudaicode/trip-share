'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from "@/components/Header"
import ProfileDisplay from '@/components/profile/profile-display'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const resolvedParams = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // プロフィール情報を取得
      const response = await fetch(`/api/users/${resolvedParams.id}`)

      if (!response.ok) {
        router.push('/404')
        return
      }

      const profile = await response.json()
      setProfile(profile)
      setLoading(false)
    }

    loadData()
  }, [resolvedParams.id, router])

  if (loading) {
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ユーザーが見つかりません
            </h1>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === resolvedParams.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ProfileDisplay
          profile={profile}
          isOwnProfile={isOwnProfile}
          currentUser={session?.user || null}
        />
      </div>
    </div>
  )
}
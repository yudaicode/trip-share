'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Globe, FileText, Calendar, Edit, MapPin, Mail } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileDisplayProps {
  profile: Profile
  isOwnProfile: boolean
  currentUser: any | null
}

export default function ProfileDisplay({ profile, isOwnProfile, currentUser }: ProfileDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* プロフィールカード */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              プロフィール
            </CardTitle>
            {isOwnProfile && (
              <Link href="/profile/edit">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  編集
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* アバターとメイン情報 */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-white" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.full_name || profile.username || 'ユーザー'}
                </h1>

                {profile.username && (
                  <p className="text-gray-600 mb-2">@{profile.username}</p>
                )}

                {currentUser && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Mail className="h-4 w-4" />
                    {isOwnProfile ? currentUser.email : '非公開'}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(profile.created_at)} に参加
                </div>
              </div>
            </div>

            {/* 自己紹介 */}
            {profile.bio && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  自己紹介
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* ウェブサイト */}
            {profile.website && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  ウェブサイト
                </h3>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            )}

            {/* プロフィールが空の場合のメッセージ */}
            {!profile.bio && !profile.website && isOwnProfile && (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-4">
                  プロフィールを設定して、他のユーザーにあなたのことを紹介しましょう
                </p>
                <Link href="/profile/edit">
                  <Button>
                    <Edit className="h-4 w-4 mr-1" />
                    プロフィールを設定
                  </Button>
                </Link>
              </div>
            )}

            {/* 他のユーザーでプロフィールが空の場合 */}
            {!profile.bio && !profile.website && !isOwnProfile && (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">
                  このユーザーはまだプロフィールを設定していません
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 旅行プラン一覧（将来的に実装） */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isOwnProfile ? 'あなたの旅行プラン' : `${profile.full_name || profile.username || 'ユーザー'}の旅行プラン`}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-4">
              {isOwnProfile
                ? 'まだ旅行プランを作成していません'
                : '公開されている旅行プランがありません'
              }
            </p>
            {isOwnProfile && (
              <Link href="/trips/new">
                <Button>
                  最初の旅行プランを作成
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
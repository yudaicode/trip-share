"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "OAuthAccountNotLinked":
        return {
          title: "アカウントが連携されていません",
          description: "このメールアドレスは既に別の方法で登録されています。同じログイン方法を使用してください。",
          action: "別の方法でログイン"
        }
      case "EmailCreateAccount":
        return {
          title: "アカウント作成エラー",
          description: "メールアドレスでのアカウント作成に失敗しました。",
          action: "再試行"
        }
      case "Callback":
        return {
          title: "ログイン処理エラー",
          description: "ログイン処理中にエラーが発生しました。もう一度お試しください。",
          action: "再試行"
        }
      case "OAuthCallback":
        return {
          title: "外部サービス連携エラー",
          description: "外部サービスでのログインに失敗しました。サービスの状態を確認してください。",
          action: "再試行"
        }
      case "OAuthCreateAccount":
        return {
          title: "外部アカウント作成エラー",
          description: "外部サービスでのアカウント作成に失敗しました。",
          action: "再試行"
        }
      case "EmailSignin":
        return {
          title: "メールログインエラー",
          description: "メールでのログインに失敗しました。メールアドレスを確認してください。",
          action: "再試行"
        }
      case "CredentialsSignin":
        return {
          title: "認証エラー",
          description: "認証情報が正しくありません。入力内容を確認してください。",
          action: "再試行"
        }
      case "SessionRequired":
        return {
          title: "ログインが必要です",
          description: "このページにアクセスするにはログインが必要です。",
          action: "ログイン"
        }
      case "AccessDenied":
        return {
          title: "アクセス拒否",
          description: "ログインがキャンセルされたか、アクセス権限がありません。",
          action: "再試行"
        }
      case "Verification":
        return {
          title: "認証エラー",
          description: "認証トークンが無効か期限切れです。",
          action: "再試行"
        }
      default:
        return {
          title: "認証エラー",
          description: "認証中に予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。",
          action: "再試行"
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />

      <div className="container mx-auto px-4 py-8 sm:py-16 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            </Link>
          </div>

          <Card className="border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-900">
                {errorInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {errorInfo.description}
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">
                      エラーコード: <code className="font-mono bg-gray-200 px-1 py-0.5 rounded">{error}</code>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link href="/auth/signin" className="block">
                  <Button className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {errorInfo.action}
                  </Button>
                </Link>

                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    ホームに戻る
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  問題が解決しない場合は、
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    お問い合わせ
                  </Link>
                  ください。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* トラブルシューティング */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">よくある問題と解決方法</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    複数のログイン方法を使用している場合
                  </h4>
                  <p className="text-gray-600">
                    同じメールアドレスで異なるログイン方法（Google、GitHub、メール）を使用するとエラーが発生することがあります。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    ブラウザの問題
                  </h4>
                  <p className="text-gray-600">
                    プライベートモードやCookieの設定が原因の場合があります。別のブラウザで試してみてください。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    ネットワークの問題
                  </h4>
                  <p className="text-gray-600">
                    インターネット接続を確認して、しばらく時間をおいてから再度お試しください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
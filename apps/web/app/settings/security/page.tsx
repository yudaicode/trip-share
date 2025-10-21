"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Key, Copy, Check, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { PageLoading } from "@/components/ui/page-loading"

export default function SecuritySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [disablePassword, setDisablePassword] = useState("")
  const [copiedCodes, setCopiedCodes] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      checkTwoFactorStatus()
    }
  }, [status, router])

  const checkTwoFactorStatus = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTwoFactorEnabled(data.two_factor_enabled || false)
      }
    } catch (error) {
      console.error("2FA状態確認エラー:", error)
    }
  }

  const handleSetup2FA = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "設定の開始に失敗しました")
        return
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setShowSetup(true)
    } catch (error) {
      console.error("2FA設定エラー:", error)
      toast.error("設定の開始に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!verificationCode) {
      toast.error("検証コードを入力してください")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "有効化に失敗しました")
        return
      }

      toast.success("2段階認証が有効になりました")
      setTwoFactorEnabled(true)
      setShowSetup(false)
      setVerificationCode("")
    } catch (error) {
      console.error("2FA有効化エラー:", error)
      toast.error("有効化に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error("パスワードを入力してください")
      return
    }

    if (!confirm("2段階認証を無効にしますか？")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "無効化に失敗しました")
        return
      }

      toast.success("2段階認証が無効になりました")
      setTwoFactorEnabled(false)
      setDisablePassword("")
    } catch (error) {
      console.error("2FA無効化エラー:", error)
      toast.error("無効化に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    setCopiedCodes(true)
    toast.success("バックアップコードをコピーしました")
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <PageLoading message="読み込み中..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4 mr-1" />
              戻る
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          セキュリティ設定
        </h1>

        {!showSetup ? (
          <Card>
            <CardHeader>
              <CardTitle>2段階認証（2FA）</CardTitle>
              <CardDescription>
                アカウントのセキュリティを強化するために、2段階認証を有効にすることをお勧めします
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">2段階認証</p>
                  <p className="text-sm text-gray-600">
                    {twoFactorEnabled ? "有効" : "無効"}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    twoFactorEnabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {twoFactorEnabled ? "ON" : "OFF"}
                </div>
              </div>

              {!twoFactorEnabled ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Google AuthenticatorやAuthyなどの認証アプリを使用して、ログイン時に追加の検証コードを要求します。
                  </p>
                  <Button onClick={handleSetup2FA} disabled={isLoading} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    {isLoading ? "設定中..." : "2段階認証を設定"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-green-600 font-medium">
                    ✓ アカウントは2段階認証で保護されています
                  </p>
                  <div className="space-y-3">
                    <Label htmlFor="disable-password">無効化するにはパスワードを入力</Label>
                    <Input
                      id="disable-password"
                      type="password"
                      placeholder="パスワード"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                    />
                    <Button
                      onClick={handleDisable2FA}
                      disabled={isLoading || !disablePassword}
                      variant="destructive"
                      className="w-full"
                    >
                      2段階認証を無効にする
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>2段階認証の設定</CardTitle>
              <CardDescription>
                認証アプリでQRコードをスキャンして設定してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ステップ1: QRコードスキャン */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">ステップ1: QRコードをスキャン</h3>
                <p className="text-sm text-gray-600">
                  Google Authenticator、Authy、またはその他のTOTPアプリでこのQRコードをスキャンしてください
                </p>
                {qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <Image src={qrCode} alt="QR Code" width={200} height={200} />
                  </div>
                )}
                {secret && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">手動で入力する場合:</p>
                    <code className="text-sm font-mono">{secret}</code>
                  </div>
                )}
              </div>

              {/* ステップ2: バックアップコード */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">ステップ2: バックアップコードを保存</h3>
                <p className="text-sm text-gray-600">
                  認証アプリにアクセスできない場合に使用できるバックアップコードです。安全な場所に保存してください。
                </p>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
                <Button onClick={copyBackupCodes} variant="outline" className="w-full">
                  {copiedCodes ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      コピーしました
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      コピー
                    </>
                  )}
                </Button>
              </div>

              {/* ステップ3: 検証 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">ステップ3: 検証コードを入力</h3>
                <p className="text-sm text-gray-600">
                  認証アプリに表示されている6桁のコードを入力してください
                </p>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowSetup(false)
                      setVerificationCode("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleEnable2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? "確認中..." : "有効化"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

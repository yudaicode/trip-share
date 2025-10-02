import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">ログイン</h2>
          <p className="mt-2 text-gray-600">
            旅の思い出をシェアしよう
          </p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          <span className="text-gray-600">アカウントをお持ちでない方は</span>
          <Link href="/signup" className="text-blue-500 hover:underline ml-1">
            新規登録
          </Link>
        </div>
      </div>
    </div>
  )
}
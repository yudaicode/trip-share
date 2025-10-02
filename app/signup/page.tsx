import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">新規登録</h2>
          <p className="mt-2 text-gray-600">
            旅の思い出をシェアしよう
          </p>
        </div>
        <SignupForm />
        <div className="text-center text-sm">
          <span className="text-gray-600">既にアカウントをお持ちの方は</span>
          <Link href="/login" className="text-blue-500 hover:underline ml-1">
            ログイン
          </Link>
        </div>
      </div>
    </div>
  )
}
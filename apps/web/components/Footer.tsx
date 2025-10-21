import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サービス情報 */}
          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              タビネタ
            </h3>
            <p className="text-sm text-gray-600">
              旅のネタをみんなでシェア
            </p>
          </div>

          {/* リンク */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">サービス</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="text-gray-600 hover:text-blue-600 transition-colors">
                  旅行プランを探す
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-gray-600 hover:text-blue-600 transition-colors">
                  プランを作成
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                  マイページ
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">法的情報</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © 2025 タビネタ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

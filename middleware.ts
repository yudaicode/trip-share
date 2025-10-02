import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // 保護されたルートのチェック
        const protectedPaths = ['/dashboard', '/trips/new']
        const isProtectedPath = protectedPaths.some((path) =>
          pathname.startsWith(path)
        )

        const isEditPath = pathname.match(/^\/trips\/[^/]+\/edit$/)

        // 保護されたルートまたは編集ルートへのアクセス
        if (isProtectedPath || isEditPath) {
          return !!token
        }

        return true
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
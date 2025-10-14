"use client"

import { useEffect } from "react"

interface AdBannerProps {
  /**
   * 広告スロットのID（Google AdSenseの場合）
   */
  adSlot?: string
  /**
   * 広告の形式
   * - horizontal: 横長バナー（728x90, 970x90など）
   * - vertical: 縦長バナー（300x600, 160x600など）
   * - square: 正方形（250x250, 300x300など）
   * - responsive: レスポンシブ（推奨）
   */
  format?: "horizontal" | "vertical" | "square" | "responsive"
  /**
   * 広告の表示スタイル
   */
  className?: string
}

/**
 * AdBanner コンポーネント
 *
 * Google AdSense などの広告を表示するコンポーネント。
 * 環境変数 NEXT_PUBLIC_ADSENSE_CLIENT_ID が設定されている場合のみ表示されます。
 *
 * 使用例:
 * ```tsx
 * <AdBanner format="horizontal" adSlot="1234567890" />
 * <AdBanner format="responsive" />
 * ```
 */
export function AdBanner({
  adSlot,
  format = "responsive",
  className = ""
}: AdBannerProps) {
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    // Google AdSense スクリプトを読み込む
    if (adClientId && typeof window !== "undefined") {
      try {
        // @ts-expect-error - adsbygoogle is added by Google AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error("AdSense error:", error)
      }
    }
  }, [adClientId])

  // 広告IDが設定されていない場合は何も表示しない
  if (!adClientId) {
    return null
  }

  // フォーマットに応じたスタイルクラス
  const formatStyles = {
    horizontal: "min-h-[90px] max-w-[970px] mx-auto",
    vertical: "min-h-[600px] max-w-[300px]",
    square: "min-h-[250px] max-w-[300px]",
    responsive: "min-h-[100px]",
  }

  return (
    <div className={`ad-banner-container my-4 ${className}`}>
      <div className="text-center text-xs text-gray-400 mb-1">
        スポンサー
      </div>
      <div className={`flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden ${formatStyles[format]}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClientId}
          data-ad-slot={adSlot || ""}
          data-ad-format={format === "responsive" ? "auto" : ""}
          data-full-width-responsive={format === "responsive" ? "true" : "false"}
        />
      </div>
    </div>
  )
}

/**
 * AdSense スクリプトタグを追加するコンポーネント
 * app/layout.tsx の <head> 内に配置してください
 */
export function AdSenseScript() {
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  if (!adClientId) {
    return null
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`}
      crossOrigin="anonymous"
    />
  )
}

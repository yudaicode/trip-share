import { Metadata } from "next"

const siteConfig = {
  name: "タビネタ",
  description: "旅行プランを作成・共有して、旅のネタを交換できるプラットフォーム",
  url: process.env.NEXTAUTH_URL || "https://tabineta.vercel.app",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/tabineta",
    github: "https://github.com/tabineta",
  },
}

export function createMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  return {
    title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
    description,
    keywords: [
      "旅行",
      "旅行プラン",
      "旅行シェア",
      "旅のネタ",
      "旅行計画",
      "旅行SNS",
      "旅行コミュニティ",
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
      type: "website",
      locale: "ja_JP",
      url: siteConfig.url,
      title: title || siteConfig.name,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image.startsWith("http") ? image : `${siteConfig.url}${image}`,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title || siteConfig.name,
      description,
      images: [image.startsWith("http") ? image : `${siteConfig.url}${image}`],
      creator: "@tabineta",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...(noIndex && {
      metadataBase: new URL(siteConfig.url),
    }),
  }
}

export { siteConfig }

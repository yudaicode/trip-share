import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TripShare - 楽しい旅の思い出をシェアしよう",
  description: "旅行のスケジュールを作成・共有できるプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

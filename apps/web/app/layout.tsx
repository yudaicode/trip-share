import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { createMetadata } from "@/lib/metadata";
import Footer from "@/components/Footer";

export const metadata: Metadata = createMetadata({
  title: undefined, // Will use default site name
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ja">
      <body className="bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen flex flex-col">
        {adSenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

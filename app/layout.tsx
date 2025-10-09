import type { Metadata } from "next";
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
  return (
    <html lang="ja">
      <body className="bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen flex flex-col">
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

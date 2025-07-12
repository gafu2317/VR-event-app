// src/app/layout.tsx

// "use client"; ディレクティブを削除します。
// これにより、このファイルはサーバーコンポーネントになります。

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header"; // Headerを直接インポート

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// サーバーコンポーネントなので、metadata をここでエクスポートできます。
export const metadata: Metadata = {
  title: "イベント予約システム",
  description: "イベントの予約確認と作成ができるウェブサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Headerを直接レンダリングします。Propsは不要になりました。 */}
        <Header />

        {/* main タグに pt-16 (padding-top: 4rem) を追加し、固定ヘッダーの下にコンテンツが潜り込まないようにします。 */}
        <main className="flex-grow container mx-auto p-4 pt-16">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "トーク リキャップ | LINEトーク履歴からワードクラウドを生成",
  description:
    "LINEのトーク履歴テキストをアップロードするだけで、あなたとの会話をワードクラウドで可視化。データは一切保存しません。インストール不要で今すぐ楽しめます。",
  keywords: ["LINE", "ワードクラウド", "トーク履歴", "word cloud", "分析"],
  openGraph: {
    title: "トーク リキャップ | LINEトーク履歴からワードクラウドを生成",
    description:
      "LINEのトーク履歴テキストをアップロードするだけで、あなたとの会話をワードクラウドで可視化。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "トーク リキャップ",
    description:
      "LINEのトーク履歴からワードクラウドを生成。インストール不要。",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "トーク リキャップ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

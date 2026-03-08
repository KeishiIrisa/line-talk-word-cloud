import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "トーク リキャップ",
  description: "LINEのトーク履歴からワードクラウドを生成",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "トーク リキャップ",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
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
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen antialiased font-[var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}

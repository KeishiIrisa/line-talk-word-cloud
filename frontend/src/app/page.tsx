"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Sparkles, Shield, Zap, Instagram, Plus, X, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

// ── Marquee images ─────────────────────────────────────────────────────────
const MARQUEE_IMAGES = [
  { src: "/assets/S e n aといりさのケーシィの記録.png", alt: "サンプル1" },
  { src: "/assets/みなとだぁの記録.png", alt: "サンプル2" },
  { src: "/assets/いりさのケーシィと山サの記録.png", alt: "サンプル3" },
  { src: "/assets/柳元俊哉といりさのケーシィの記録.png", alt: "サンプル4" },
];

// ── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Shield,
    title: "LINEのトークデータは\n一切保存しません",
    description:
      "アップロードされたデータはメモリ上で処理され、サーバーには残りません。プライバシーを守りながら安心して使えます。",
  },
  {
    icon: Zap,
    title: "インストール不要で\n楽しめます",
    description:
      "ブラウザだけで完結。アプリのインストールは一切不要です。スマートフォンでもすぐに使えます。",
  },
  {
    icon: Instagram,
    title: "ストーリーに投稿して\n楽しんじゃお！",
    description:
      "生成したワードクラウドを 9:16 のストーリーサイズで書き出し、そのまま Instagram ストーリーに投稿できます。",
  },
];

// ── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "LINEのトーク履歴はどうやってエクスポートしますか？",
    a: "LINE アプリでトーク画面を開き、右上メニュー →「トーク履歴を送信」→「テキスト形式」を選択してファイルを保存してください。Android / iOS どちらでも同様の手順です。",
  },
  {
    q: "データはサーバーに保存されますか？",
    a: "一切保存されません。アップロードされたテキストはメモリ上で処理され、ワードクラウド画像の生成が完了した時点で破棄されます。",
  },
  {
    q: "対応しているファイル形式は？",
    a: "LINE のトーク履歴をエクスポートした .txt ファイルに対応しています。UTF-8 / CP932 どちらのエンコードでも自動判定します。",
  },
  {
    q: "生成にどれくらい時間がかかりますか？",
    a: "トーク量にもよりますが、通常は数秒〜10秒程度で生成されます。長期間のトーク履歴は少し時間がかかることがあります。",
  },
  {
    q: "スマートフォンで使えますか？",
    a: "はい、iOS・Android のブラウザでご利用いただけます。ストーリー投稿機能も、スマートフォンの共有シートから Instagram に直接渡せます。",
  },
];

// ── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-black/[0.07] dark:border-white/[0.07] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold leading-snug text-[var(--text)] group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
          {q}
        </span>
        <span className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
          open
            ? "bg-violet-500 text-white"
            : "bg-black/5 dark:bg-white/5 text-[var(--muted)]"
        )}>
          {open ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        open ? "max-h-96 pb-5" : "max-h-0"
      )}>
        <p className="text-sm text-[var(--subtext)] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// ── CTA Button ───────────────────────────────────────────────────────────────
function CTAButton({ className }: { className?: string }) {
  return (
    <Link
      href="/create"
      className={cn(
        "inline-flex items-center justify-center gap-2.5",
        "h-[54px] px-8 rounded-2xl",
        "font-bold text-[15px] text-white",
        "bg-gradient-to-r from-violet-600 to-fuchsia-600",
        "hover:from-violet-500 hover:to-fuchsia-500",
        "shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40",
        "transition-all duration-300 active:scale-[0.97]",
        className
      )}
    >
      <Sparkles className="w-5 h-5" />
      作ってみる
      <ChevronRight className="w-4 h-4 opacity-70" />
    </Link>
  );
}

// ── Main LP ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-violet-500/30">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-2xl border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-md shadow-violet-500/30">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">トーク リキャップ</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <CTAButton className="hidden sm:inline-flex h-9 px-5 text-[13px]" />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-5">
        {/* Background glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 tracking-wide">LINE TALK RECAP</span>
          </div>

          <h1 className="text-[2.8rem] sm:text-[3.6rem] font-black leading-[1.08] tracking-tighter mb-5">
            あなたのLINE、<br />
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              どんな言葉が多いんだろ？
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--subtext)] leading-relaxed mb-8 max-w-md mx-auto">
            LINEのトーク履歴（.txt）から分析する<br className="hidden sm:block" />
            ワードクラウドジェネレーター
          </p>

          <CTAButton />

          <p className="mt-4 text-xs text-[var(--muted)]">
            無料 · データ保存なし · インストール不要
          </p>
        </div>
      </section>

      {/* ── Marquee ── */}
      <section className="py-10 overflow-hidden">
        <div className="marquee-container">
          <div className="animate-marquee">
            {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((img, i) => (
              <div
                key={i}
                className="flex-shrink-0 mx-3 rounded-[20px] overflow-hidden shadow-xl"
                style={{ width: 160, height: 284 }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={160}
                  height={284}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-5" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[1.9rem] sm:text-[2.4rem] font-black tracking-tighter mb-3">
              シンプルで、<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">安心</span>
            </h2>
            <p className="text-sm text-[var(--subtext)]">大事なトーク履歴を安全に扱うための設計</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl p-6 bg-white dark:bg-[#111111] border border-black/[0.07] dark:border-white/[0.07] hover:border-violet-500/30 transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 dark:bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                </div>
                <h3 className="text-[15px] font-bold leading-snug mb-2 whitespace-pre-line">{title}</h3>
                <p className="text-sm text-[var(--subtext)] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Second CTA ── */}
      <section className="py-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-px">
            <div className="rounded-3xl bg-white dark:bg-[#0f0f0f] p-8 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-[1.8rem] sm:text-[2.2rem] font-black tracking-tighter mb-3">
                さっそく、<br />作ってみよう
              </h2>
              <p className="text-sm text-[var(--subtext)] mb-7 leading-relaxed">
                LINEのトーク履歴ファイルを選ぶだけ。<br />数秒でワードクラウドが完成します。
              </p>
              <CTAButton className="w-full sm:w-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-5" id="faq">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[1.9rem] sm:text-[2.4rem] font-black tracking-tighter mb-3">
              よくある質問
            </h2>
            <p className="text-sm text-[var(--subtext)]">ご不明な点があればお気軽にどうぞ</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/[0.07] dark:border-white/[0.07] px-6 divide-y-0">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.q}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-[14px] tracking-tight">トーク リキャップ</span>
            </div>

            <nav className="flex items-center gap-6 text-sm text-[var(--subtext)]">
              <Link href="/#features" className="hover:text-[var(--text)] transition-colors">特徴</Link>
              <Link href="/#faq" className="hover:text-[var(--text)] transition-colors">FAQ</Link>
              <Link href="/create" className="hover:text-[var(--text)] transition-colors">作ってみる</Link>
            </nav>

            <p className="text-xs text-[var(--muted)]">
              © {new Date().getFullYear()} トーク リキャップ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

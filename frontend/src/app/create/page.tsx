"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  Palette,
  Download,
  Share2,
  RotateCcw,
  AlertCircle,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const WORDCLOUD_API = "/api/wordcloud";
const SHIMMER_DURATION_MS = 900;

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const PREVIEW_WIDTH = 270;
const PREVIEW_HEIGHT = Math.round((PREVIEW_WIDTH * STORY_HEIGHT) / STORY_WIDTH);

interface CardData {
  image: string;
  title: string;
  callTime: string;
  stamps: number;
  photos: number;
}

function canvasRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapTextByChar(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generateStoryCanvas(
  cardData: CardData,
  backgroundColor: string
): Promise<HTMLCanvasElement> {
  const W = STORY_WIDTH;
  const H = STORY_HEIGHT;
  const s = W / PREVIEW_WIDTH;

  const pw     = PREVIEW_WIDTH;
  const cardW  = Math.round(pw * 0.86) * s;
  const imgPad = Math.round(pw * 0.045) * s;
  const txtPad = Math.round(pw * 0.055) * s;
  const cardR  = Math.round(pw * 0.055) * s;
  const imgR   = Math.round(pw * 0.025) * s;
  const titleSz = Math.round(pw * 0.072) * s;
  const statSz  = Math.round(pw * 0.038) * s;
  const footSz  = Math.round(pw * 0.028) * s;
  const imgSize = cardW - imgPad * 2;
  const maxTextW = cardW - txtPad * 2;
  const ff = '"Inter", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';

  const wcImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = `data:image/png;base64,${cardData.image}`;
  });

  const measureCanvas = document.createElement("canvas");
  const mCtx = measureCanvas.getContext("2d")!;
  mCtx.font = `600 ${titleSz}px ${ff}`;
  const titleLines = wrapTextByChar(mCtx, cardData.title, maxTextW);
  const titleH = titleLines.length * titleSz * 1.25;

  const cardH =
    imgPad + imgSize
    + Math.round(pw * 0.045 * 0.6) * s
    + Math.round(pw * 0.055 * 0.3) * s
    + titleH
    + Math.round(pw * 0.055 * 0.55) * s
    + 3 * (Math.round(pw * 0.055 * 0.1) * s + statSz * 1.6)
    + Math.round(pw * 0.055 * 0.7) * s
    + footSz * 2
    + txtPad;

  const cardX = (W - cardW) / 2;
  const cardY = (H - cardH) / 2;

  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  canvasRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  const bg = ctx.createLinearGradient(cardX, cardY + cardH, cardX + cardW * 0.7, cardY);
  bg.addColorStop(0, "#DEDAD0");
  bg.addColorStop(0.45, "#E9E5DC");
  bg.addColorStop(1, "#F6F3EC");
  ctx.fillStyle = bg;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  const sheenH = cardH * 0.38;
  const sheen = ctx.createLinearGradient(0, cardY, 0, cardY + sheenH);
  sheen.addColorStop(0, "rgba(255,255,255,0.42)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(cardX, cardY, cardW, sheenH);

  ctx.save();
  canvasRoundedRect(ctx, cardX + imgPad, cardY + imgPad, imgSize, imgSize, imgR);
  ctx.clip();
  ctx.drawImage(wcImg, cardX + imgPad, cardY + imgPad, imgSize, imgSize);
  ctx.restore();

  const vigH = cardH * 0.12;
  const vig = ctx.createLinearGradient(0, cardY + cardH - vigH, 0, cardY + cardH);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.07)");
  ctx.fillStyle = vig;
  ctx.fillRect(cardX, cardY + cardH - vigH, cardW, vigH);

  ctx.restore();

  const txX = cardX + txtPad;
  let y = cardY
    + imgPad + imgSize
    + Math.round(pw * 0.045 * 0.6) * s
    + Math.round(pw * 0.055 * 0.3) * s;

  ctx.font = `600 ${titleSz}px ${ff}`;
  ctx.fillStyle = "#0D0D0D";
  for (const line of titleLines) {
    y += titleSz * 1.25;
    ctx.fillText(line, txX, y);
  }
  y -= titleSz * 0.25;

  y += Math.round(pw * 0.055 * 0.55) * s;
  ctx.font = `400 ${statSz}px ${ff}`;
  ctx.fillStyle = "#3A3A3A";
  for (const [label, val] of [
    ["通話時間", cardData.callTime],
    ["写真", `${cardData.photos}枚`],
    ["スタンプ", `${cardData.stamps}個`],
  ] as const) {
    y += Math.round(pw * 0.055 * 0.1) * s + statSz;
    ctx.fillText(`${label}\u3000${val}`, txX, y);
    y += statSz * 0.6;
  }

  y += Math.round(pw * 0.055 * 0.7) * s + footSz;
  ctx.font = `500 ${footSz}px ${ff}`;
  ctx.fillStyle = "#999999";
  const ctxExt = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if (ctxExt.letterSpacing !== undefined) {
    ctxExt.letterSpacing = `${Math.round(footSz * 0.18)}px`;
  }
  ctx.fillText("LINE TALK RECAP", txX, y);

  return canvas;
}

const PRESET_COLORS = [
  { hex: "#7C3AED", label: "バイオレット" },
  { hex: "#DB2777", label: "ピンク" },
  { hex: "#EA580C", label: "オレンジ" },
  { hex: "#0EA5E9", label: "スカイ" },
  { hex: "#10B981", label: "エメラルド" },
  { hex: "#EAB308", label: "アンバー" },
  { hex: "#EF4444", label: "レッド" },
  { hex: "#6366F1", label: "インディゴ" },
  { hex: "#EC4899", label: "ローズ" },
  { hex: "#14B8A6", label: "ティール" },
  { hex: "#8B5CF6", label: "パープル" },
  { hex: "#111111", label: "ブラック" },
];

function StoryCard({ data, containerWidth }: { data: CardData; containerWidth: number }) {
  const cardW = Math.round(containerWidth * 0.86);
  const imgPad = Math.round(containerWidth * 0.045);
  const textPad = Math.round(containerWidth * 0.055);
  const titleSize = Math.round(containerWidth * 0.072);
  const statSize = Math.round(containerWidth * 0.038);
  const footerSize = Math.round(containerWidth * 0.028);
  const ff = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif";
  const radius = Math.round(containerWidth * 0.055);

  return (
    <div style={{
      position: "relative",
      width: cardW,
      background: "linear-gradient(155deg, #F6F3EC 0%, #E9E5DC 55%, #DEDAD0 100%)",
      borderRadius: radius,
      overflow: "hidden",
      boxShadow: [
        "0 20px 70px rgba(0,0,0,0.40)",
        "inset 0 1.5px 0 rgba(255,255,255,0.90)",
        "inset 0 0 0 1px rgba(255,255,255,0.30)",
      ].join(", "),
      fontFamily: ff,
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 32%, rgba(255,255,255,0) 60%)", pointerEvents: "none", zIndex: 2, borderRadius: radius }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0) 30%)", pointerEvents: "none", zIndex: 2, borderRadius: radius }} />
      <div style={{ position: "relative", zIndex: 3, padding: `${imgPad}px ${imgPad}px ${Math.round(imgPad * 0.6)}px` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${data.image}`} alt="wordcloud" style={{ width: "100%", display: "block", borderRadius: Math.round(containerWidth * 0.025), boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 3, padding: `${Math.round(textPad * 0.3)}px ${textPad}px ${textPad}px` }}>
        <p style={{ margin: 0, fontSize: titleSize, fontWeight: 600, color: "#0D0D0D", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{data.title}</p>
        <div style={{ marginTop: Math.round(textPad * 0.55) }}>
          {[{ label: "通話時間", value: data.callTime }, { label: "写真", value: `${data.photos}枚` }, { label: "スタンプ", value: `${data.stamps}個` }].map((stat) => (
            <p key={stat.label} style={{ margin: `${Math.round(textPad * 0.1)}px 0 0`, fontSize: statSize, fontWeight: 400, color: "#3A3A3A", letterSpacing: "0.01em", lineHeight: 1.5 }}>
              {stat.label}{"　"}{stat.value}
            </p>
          ))}
        </div>
        <p style={{ margin: `${Math.round(textPad * 0.7)}px 0 0`, fontSize: footerSize, fontWeight: 500, color: "#999", letterSpacing: "0.18em", textTransform: "uppercase" }}>LINE TALK RECAP</p>
      </div>
    </div>
  );
}

function StepLabel({ step, label }: { step: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
        {step}
      </span>
      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-white dark:bg-[#111111] border border-black/[0.07] dark:border-white/[0.07] overflow-hidden", className)}>
      {children}
    </div>
  );
}

export default function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#7C3AED");
  const [shimmering, setShimmering] = useState(false);
  const [showStoryPreview, setShowStoryPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardData && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [cardData]);

  const uploadCard = useCallback(async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
    setCardData(null);
    setShowStoryPreview(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(WORDCLOUD_API, { method: "POST", body: formData });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof json.detail === "string" ? json.detail : json.detail?.[0]?.msg ?? res.statusText;
        throw new Error(msg || "ワードクラウドの生成に失敗しました");
      }
      setCardData({ image: json.image, title: json.title, callTime: json.call_time, stamps: json.stamps, photos: json.photos });
      setShowStoryPreview(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleColorSelect = useCallback((color: string) => {
    setBackgroundColor(color);
    setShowStoryPreview(false);
    setShimmering(true);
    setTimeout(() => { setShimmering(false); setShowStoryPreview(true); }, SHIMMER_DURATION_MS);
  }, []);

  const getImageFile = useCallback(async (): Promise<File | null> => {
    if (!cardData) return null;
    const canvas = await generateStoryCanvas(cardData, backgroundColor);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        const safeName = cardData!.title.replace(/[/\\:*?"<>|]/g, "_").trim() || "line-wordcloud-story";
        resolve(new File([blob], `${safeName}.png`, { type: "image/png" }));
      }, "image/png");
    });
  }, [cardData, backgroundColor]);

  const handleShare = useCallback(async () => {
    const file = await getImageFile();
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [getImageFile]);

  const handleStoryShare = useCallback(async () => {
    const file = await getImageFile();
    if (!file) return;
    try {
      if (typeof navigator.share === "function") {
        const payload: ShareData = { title: cardData?.title ?? "LINE トーク リキャップ" };
        if (navigator.canShare?.({ ...payload, files: [file] })) {
          await navigator.share({ ...payload, files: [file] });
          return;
        }
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
    handleShare();
  }, [getImageFile, handleShare, cardData?.title]);

  const handleReset = useCallback(() => {
    setCardData(null);
    setFile(null);
    setError(null);
    setShowStoryPreview(false);
    setShimmering(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-violet-500/30">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-2xl border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-[var(--subtext)] hover:text-[var(--text)] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:block">トップ</span>
            </Link>
            <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-[14px] tracking-tight">トーク リキャップ</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {cardData && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs text-[var(--subtext)] hover:text-[var(--text)]"
              >
                <RotateCcw className="w-3 h-3" />
                やり直す
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-lg mx-auto px-5 pt-8 pb-24 space-y-7">
        {!cardData && !loading && (
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-3">LINE TALK RECAP</p>
            <h1 className="text-[2.4rem] font-black leading-[1.05] tracking-tighter">
              <span>あなたの</span>
              <br />
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">トーク記録</span>
            </h1>
            <p className="mt-3 text-sm text-[var(--subtext)] leading-relaxed">
              LINEのトーク履歴（.txt）をアップロードして<br />ワードクラウドを生成しましょう
            </p>
          </div>
        )}

        {/* ── Step 1: Upload ── */}
        <section>
          <StepLabel step="1" label="ファイルを選択" />
          <label className={cn(
            "block relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 group",
            file
              ? "border-green-500/50 bg-green-500/[0.06]"
              : "border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]",
            loading && "pointer-events-none"
          )}>
            <input ref={fileInputRef} type="file" accept=".txt" className="sr-only"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }}
              disabled={loading}
            />
            <div className="flex items-center gap-4 p-5">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                file ? "bg-green-500/20" : "bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10"
              )}>
                {file ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Upload className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--subtext)] transition-colors" />}
              </div>
              <div className="min-w-0 flex-1">
                {file ? (
                  <>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 truncate leading-snug">{file.name}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">タップして別のファイルを選択</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold leading-snug">ファイルを選択</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">LINEのトーク履歴 (.txt)</p>
                  </>
                )}
              </div>
            </div>
          </label>

          <a
            href="https://help.line.me/line/smartphone?lang=ja&contentId=20007388"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-violet-500 dark:hover:text-violet-400 transition-colors w-fit"
          >
            <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>トーク履歴をテキスト形式で保存するには？</span>
          </a>

          {error && (
            <div className="mt-3 flex items-start gap-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 p-3.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          <button onClick={uploadCard} disabled={!file || loading} className={cn(
            "mt-3 w-full h-[54px] rounded-2xl font-bold text-[15px] text-white",
            "flex items-center justify-center gap-2.5",
            "transition-all duration-300 active:scale-[0.97]",
            "bg-gradient-to-r from-violet-600 to-fuchsia-600",
            "hover:from-violet-500 hover:to-fuchsia-500",
            "shadow-lg shadow-violet-500/20",
            loading && "animate-pulse-glow",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
          )}>
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />生成中...</>) : (<><Sparkles className="w-5 h-5" />ワードクラウドを生成</>)}
          </button>
        </section>

        {/* ── Loading skeleton ── */}
        {loading && (
          <GlassCard className="animate-slide-up">
            <div className="p-5 space-y-4">
              <div className="h-2.5 w-28 rounded-full bg-black/5 dark:bg-white/5 skeleton" />
              <div className="aspect-square w-full rounded-xl bg-black/[0.04] dark:bg-white/[0.04] skeleton" />
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-black/5 dark:bg-white/5 skeleton" />
                <div className="h-2.5 w-3/4 rounded-full bg-black/5 dark:bg-white/5 skeleton" />
                <div className="h-2.5 w-1/2 rounded-full bg-black/5 dark:bg-white/5 skeleton" />
              </div>
            </div>
          </GlassCard>
        )}

        {/* ── Step 2: Story preview + Color picker ── */}
        {cardData && !loading && (
          <section ref={resultRef} className="animate-slide-up space-y-4">
            <StepLabel step="2" label="ストーリーをカスタマイズ" />

            <GlassCard>
              <div className="px-5 pt-4 pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                <span className="text-xs font-semibold text-[var(--muted)]">STORY PREVIEW (9:16)</span>
              </div>
              <div className="p-5 flex flex-col items-center gap-5">
                <div className="relative overflow-hidden rounded-[20px] shadow-2xl" style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}>
                  {shimmering ? (
                    <div className="h-full w-full shimmer" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, backgroundColor }}>
                      <StoryCard data={cardData} containerWidth={PREVIEW_WIDTH} />
                    </div>
                  )}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-black/30 pointer-events-none" />
                </div>

                <div className="w-full flex items-stretch gap-3">
                  <button onClick={handleStoryShare} disabled={shimmering || !showStoryPreview} className={cn(
                    "flex-1 h-[54px] rounded-2xl font-bold text-[15px] text-white",
                    "flex items-center justify-center gap-2.5",
                    "transition-all duration-300 active:scale-[0.97]",
                    "bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737]",
                    "hover:opacity-90 shadow-lg shadow-pink-500/20",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
                  )}>
                    <Share2 className="w-5 h-5" />
                    ストーリーに投稿
                  </button>
                  <div className="flex flex-col items-center gap-1.5">
                    <button onClick={handleShare} disabled={shimmering || !showStoryPreview} className={cn(
                      "w-[54px] h-[54px] rounded-2xl flex items-center justify-center",
                      "border border-black/20 dark:border-white/20 text-[var(--text)]",
                      "transition-all duration-300 active:scale-[0.97] hover:bg-black/5 dark:hover:bg-white/5",
                      "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                    )}>
                      <Download className="w-5 h-5" />
                    </button>
                    <span className="text-[11px] text-[var(--muted)] font-medium">保存</span>
                  </div>
                </div>
                <p className="text-center text-[11px] text-[var(--muted)] mt-2">
                  保存した画像を Instagram ストーリーに追加してください
                </p>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--muted)]" />
                  <span className="text-sm font-semibold">ストーリーの雰囲気を選ぼう</span>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button key={c.hex} type="button" onClick={() => handleColorSelect(c.hex)} title={c.label}
                      className={cn(
                        "aspect-square w-full rounded-xl transition-all duration-200",
                        "active:scale-90 focus:outline-none",
                        backgroundColor === c.hex
                          ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-[#111111] scale-[0.92]"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>
          </section>
        )}
      </main>

      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}

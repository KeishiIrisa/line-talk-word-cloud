import type { NextConfig } from "next";
import path from "path";

// 開発時のみ .env.dev を読み込む。本番（Vercel）では Vercel の環境変数を使用する。
if (process.env.NODE_ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config({ path: path.join(__dirname, ".env.dev") });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // フロントエンドのみをルートにし、親ディレクトリの lockfile を参照しない
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

# LINEトーク ワードクラウド

LINE のトーク履歴（txt）をアップロードしてワードクラウドのカード画像を生成し、背景色を選んでストーリー用画像としてダウンロードできる Web アプリ。

- **Frontend**: Next.js (TypeScript) → Vercel
- **Backend**: FastAPI (Python, uv) → Cloud Run（Dockerfile）
- ストレージは使わず、POST で txt を受け取り画像バイナリを返すのみ

## ローカル開発

```bash
make install      # 依存関係インストール
make backend-dev  # ターミナル1: API → http://localhost:8080
make frontend     # ターミナル2: アプリ → http://localhost:3000
```

- バックエンド: `backend/.env.dev` に `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000` を書く
- フロント: `frontend/.env.dev` に `BACKEND_URL=http://127.0.0.1:8080` を書く（未作成なら `frontend/.env.example` をコピー）

## デプロイ

- **Backend**: `backend/` の Dockerfile を Cloud Run にデプロイ（ポート 8080）
- **Frontend**: Vercel で `frontend/` をデプロイし、環境変数 `BACKEND_URL` に Cloud Run の URL を設定

## その他

- `make help` でコマンド一覧
- ストップワード: `backend/app/stopwords.txt`（1行1語）
- ローカルで M PLUS Rounded 1c を使う: [Google Fonts](https://fonts.google.com/specimen/M+PLUS+Rounded+1c) からダウンロードし `~/Library/Fonts/` に置くか、`brew install font-m-plus-rounded-1c`。未検出時は `backend/.env.dev` に `FONT_PATH=/path/to/MPLUSRounded1c-Regular.ttf` を指定

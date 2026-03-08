# LINEトーク ワードクラウド
# backend: FastAPI (uv), frontend: Next.js (npm)

.PHONY: install backend frontend build clean lint help

# デフォルトは help を表示
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install    - 依存関係をインストール (backend + frontend)"
	@echo "  backend-dev - バックエンドを開発用 .env.dev 読み込みで起動"
	@echo "  frontend-dev   - フロントエンドを起動 (http://localhost:3000)"
	@echo "  build      - 本番ビルド (frontend)"
	@echo "  lint       - リント実行 (frontend)"
	@echo "  clean      - ビルド成果物・キャッシュを削除"
	@echo "  clean-frontend-cache - フロントの .next のみ削除（404 時にお試しください）"

# 依存関係インストール
install:
	cd backend && uv sync
	cd frontend && npm install

# バックエンド起動（.env.dev を読み込み。CORS_ORIGINS 等が開発用に設定される）
backend-dev:
	cd backend && ENV=dev uv run uvicorn app.main:app --reload --port 8080

# フロントエンド起動
frontend-dev:
	cd frontend && npm run dev

# 本番ビルド
build:
	cd frontend && npm run build

# リント
lint:
	cd frontend && npm run lint

# クリーン (キャッシュ・ビルド成果物削除)
clean:
	rm -rf backend/.venv
	rm -rf backend/*.egg-info
	rm -rf backend/__pycache__ backend/app/__pycache__
	rm -rf frontend/node_modules
	rm -rf frontend/.next

# フロントのキャッシュのみ削除（404 が出る場合に試す）
clean-frontend-cache:
	rm -rf frontend/.next

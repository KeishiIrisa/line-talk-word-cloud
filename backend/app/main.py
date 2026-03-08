"""
LINE トーク ワードクラウド API。

POST /wordcloud: txt ファイルを受け取り、ワードクラウド画像（base64）とメタデータを JSON で返す。
"""
import base64
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .parser import parse_line_talk
from .wordcloud_gen import format_call_time, generate_wordcloud_bytes

# 開発時は .env.dev を読み込む（ENV=dev で起動した場合）
if os.environ.get("ENV") == "dev":
    load_dotenv(".env.dev")
else:
    load_dotenv()

app = FastAPI(title="LINE トーク ワードクラウド API", version="0.1.0")

FONT_PATH: Optional[str] = os.environ.get("FONT_PATH")

# CORS: 環境変数 CORS_ORIGINS で指定（カンマ区切り）。未設定時は "*"
_cors_origins = os.environ.get("CORS_ORIGINS", "*").strip()
CORS_ORIGINS = [o.strip() for o in _cors_origins.split(",") if o.strip()] if _cors_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@app.post("/wordcloud")
async def wordcloud(file: UploadFile = File(...)):
    """
    LINE トーク履歴の txt ファイルを受け取り、ワードクラウド画像（base64）と
    タイトル・統計情報を JSON で返す。クライアント側でカードを描画する。
    """
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="txt ファイルをアップロードしてください。")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="ファイルが大きすぎます。")

    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content.decode("cp932")
        except Exception:
            raise HTTPException(status_code=400, detail="ファイルを UTF-8 または CP932 でデコードできませんでした。")

    try:
        result = parse_line_talk(text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"LINE トークの解析に失敗しました: {e!s}")

    try:
        png_bytes = generate_wordcloud_bytes(result, font_path=FONT_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ワードクラウドの生成に失敗しました: {e!s}")

    return {
        "image": base64.b64encode(png_bytes).decode("utf-8"),
        "title": f"{result.user_a}と{result.user_b}の記録",
        "call_time": format_call_time(result.total_call_time_seconds),
        "stamps": result.total_stamps,
        "photos": result.total_photos,
    }


@app.get("/health")
async def health():
    return {"status": "正常"}

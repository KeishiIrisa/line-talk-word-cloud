"""
ワードクラウド生成。

MeCab で前処理 → 角丸四角マスクでワードクラウド画像を生成し PNG バイト列で返す。
タイトル・統計テキストは API レスポンスの JSON フィールドとして返し、カード合成はクライアントが行う。
"""
import io
import re
import unicodedata
from pathlib import Path
from random import Random
from typing import Optional

import numpy as np
from PIL import Image, ImageDraw
from wordcloud import WordCloud

from .parser import ParsedResult

# ストップワードファイル
_STOPWORDS_FILE = Path(__file__).parent / "stopwords.txt"


def load_stopwords(path: Optional[Path] = None) -> set[str]:
    """
    ストップワードを txt ファイルから読み込む。
    ファイルが無い・読めない・1件も語が無い場合はエラーを起こす。
    """
    p = path or _STOPWORDS_FILE
    if not p.exists():
        raise FileNotFoundError(f"ストップワードファイルが見つかりません: {p}")
    words: set[str] = set()
    with open(p, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                words.add(line)
    if not words:
        raise ValueError(f"ストップワードが1件もありません: {p}")
    return words


DEFAULT_STOPWORDS = load_stopwords()


def _get_mecab_tokenizer():
    """MeCab の Tagger を返す。利用不可の場合は None。"""
    try:
        import MeCab
        return MeCab.Tagger()
    except Exception:
        return None


# URL っぽい文字列を除去するための正規表現
_URL_PATTERN = re.compile(
    r"https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|jp|net|org|io|co\.jp|ne\.jp)(?:/[^\s]*)?",
    re.IGNORECASE,
)


def tokenize_for_wordcloud(text: str, mecab_tagger) -> str:
    """
    テキストを形態素解析し、名詞・動詞・形容詞のみをスペース区切りで返す。
    MeCab が使えない場合は簡易的に空白で区切る。
    URL は除去する。
    """
    text = unicodedata.normalize("NFKC", text)
    text = _URL_PATTERN.sub(" ", text)
    text = re.sub(r"[【】 () （） 『』　「」\[\［］\]]", " ", text)
    text = re.sub(r"[@＠]\w+", "", text)
    text = re.sub(r"\d+\.*\d*", "", text)

    if mecab_tagger is None:
        return " ".join(text.split())

    parsed = mecab_tagger.parse(text)
    if not parsed:
        return ""
    surfaces = []
    pos_list = []
    for line in parsed.split("\n"):
        if line == "EOS" or not line:
            continue
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        surface = parts[0]
        info = parts[1].split(",")
        pos = info[0] if info else ""
        surfaces.append(surface)
        pos_list.append(pos)

    target_pos = {"名詞", "動詞", "形容詞"}
    kana_only = re.compile(r"^[ぁ-ゖ]+$")
    # URL 由来のトークン（http, https, com, www など）を除外
    url_like = re.compile(r"^(https?|www|com|net|org|jp|io|co|ne)$", re.IGNORECASE)
    tokens = [
        s for s, p in zip(surfaces, pos_list)
        if p in target_pos
        and not kana_only.match(s)
        and len(s) > 1
        and not url_like.match(s)
    ]
    return " ".join(tokens)


# 白背景で見やすい色
_WORDCLOUD_COLORS = [
    "#2563eb",  # 青
    "#1e40af",  # 濃い青
    "#7c3aed",  # 紫
    "#6d28d9",  # 濃い紫
    "#059669",  # 緑
    "#047857",  # 濃い緑
    "#dc2626",  # 赤
    "#ea580c",  # オレンジ
    "#0f766e",  # ティール
]


def _wordcloud_color_func(word=None, font_size=None, position=None, orientation=None, font_path=None, random_state=None):
    """指定パレットからランダムに色を返す。白背景で見やすい色のみ。"""
    if random_state is None:
        random_state = Random()
    return random_state.choice(_WORDCLOUD_COLORS)


def create_rounded_rect_mask(width: int, height: int, radius: int) -> np.ndarray:
    """
    角丸四角のマスクを返す。
    ワードクラウドは 0 の領域に描画される（255 は透明）。
    """
    mask = np.full((height, width), 255, dtype=np.uint8)
    # 角丸四角の内側を 0 で塗る
    img = Image.fromarray(mask)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, width - 1, height - 1], radius=radius, fill=0)
    return np.array(img)


def generate_wordcloud_image(
    text: str,
    width: int = 700,
    height: int = 500,
    font_path: Optional[str] = None,
    max_words: int = 100,
    stopwords: Optional[set] = None,
) -> Image.Image:
    """ワードクラウド部分のみの PIL Image を返す。"""
    if not text.strip():
        # テキストが空の場合は白い画像を返す
        return Image.new("RGB", (width, height), (255, 255, 255))

    mecab = _get_mecab_tokenizer()
    tokenized = tokenize_for_wordcloud(text, mecab)
    if not tokenized.strip():
        return Image.new("RGB", (width, height), (255, 255, 255))

    radius = 80
    mask_arr = create_rounded_rect_mask(width, height, radius)
    stopwords = stopwords or DEFAULT_STOPWORDS

    wc = WordCloud(
        background_color="white",
        width=width,
        height=height,
        mask=mask_arr,
        font_path=font_path,
        color_func=_wordcloud_color_func,
        stopwords=stopwords,
        max_words=max_words,
        contour_width=0,
        min_font_size=3,       # 下限をさらに下げて隙間に小さい語を詰める
        max_font_size=50,      # 最大サイズを小さくして1語の占有面積を抑える
        relative_scaling=0.3,  # 頻度差を更にフラットにして均等配置を促す
        prefer_horizontal=0.6, # 縦語の割合を増やして縦方向の隙間も埋める
        collocations=False,    # 2語連結を無効にして単語数を増やす
        repeat=True,           # 語数が少ない場合でも繰り返して空白を埋める
        margin=2,              # 語間マージンを最小化して密度を上げる
    )
    wc.generate(tokenized)
    # WordCloud は RGB 画像を返す
    wc_image = wc.to_image()
    return wc_image.convert("RGB")


def format_call_time(seconds: int) -> str:
    """秒を「○分」「○時間○分」「○日○時間○分」形式に。24時間以上なら日まで表示。"""
    if seconds <= 0:
        return "0分"
    d = seconds // 86400
    h = (seconds % 86400) // 3600
    m = (seconds % 3600) // 60
    if d > 0:
        return f"{d}日{h}時間{m}分"
    if h > 0:
        return f"{h}時間{m}分"
    return f"{m}分"


def generate_wordcloud_bytes(
    result: ParsedResult,
    font_path: Optional[str] = None,
    size: int = 800,
) -> bytes:
    """
    ワードクラウド画像のみを PNG バイト列で返す。
    タイトル・統計テキストは含まない（クライアント側で描画する）。
    """
    combined_text = " ".join(result.message_bodies)
    wc_img = generate_wordcloud_image(
        combined_text,
        width=size,
        height=size,
        font_path=font_path,
        max_words=200,
        stopwords=DEFAULT_STOPWORDS,
    )
    buf = io.BytesIO()
    wc_img.save(buf, format="PNG")
    return buf.getvalue()

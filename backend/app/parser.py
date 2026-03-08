"""
LINE トーク履歴テキストのパーサー。

フォーマット例:
  21:45	ユーザーA	ただいまーわ
  2026/03/07(土)
  02:02	ユーザーA	[写真]
  07:48	ユーザーB	☎ 通話時間 9:38:22
"""
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class ParsedResult:
    """パース結果"""

    user_a: str
    user_b: str
    total_call_time_seconds: int
    total_stamps: int
    total_photos: int
    message_bodies: list[str]


# 日付行: 2026/03/07(土)
DATE_PATTERN = re.compile(r"^\d{4}/\d{2}/\d{2}\s*\([^)]+\)\s*$")

# 通話時間: 行中に "通話時間 <時間>" が含まれていればマッチ
CALL_PATTERN = re.compile(r"通話時間\s+(.+)$")


def _parse_call_duration(text: str) -> int:
    """
    通話時間の文字列を秒に変換。
    "9:38:22" -> 9*3600 + 38*60 + 22
    "17:17"   -> 17*60 + 17
    """
    text = text.strip()
    parts = [p.strip() for p in text.split(":")]
    if len(parts) == 3:
        h, m, s = int(parts[0] or 0), int(parts[1] or 0), int(parts[2] or 0)
        return h * 3600 + m * 60 + s
    if len(parts) == 2:
        m, s = int(parts[0] or 0), int(parts[1] or 0)
        return m * 60 + s
    if len(parts) == 1:
        return int(parts[0] or 0)
    return 0


def parse_line_talk(content: str) -> ParsedResult:
    """
    LINE トーク履歴のテキストをパースする。

    Returns:
        ParsedResult: ユーザー名2人、総通話時間(秒)、スタンプ数、写真数、メッセージ本文リスト
    """
    users: list[str] = []
    total_call_seconds = 0
    total_stamps = 0
    total_photos = 0
    message_bodies: list[str] = []

    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        if DATE_PATTERN.match(line):
            continue
        # タブ区切り: 時刻 \t ユーザー名 \t 本文
        if "\t" not in line:
            continue
        parts = line.split("\t", 2)
        if len(parts) < 3:
            continue
        _time, username, body = parts[0].strip(), parts[1].strip(), parts[2].strip()
        if not username:
            continue

        # ユーザー名を収集（最大2人、出現順）
        if username not in users:
            users.append(username)
        if len(users) > 2:
            users = users[:2]

        if body == "[写真]":
            total_photos += 1
            continue
        if body == "[スタンプ]":
            total_stamps += 1
            continue

        call_match = CALL_PATTERN.search(body)
        if call_match:
            total_call_seconds += _parse_call_duration(call_match.group(1))
            continue

        # 通常メッセージ: ワードクラウド用に蓄積
        if body:
            message_bodies.append(body)

    user_a = users[0] if len(users) > 0 else "ユーザー1"
    user_b = users[1] if len(users) > 1 else "ユーザー2"

    return ParsedResult(
        user_a=user_a,
        user_b=user_b,
        total_call_time_seconds=total_call_seconds,
        total_stamps=total_stamps,
        total_photos=total_photos,
        message_bodies=message_bodies,
    )

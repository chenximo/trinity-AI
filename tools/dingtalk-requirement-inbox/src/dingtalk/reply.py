"""Parse quote/reply context from DingTalk bot callbacks."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from zoneinfo import ZoneInfo

from src.dingtalk.incoming import extract_body_from_content, extract_download_codes_from_content

TZ_CN = ZoneInfo("Asia/Shanghai")


def get_replied_msg_blob(incoming: dict[str, Any]) -> Optional[dict[str, Any]]:
    text_obj = incoming.get("text")
    if isinstance(text_obj, dict):
        replied = text_obj.get("repliedMsg")
        if isinstance(replied, dict):
            return replied

    replied = incoming.get("repliedMsg")
    if isinstance(replied, dict):
        return replied
    return None


def has_quoted_reply(incoming: dict[str, Any]) -> bool:
    return get_replied_msg_blob(incoming) is not None


def _format_time(create_ms: int) -> str:
    if create_ms:
        return (
            datetime.fromtimestamp(create_ms / 1000, tz=timezone.utc)
            .astimezone(TZ_CN)
            .isoformat()
        )
    return datetime.now(TZ_CN).isoformat()


def extract_replied_content(replied: dict[str, Any]) -> tuple[str, bool]:
    content = replied.get("content") or {}
    if not isinstance(content, dict):
        return "", False
    msg_type = str(replied.get("msgType") or replied.get("msgtype") or "text").lower()
    if content.get("richText"):
        msg_type = "richtext"
    return extract_body_from_content(content, msg_type=msg_type)


def extract_replied_download_codes(incoming: dict[str, Any]) -> list[str]:
    """Download codes from quoted/replied message (reply-then-整理 flow)."""
    replied = get_replied_msg_blob(incoming)
    if not replied:
        return []
    content = replied.get("content") or {}
    if not isinstance(content, dict):
        return []
    if content.get("richText"):
        return extract_download_codes_from_content(content, msg_type="richtext")
    msg_type = str(replied.get("msgType") or replied.get("msgtype") or "text").lower()
    return extract_download_codes_from_content(content, msg_type=msg_type)


def build_quoted_message(incoming: dict[str, Any]) -> Optional[dict[str, Any]]:
    replied = get_replied_msg_blob(incoming)
    if not replied:
        return None

    text, has_image = extract_replied_content(replied)
    if not text and not has_image:
        return None

    create_ms = int(replied.get("createdAt") or replied.get("createAt") or 0)
    return {
        "message_id": replied.get("msgId") or "",
        "sender_name": replied.get("senderNick") or "引用消息",
        "create_time": _format_time(create_ms),
        "text": text,
        "has_image": has_image,
        "message_link": "",
    }

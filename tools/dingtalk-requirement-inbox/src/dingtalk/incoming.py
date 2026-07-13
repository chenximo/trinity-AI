"""Normalize DingTalk bot callback payloads (text / richText / picture)."""

from __future__ import annotations

from typing import Any


def _rich_item_kind(item: dict[str, Any]) -> str:
    return str(item.get("type") or item.get("msgType") or "").lower()


def _rich_text_parts(content: dict[str, Any]) -> tuple[str, bool, list[str]]:
    parts: list[str] = []
    has_image = False
    download_codes: list[str] = []
    for item in content.get("richText") or []:
        if not isinstance(item, dict):
            continue
        if _rich_item_kind(item) == "picture":
            has_image = True
            code = str(item.get("downloadCode") or "").strip()
            if code:
                download_codes.append(code)
            continue
        text = str(item.get("text") or item.get("content") or "").strip()
        if text:
            parts.append(text)
    return "\n".join(parts), has_image, download_codes


def _content_dict(incoming: dict[str, Any]) -> dict[str, Any]:
    content = incoming.get("content")
    if isinstance(content, dict):
        return content
    text_obj = incoming.get("text")
    if isinstance(text_obj, dict):
        nested = text_obj.get("content")
        if isinstance(nested, dict):
            return nested
    return {}


def extract_download_codes_from_content(content: dict[str, Any], *, msg_type: str = "text") -> list[str]:
    msg_type = msg_type.lower()
    if msg_type == "picture":
        code = str(content.get("downloadCode") or "").strip()
        return [code] if code else []
    if msg_type == "richtext":
        _, _, codes = _rich_text_parts(content)
        return codes
    return []


def extract_download_codes(incoming: dict[str, Any]) -> list[str]:
    msgtype = str(incoming.get("msgtype") or "text").lower()
    content = _content_dict(incoming)
    if content:
        return extract_download_codes_from_content(content, msg_type=msgtype)
    return []


def extract_body_from_content(content: dict[str, Any], *, msg_type: str = "text") -> tuple[str, bool]:
    """Extract visible text and image flag from a content blob."""
    msg_type = msg_type.lower()

    if content.get("richText"):
        text, has_image, _ = _rich_text_parts(content)
        if text:
            return text, has_image
        return ("[图片消息]" if has_image else ""), has_image

    if msg_type == "picture":
        text = str(content.get("text") or "").strip()
        return text or "[图片消息]", True

    if msg_type == "richtext":
        text, has_image, _ = _rich_text_parts(content)
        if text:
            return text, has_image
        return ("[图片消息]" if has_image else ""), has_image

    summary = str(content.get("summary") or "").strip()
    if summary:
        has_image = "[图片]" in summary or "[image]" in summary.lower()
        title = str(content.get("title") or "").strip()
        if title and title not in summary:
            return f"{title}\n{summary}", has_image
        return summary, has_image

    text = str(content.get("text") or "").strip()
    return text, msg_type == "picture"


def extract_incoming_body(incoming: dict[str, Any]) -> tuple[str, bool]:
    """Return user-visible text and whether the message includes an image."""
    msgtype = str(incoming.get("msgtype") or "text").lower()

    if msgtype == "text":
        text_obj = incoming.get("text") or {}
        text = str(text_obj.get("content") or "").strip()
        return text, False

    content = _content_dict(incoming)
    if content:
        return extract_body_from_content(content, msg_type=msgtype)

    text_obj = incoming.get("text") or {}
    text = str(text_obj.get("content") or "").strip()
    return text, msgtype == "picture"


def incoming_trigger_text(incoming: dict[str, Any]) -> str:
    text, _ = extract_incoming_body(incoming)
    return text

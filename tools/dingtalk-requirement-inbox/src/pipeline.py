"""Organize pipeline."""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

from src.config import Settings
from src.dedup import ProcessedMessageStore, dedupe_candidates_by_title
from src.dingtalk.client import reply_text
from src.dingtalk.messages import fetch_conversation_messages
from src.dingtalk.incoming import extract_download_codes, extract_incoming_body
from src.dingtalk.reply import extract_replied_download_codes, has_quoted_reply
from src.dingtalk.notable import NotableWriter, make_batch_id
from src.dingtalk.robot_files import download_robot_images, resolve_robot_code
from src.llm.extract import LlmExtractor

logger = logging.getLogger(__name__)
TZ_CN = ZoneInfo("Asia/Shanghai")


def build_trigger_message(incoming: dict[str, Any]) -> dict[str, Any]:
    text, has_image = extract_incoming_body(incoming)
    create_ms = int(incoming.get("createAt") or 0)
    if create_ms:
        create_time = datetime.fromtimestamp(create_ms / 1000, tz=timezone.utc).astimezone(TZ_CN).isoformat()
    else:
        create_time = datetime.now(TZ_CN).isoformat()

    return {
        "message_id": incoming.get("msgId") or "",
        "sender_name": incoming.get("senderNick") or "未知",
        "create_time": create_time,
        "text": text,
        "has_image": has_image,
        "message_link": "",
    }


def is_trigger(incoming: dict[str, Any]) -> bool:
    """直接 @机器人即整理（含「整理」「收集」或不带指令）。"""
    return bool(incoming.get("isInAtList"))


def _strip_bot_mention(text: str) -> str:
    cleaned = re.sub(r"@\S+", "", text or "")
    return cleaned.replace("\xa0", " ").strip()


def source_requirement_text(messages: list[dict[str, Any]]) -> str:
    """Join message bodies (minus @bot) so long PRD-style pastes are not dropped."""
    parts: list[str] = []
    for message in messages:
        text = _strip_bot_mention(str(message.get("text") or ""))
        if text:
            parts.append(text)
    return "\n\n".join(parts).strip()


def enrich_summaries_from_source(
    candidates: list[dict[str, Any]],
    messages: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    When the user pastes a long requirement and LLM compresses it into a short summary,
    keep the original text as summary (single-candidate batches).
    """
    source = source_requirement_text(messages)
    if not source or len(candidates) != 1:
        return candidates
    summary = (candidates[0].get("summary") or "").strip()
    if len(source) > len(summary) + 40:
        candidates[0] = {**candidates[0], "summary": source}
        logger.info(
            "summary_enriched_from_source source_chars=%s llm_chars=%s",
            len(source),
            len(summary),
        )
    return candidates


def _append_skipped_titles(reply: str, skipped_titles: list[str]) -> str:
    if not skipped_titles:
        return reply
    shown = "、".join(f"「{title}」" for title in skipped_titles[:3])
    if len(skipped_titles) > 3:
        shown += f" 等 {len(skipped_titles)} 条"
    return f"{reply}\n跳过 {len(skipped_titles)} 条重复标题：{shown}"


async def run_organize(settings: Settings, incoming: dict[str, Any]) -> dict[str, Any]:
    session_webhook = incoming.get("sessionWebhook") or ""
    conversation_id = incoming.get("conversationId") or ""
    msg_id = (incoming.get("msgId") or "").strip()

    allowed = settings.allowed_conversation_id_set()
    if allowed and conversation_id not in allowed:
        await reply_text(session_webhook, "此群未开通需求整理助手。")
        return {"ok": False, "error": "conversation_not_allowed"}

    if settings.dedup_msg_id_enabled and msg_id:
        store = ProcessedMessageStore(
            settings.resolved_dedup_db_path(),
            retention_days=settings.dedup_retention_days,
        )
        if store.is_processed(msg_id):
            logger.info("organize_skipped_duplicate_msg_id msg_id=%s", msg_id)
            await reply_text(session_webhook, "该消息已整理过，跳过重复写入。")
            return {"ok": True, "skipped": True, "reason": "duplicate_msg_id"}

    trigger_message = build_trigger_message(incoming)
    quoted = has_quoted_reply(incoming)
    messages = await fetch_conversation_messages(
        settings,
        conversation_id=conversation_id,
        trigger_message=trigger_message,
        incoming=incoming,
    )

    extractor = LlmExtractor(settings)
    extraction = await extractor.extract(messages)
    batch_id = make_batch_id()
    writable = [c for c in extraction.get("candidates", []) if c.get("type") != "noise"]
    writable, skipped_titles = dedupe_candidates_by_title(writable)
    writable = enrich_summaries_from_source(writable, messages)
    logger.info(
        "organize_extracted batch_id=%s message_count=%s candidate_count=%s writable=%s",
        batch_id,
        len(messages),
        len(extraction.get("candidates", [])),
        len(writable),
    )
    trigger_images = []
    if settings.notable_write_enabled and settings.notable_attach_images_enabled:
        robot_code = resolve_robot_code(incoming, fallback=settings.dingtalk_client_id)
        download_codes = list(
            dict.fromkeys(
                extract_download_codes(incoming) + extract_replied_download_codes(incoming)
            )
        )
        logger.info(
            "screenshot_download_prepare codes=%s robot_code=%s",
            len(download_codes),
            bool(robot_code),
        )
        if download_codes and robot_code:
            trigger_images = await download_robot_images(
                settings,
                download_codes=download_codes,
                robot_code=robot_code,
                filename_prefix=batch_id,
            )
        elif download_codes:
            logger.warning("screenshot_download_skipped missing_robot_code count=%s", len(download_codes))

    if settings.notable_write_enabled:
        writer = NotableWriter(settings)
        count = await writer.create_records(
            batch_id=batch_id,
            session_summary=extraction.get("session_summary", ""),
            candidates=writable,
            trigger_images=trigger_images,
        )
        reply = (
            f"已整理 {count} 条，请在「需求收件箱」确认（待确认）\n"
            f"批次：{batch_id}"
        )
        doc_url = settings.resolved_notable_doc_url()
        if doc_url:
            reply += f"\n收件箱：{doc_url}"
        if trigger_images:
            reply += "\n（已尝试写入截图附件）"
    else:
        count = len(writable)
        titles = "\n".join(f"- {c.get('title')}" for c in writable[:5])
        reply = (
            f"已整理 {count} 条（预览模式，尚未写表）\n"
            f"批次：{batch_id}\n"
            f"{titles}\n"
            f"权限开通后将自动写入多维表。"
        )

    if quoted:
        reply += "\n（已包含引用/回复消息）"
    reply = _append_skipped_titles(reply, skipped_titles)

    await reply_text(session_webhook, reply)

    if settings.dedup_msg_id_enabled and msg_id:
        ProcessedMessageStore(
            settings.resolved_dedup_db_path(),
            retention_days=settings.dedup_retention_days,
        ).mark_processed(msg_id, batch_id)

    return {"ok": True, "batch_id": batch_id, "count": count}


async def dry_run_extract(settings: Settings, messages: list[dict[str, Any]]) -> dict[str, Any]:
    extractor = LlmExtractor(settings)
    return await extractor.extract(messages)

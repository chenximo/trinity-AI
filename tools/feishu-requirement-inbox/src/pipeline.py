"""Main organize pipeline."""

from __future__ import annotations

import logging
import secrets
import time
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from src.config import Settings
from src.feishu.bitable import BitableWriter
from src.feishu.client import FeishuClient
from src.llm.extract import LlmExtractor

logger = logging.getLogger(__name__)

TZ_CN = ZoneInfo("Asia/Shanghai")

# message_id -> processed_at (epoch seconds)
_recent_triggers: dict[str, float] = {}
_DEDUP_TTL_SECONDS = 600


def make_batch_id() -> str:
    now = datetime.now(TZ_CN)
    suffix = secrets.token_hex(2)
    return now.strftime("%Y%m%d-%H%M") + f"-{suffix}"


def _is_duplicate_trigger(message_id: str) -> bool:
    now = time.time()
    expired = [k for k, ts in _recent_triggers.items() if now - ts > _DEDUP_TTL_SECONDS]
    for key in expired:
        _recent_triggers.pop(key, None)
    if message_id in _recent_triggers:
        return True
    _recent_triggers[message_id] = now
    return False


async def run_organize(
    settings: Settings,
    *,
    message_id: str,
    chat_id: str,
) -> dict[str, Any]:
    if _is_duplicate_trigger(message_id):
        logger.info("skip_duplicate_trigger", extra={"message_id": message_id})
        return {"ok": True, "skipped": True, "reason": "duplicate"}

    feishu = FeishuClient(settings)
    extractor = LlmExtractor(settings)
    bitable = BitableWriter(settings, feishu._get_tenant_access_token)

    started = time.time()
    try:
        messages = await feishu.list_recent_messages(chat_id)
        if not messages:
            await feishu.reply_text(message_id, "未找到可整理的消息，请确认群内有近期讨论后再试。")
            return {"ok": True, "count": 0}

        extraction = await extractor.extract(messages)
        batch_id = make_batch_id()
        writable = [
            c for c in extraction.get("candidates", []) if c.get("type") != "noise"
        ]
        count = await bitable.create_records(
            batch_id=batch_id,
            session_summary=extraction.get("session_summary", ""),
            candidates=writable,
            trigger_message_id=message_id,
            chat_id=chat_id,
        )

        reply = (
            f"已整理 {count} 条，请在「需求收件箱」确认（待确认）\n"
            f"批次：{batch_id}"
        )
        await feishu.reply_text(message_id, reply)

        duration_ms = int((time.time() - started) * 1000)
        logger.info(
            "organize_success",
            extra={
                "batch_id": batch_id,
                "message_id": message_id,
                "candidate_count": count,
                "duration_ms": duration_ms,
            },
        )
        return {"ok": True, "batch_id": batch_id, "count": count}

    except Exception as exc:
        logger.exception("organize_failed", extra={"message_id": message_id})
        try:
            await feishu.reply_text(
                message_id,
                "整理失败：服务暂时不可用，请稍后重试或手工录入收件箱。",
            )
        except Exception:
            logger.exception("reply_failure_notice_failed")
        return {"ok": False, "error": str(exc)}


async def dry_run_extract(
    settings: Settings, messages: list[dict[str, Any]]
) -> dict[str, Any]:
    extractor = LlmExtractor(settings)
    return await extractor.extract(messages)

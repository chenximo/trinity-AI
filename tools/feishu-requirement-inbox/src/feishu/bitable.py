"""Feishu Bitable writer."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from src.config import Settings

logger = logging.getLogger(__name__)

TZ_CN = ZoneInfo("Asia/Shanghai")
FEISHU_BASE = "https://open.feishu.cn/open-apis"

TYPE_LABELS = {
    "bug": "Bug",
    "feature": "需求",
    "doc": "文档",
    "question": "咨询",
}


class BitableWriter:
    def __init__(self, settings: Settings, token_provider) -> None:
        self.settings = settings
        self._token_provider = token_provider

    async def create_records(
        self,
        *,
        batch_id: str,
        session_summary: str,
        candidates: list[dict[str, Any]],
        trigger_message_id: str,
        chat_id: str,
    ) -> int:
        created = 0
        for candidate in candidates:
            if candidate.get("type") == "noise":
                continue
            await self._create_record(
                batch_id=batch_id,
                session_summary=session_summary,
                candidate=candidate,
                trigger_message_id=trigger_message_id,
                chat_id=chat_id,
            )
            created += 1
        return created

    async def _create_record(
        self,
        *,
        batch_id: str,
        session_summary: str,
        candidate: dict[str, Any],
        trigger_message_id: str,
        chat_id: str,
    ) -> None:
        type_label = TYPE_LABELS.get(candidate.get("type", ""), "咨询")
        now_ms = int(datetime.now(TZ_CN).timestamp() * 1000)

        fields: dict[str, Any] = {
            "创建时间": now_ms,
            "批次 ID": batch_id,
            "类型": type_label,
            "标题": candidate.get("title", ""),
            "摘要": candidate.get("summary", ""),
            "建议模块": candidate.get("module_suggestion", ""),
            "提出人": candidate.get("reporter", ""),
            "含截图": bool(candidate.get("has_screenshot")),
            "原消息链接": {
                "link": candidate.get("message_link", ""),
                "text": candidate.get("title", "原消息"),
            },
            "会话摘要": session_summary,
            "状态": "待确认",
            "触发消息 ID": trigger_message_id,
            "群 ID": chat_id,
        }

        token = await self._token_provider()
        path = (
            f"/bitable/v1/apps/{self.settings.bitable_app_token}"
            f"/tables/{self.settings.bitable_table_id}/records"
        )
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{FEISHU_BASE}{path}",
                headers={"Authorization": f"Bearer {token}"},
                json={"fields": fields},
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("code") != 0:
                raise RuntimeError(f"Bitable create failed: {data}")

        logger.info(
            "bitable_record_created",
            extra={"batch_id": batch_id, "title": candidate.get("title")},
        )

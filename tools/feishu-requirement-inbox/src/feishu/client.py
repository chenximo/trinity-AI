"""Feishu Open API client."""

from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from src.config import Settings

logger = logging.getLogger(__name__)

TZ_CN = ZoneInfo("Asia/Shanghai")
FEISHU_BASE = "https://open.feishu.cn/open-apis"


class FeishuClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._token: str | None = None
        self._token_expires_at = 0.0

    async def _get_tenant_access_token(self) -> str:
        now = time.time()
        if self._token and now < self._token_expires_at - 60:
            return self._token

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{FEISHU_BASE}/auth/v3/tenant_access_token/internal",
                json={
                    "app_id": self.settings.feishu_app_id,
                    "app_secret": self.settings.feishu_app_secret,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("code") != 0:
                raise RuntimeError(f"Feishu token error: {data}")

        self._token = data["tenant_access_token"]
        self._token_expires_at = now + int(data.get("expire", 7200))
        return self._token

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        token = await self._get_tenant_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.request(
                method,
                f"{FEISHU_BASE}{path}",
                headers=headers,
                params=params,
                json=json_body,
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("code") != 0:
                raise RuntimeError(f"Feishu API {path} failed: {data}")
            return data

    async def reply_text(self, message_id: str, text: str) -> None:
        await self._request(
            "POST",
            f"/im/v1/messages/{message_id}/reply",
            json_body={
                "content": json.dumps({"text": text}, ensure_ascii=False),
                "msg_type": "text",
            },
        )

    async def list_recent_messages(self, chat_id: str) -> list[dict[str, Any]]:
        data = await self._request(
            "GET",
            "/im/v1/messages",
            params={
                "container_id_type": "chat",
                "container_id": chat_id,
                "page_size": min(self.settings.message_limit, 50),
                "sort_type": "ByCreateTimeDesc",
            },
        )

        cutoff = datetime.now(timezone.utc) - timedelta(
            hours=self.settings.message_window_hours
        )
        items = data.get("data", {}).get("items") or []
        parsed: list[dict[str, Any]] = []

        for item in items:
            create_ms = int(item.get("create_time", "0"))
            create_dt = datetime.fromtimestamp(create_ms / 1000, tz=timezone.utc)
            if create_dt < cutoff:
                continue

            body = item.get("body") or {}
            content_raw = body.get("content") or "{}"
            try:
                content = json.loads(content_raw)
            except json.JSONDecodeError:
                content = {"text": content_raw}

            text = content.get("text", "")
            has_image = bool(content.get("image_key"))

            sender = item.get("sender") or {}
            sender_id = sender.get("id") or ""
            sender_name = await self._resolve_sender_name(sender_id, sender.get("id_type"))

            parsed.append(
                {
                    "message_id": item.get("message_id"),
                    "sender_name": sender_name,
                    "create_time": create_dt.astimezone(TZ_CN).isoformat(),
                    "text": text,
                    "has_image": has_image,
                    "message_link": self._build_message_link(item.get("message_id")),
                }
            )

        parsed.sort(key=lambda m: m["create_time"])
        if len(parsed) > self.settings.message_limit:
            parsed = parsed[-self.settings.message_limit :]
        return parsed

    async def _resolve_sender_name(self, sender_id: str, id_type: str | None) -> str:
        if not sender_id:
            return "未知"
        if id_type != "open_id":
            return sender_id
        try:
            data = await self._request(
                "GET",
                "/contact/v3/users/" + sender_id,
                params={"user_id_type": "open_id"},
            )
            user = data.get("data", {}).get("user") or {}
            return user.get("name") or user.get("nickname") or sender_id
        except Exception:
            logger.debug("Failed to resolve sender %s", sender_id, exc_info=True)
            return sender_id

    @staticmethod
    def _build_message_link(message_id: str | None) -> str:
        if not message_id:
            return ""
        return f"https://applink.feishu.cn/client/message/link/open?message_id={message_id}"

    @staticmethod
    def message_text(content_json: str | None) -> str:
        if not content_json:
            return ""
        try:
            payload = json.loads(content_json)
        except json.JSONDecodeError:
            return content_json
        return str(payload.get("text") or "")

    def is_trigger_message(
        self,
        *,
        message_type: str | None,
        content_json: str | None,
        mentions: list[dict[str, Any]],
        bot_open_id: str | None = None,
    ) -> bool:
        if message_type != "text":
            return False
        text = self.message_text(content_json)
        if "整理" not in text:
            return False
        if not mentions:
            return False
        if bot_open_id:
            return any(m.get("id", {}).get("open_id") == bot_open_id for m in mentions)
        return True

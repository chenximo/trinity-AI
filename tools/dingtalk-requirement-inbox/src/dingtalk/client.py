"""DingTalk session webhook reply."""

from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)


async def reply_text(session_webhook: str, text: str) -> None:
    if not session_webhook:
        logger.warning("session_webhook missing, skip reply")
        return
    payload = {"msgtype": "text", "text": {"content": text}}
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(session_webhook, json=payload)
        resp.raise_for_status()
        data = resp.json()
        if data.get("errcode") not in (0, None):
            raise RuntimeError(f"dingtalk reply failed: {data}")

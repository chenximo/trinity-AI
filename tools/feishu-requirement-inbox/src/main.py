"""FastAPI entrypoint."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Request
from pydantic import BaseModel, Field

from src.config import get_settings
from src.feishu.events import (
    extract_message_event,
    get_challenge,
    is_url_verification,
    parse_event_body,
)
from src.pipeline import dry_run_extract, run_organize

settings = get_settings()
logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

app = FastAPI(title="feishu-requirement-inbox", version="0.1.0")


class DryRunRequest(BaseModel):
    messages: list[dict[str, Any]] = Field(default_factory=list)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "feishu-requirement-inbox"}


@app.post("/webhooks/feishu")
async def feishu_webhook(request: Request, background_tasks: BackgroundTasks) -> dict[str, Any]:
    body = await request.json()
    event = parse_event_body(body, settings.feishu_encrypt_key)

    if is_url_verification(event):
        challenge = get_challenge(event)
        if not challenge:
            raise HTTPException(status_code=400, detail="missing challenge")
        return {"challenge": challenge}

    header = event.get("header") or {}
    token = header.get("token")
    if settings.feishu_verification_token and token != settings.feishu_verification_token:
        raise HTTPException(status_code=403, detail="invalid verification token")

    message_event = extract_message_event(event)
    if not message_event:
        return {"ok": True, "skipped": True, "reason": "not_message_event"}

    chat_id = message_event.get("chat_id") or ""
    allowed = settings.allowed_chat_id_set()
    if allowed and chat_id not in allowed:
        logger.warning("chat_not_allowed", extra={"chat_id": chat_id})
        return {"ok": True, "skipped": True, "reason": "chat_not_allowed"}

    from src.feishu.client import FeishuClient

    feishu = FeishuClient(settings)
    if not feishu.is_trigger_message(
        message_type=message_event.get("message_type"),
        content_json=message_event.get("content"),
        mentions=message_event.get("mentions") or [],
    ):
        return {"ok": True, "skipped": True, "reason": "not_trigger"}

    message_id = message_event.get("message_id")
    if not message_id or not chat_id:
        return {"ok": False, "error": "missing message_id or chat_id"}

    background_tasks.add_task(run_organize, settings, message_id=message_id, chat_id=chat_id)
    return {"ok": True, "accepted": True, "message_id": message_id}


@app.post("/internal/dry-run")
async def internal_dry_run(
    payload: DryRunRequest,
    x_internal_token: str | None = Header(default=None),
) -> dict[str, Any]:
    if not settings.internal_dry_run_token:
        raise HTTPException(status_code=404, detail="dry-run disabled")
    if x_internal_token != settings.internal_dry_run_token:
        raise HTTPException(status_code=403, detail="forbidden")
    result = await dry_run_extract(settings, payload.messages)
    return {"ok": True, "result": result}

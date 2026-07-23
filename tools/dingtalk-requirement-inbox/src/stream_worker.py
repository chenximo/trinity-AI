"""DingTalk Stream bot worker."""

from __future__ import annotations

import asyncio
import logging
import threading
from typing import Any

import dingtalk_stream
from dingtalk_stream import AckMessage

from src.config import Settings, get_settings
from src.dingtalk.incoming import incoming_trigger_text
from src.dingtalk.reply import get_replied_msg_blob, has_quoted_reply
from src.pipeline import is_trigger, run_organize
from src.dingtalk.client import reply_text

logger = logging.getLogger(__name__)


class RequirementInboxBotHandler(dingtalk_stream.ChatbotHandler):
    def __init__(self, settings: Settings) -> None:
        super().__init__()
        self.settings = settings

    async def process(self, callback: dingtalk_stream.CallbackMessage):
        incoming = callback.data
        replied = get_replied_msg_blob(incoming)
        logger.info(
            "bot_message_received is_in_at_list=%s msgtype=%s has_quoted_reply=%s sender_union_id=%s "
            "sender_staff_id=%s text=%r replied_preview=%r",
            incoming.get("isInAtList"),
            incoming.get("msgtype"),
            has_quoted_reply(incoming),
            incoming.get("senderUnionId"),
            incoming.get("senderStaffId"),
            incoming_trigger_text(incoming),
            (replied or {}).get("content"),
        )
        if not is_trigger(incoming):
            return AckMessage.STATUS_OK, "skipped"

        logger.info(
            "organize_triggered conversation_id=%s msg_id=%s sender_union_id=%s",
            incoming.get("conversationId"),
            incoming.get("msgId"),
            incoming.get("senderUnionId"),
        )
        try:
            await run_organize(self.settings, incoming)
        except Exception:
            logger.exception("organize_failed")
            webhook = incoming.get("sessionWebhook") or ""
            if webhook:
                await reply_text(
                    webhook,
                    "整理失败：服务暂时不可用，请稍后重试或手工录入收件箱。",
                )
        return AckMessage.STATUS_OK, "OK"


def run_stream_forever(settings: Settings | None = None) -> None:
    settings = settings or get_settings()
    if not settings.dingtalk_client_id or not settings.dingtalk_client_secret:
        raise RuntimeError("DINGTALK_CLIENT_ID and DINGTALK_CLIENT_SECRET required")

    credential = dingtalk_stream.Credential(
        settings.dingtalk_client_id,
        settings.dingtalk_client_secret,
    )
    client = dingtalk_stream.DingTalkStreamClient(credential)
    client.register_callback_handler(
        dingtalk_stream.chatbot.ChatbotMessage.TOPIC,
        RequirementInboxBotHandler(settings),
    )
    logger.info("starting dingtalk stream client")
    client.start_forever()


def start_stream_in_background(settings: Settings | None = None) -> threading.Thread:
    settings = settings or get_settings()

    def _target() -> None:
        run_stream_forever(settings)

    thread = threading.Thread(target=_target, name="dingtalk-stream", daemon=True)
    thread.start()
    return thread

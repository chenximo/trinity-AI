"""Fetch group messages — requires Chat.Message.Read when enabled."""

from __future__ import annotations

import logging
from typing import Any

from src.config import Settings
from src.dingtalk.reply import build_quoted_message

logger = logging.getLogger(__name__)


async def fetch_conversation_messages(
    settings: Settings,
    *,
    conversation_id: str,
    trigger_message: dict[str, Any],
    incoming: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Return recent messages for extraction.

    Without Chat.Message.Read: trigger message plus optional quoted reply.
    """
    messages: list[dict[str, Any]] = []
    if incoming:
        quoted = build_quoted_message(incoming)
        if quoted:
            messages.append(quoted)
            logger.info(
                "using_quoted_reply chars=%s has_image=%s",
                len(quoted.get("text") or ""),
                quoted.get("has_image"),
            )

    messages.append(trigger_message)

    if settings.chat_message_read_enabled:
        # TODO: call Chat.Message.Read / conversation memory API after permission granted
        raise NotImplementedError(
            "Chat.Message.Read integration pending — set CHAT_MESSAGE_READ_ENABLED=true after approval"
        )

    if not settings.chat_message_read_enabled:
        logger.info(
            "chat_message_read disabled, message_count=%s conversation_id=%s",
            len(messages),
            conversation_id,
        )
    return messages

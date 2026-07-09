"""Feishu event decryption and parsing."""

from __future__ import annotations

import base64
import hashlib
import json
from typing import Any

from Crypto.Cipher import AES


def _unpad(data: bytes) -> bytes:
    pad_len = data[-1]
    return data[:-pad_len]


def decrypt_event(encrypt_key: str, encrypted: str) -> dict[str, Any]:
    """Decrypt Feishu encrypted event payload."""
    key = hashlib.sha256(encrypt_key.encode("utf-8")).digest()
    cipher = AES.new(key, AES.MODE_CBC, key[:16])
    decrypted = cipher.decrypt(base64.b64decode(encrypted))
    payload = json.loads(_unpad(decrypted).decode("utf-8"))
    return payload


def parse_event_body(body: dict[str, Any], encrypt_key: str) -> dict[str, Any]:
    if "encrypt" in body and encrypt_key:
        return decrypt_event(encrypt_key, body["encrypt"])
    return body


def is_url_verification(event: dict[str, Any]) -> bool:
    return event.get("type") == "url_verification"


def get_challenge(event: dict[str, Any]) -> str | None:
    return event.get("challenge")


def is_message_event(event: dict[str, Any]) -> bool:
    header = event.get("header") or {}
    return header.get("event_type") == "im.message.receive_v1"


def extract_message_event(event: dict[str, Any]) -> dict[str, Any] | None:
    if not is_message_event(event):
        return None
    event_data = event.get("event") or {}
    message = event_data.get("message") or {}
    sender = event_data.get("sender") or {}
    return {
        "message_id": message.get("message_id"),
        "chat_id": message.get("chat_id"),
        "message_type": message.get("message_type"),
        "content": message.get("content"),
        "mentions": message.get("mentions") or [],
        "sender_id": (sender.get("sender_id") or {}).get("open_id"),
    }

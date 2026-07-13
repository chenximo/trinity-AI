"""Download images/files from DingTalk robot message callbacks."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import httpx

from src.config import Settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DownloadedImage:
    filename: str
    content: bytes
    media_type: str


def guess_image_type(data: bytes) -> tuple[str, str]:
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", ".png"
    if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        return "image/gif", ".gif"
    if data.startswith(b"RIFF") and len(data) >= 12 and data[8:12] == b"WEBP":
        return "image/webp", ".webp"
    return "image/jpeg", ".jpg"


async def _get_access_token(settings: Settings) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.dingtalk.com/v1.0/oauth2/accessToken",
            json={
                "appKey": settings.dingtalk_client_id,
                "appSecret": settings.dingtalk_client_secret,
            },
        )
        resp.raise_for_status()
        token = resp.json().get("accessToken")
    if not token:
        raise RuntimeError("failed to get dingtalk access token")
    return token


async def download_robot_images(
    settings: Settings,
    *,
    download_codes: list[str],
    robot_code: str,
    filename_prefix: str,
) -> list[DownloadedImage]:
    if not download_codes or not robot_code:
        return []

    token = await _get_access_token(settings)
    headers = {"x-acs-dingtalk-access-token": token}
    images: list[DownloadedImage] = []

    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        for index, download_code in enumerate(download_codes, start=1):
            try:
                resp = await client.post(
                    "https://api.dingtalk.com/v1.0/robot/messageFiles/download",
                    headers=headers,
                    json={"downloadCode": download_code, "robotCode": robot_code},
                )
                resp.raise_for_status()
                download_url = (resp.json() or {}).get("downloadUrl")
                if not download_url:
                    logger.warning("robot_file_missing_download_url index=%s", index)
                    continue

                file_resp = await client.get(download_url)
                file_resp.raise_for_status()
                content = file_resp.content
                media_type, ext = guess_image_type(content)
                images.append(
                    DownloadedImage(
                        filename=f"{filename_prefix}-{index}{ext}",
                        content=content,
                        media_type=media_type,
                    )
                )
            except Exception:
                logger.exception("robot_image_download_failed index=%s", index)

    logger.info("robot_images_downloaded count=%s requested=%s", len(images), len(download_codes))
    return images


def resolve_robot_code(incoming: dict[str, Any], *, fallback: str = "") -> str:
    for key in ("robotCode", "chatbotUserId"):
        value = incoming.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return fallback.strip()

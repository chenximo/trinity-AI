"""Write rows to DingTalk AI Table (Notable)."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from src.config import Settings
from src.dingtalk.robot_files import DownloadedImage

logger = logging.getLogger(__name__)

TZ_CN = ZoneInfo("Asia/Shanghai")
TYPE_LABELS = {
    "bug": "Bug",
    "feature": "需求",
    "doc": "文档",
    "question": "咨询",
}


def attachment_target_indices(candidates: list[dict[str, Any]], attachment_count: int) -> set[int]:
    """Pick which candidate rows should receive trigger-message screenshots."""
    if attachment_count <= 0:
        return set()
    flagged = [index for index, item in enumerate(candidates) if item.get("has_screenshot")]
    if len(flagged) == 1:
        return {flagged[0]}
    if flagged:
        return set(flagged)
    if len(candidates) == 1:
        return {0}
    return set()


def _format_problem_description(candidate: dict[str, Any]) -> str:
    title = (candidate.get("title") or "").strip()
    summary = (candidate.get("summary") or "").strip()
    if title and summary:
        return f"{title}\n\n{summary}"
    return title or summary


class NotableWriter:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def create_records(
        self,
        *,
        batch_id: str,
        session_summary: str,
        candidates: list[dict[str, Any]],
        conversation_id: str,
        trigger_message_id: str,
        trigger_images: list[DownloadedImage] | None = None,
    ) -> int:
        if not self.settings.notable_write_enabled:
            raise RuntimeError("NOTABLE_WRITE_ENABLED is false")

        writable = [item for item in candidates if item.get("type") != "noise"]
        token = await self._get_access_token()
        uploaded_attachments: list[dict[str, Any]] = []
        if trigger_images and self.settings.notable_attach_images_enabled:
            uploaded_attachments = await self._upload_images(token=token, images=trigger_images)

        targets = attachment_target_indices(writable, len(uploaded_attachments))
        created = 0
        for index, candidate in enumerate(writable):
            attachments = uploaded_attachments if index in targets else []
            await self._create_record(
                token=token,
                batch_id=batch_id,
                session_summary=session_summary,
                candidate=candidate,
                conversation_id=conversation_id,
                trigger_message_id=trigger_message_id,
                attachments=attachments,
            )
            created += 1
        return created

    async def _get_access_token(self) -> str:
        url = "https://api.dingtalk.com/v1.0/oauth2/accessToken"
        payload = {
            "appKey": self.settings.dingtalk_client_id,
            "appSecret": self.settings.dingtalk_client_secret,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
        token = data.get("accessToken")
        if not token:
            raise RuntimeError(f"failed to get dingtalk access token: {data}")
        return token

    async def _upload_images(
        self,
        *,
        token: str,
        images: list[DownloadedImage],
    ) -> list[dict[str, Any]]:
        base_id = self.settings.notable_base_id
        operator = self.settings.notable_operator_union_id
        if not base_id or not operator:
            return []

        uploaded: list[dict[str, Any]] = []
        headers = {"x-acs-dingtalk-access-token": token}
        query_url = (
            f"https://api.dingtalk.com/v1.0/doc/docs/resources/{base_id}/uploadInfos/query"
        )

        async with httpx.AsyncClient(timeout=90.0) as client:
            for image in images:
                try:
                    resp = await client.post(
                        query_url,
                        params={"operatorId": operator},
                        headers=headers,
                        json={
                            "size": len(image.content),
                            "mediaType": image.media_type,
                            "resourceName": image.filename,
                        },
                    )
                    if resp.status_code >= 400:
                        logger.error(
                            "notable_upload_info_failed status=%s body=%s",
                            resp.status_code,
                            resp.text,
                        )
                        resp.raise_for_status()
                    result = (resp.json() or {}).get("result") or {}
                    upload_url = result.get("uploadUrl")
                    resource_id = result.get("resourceId")
                    resource_url = result.get("resourceUrl")
                    if not upload_url or not resource_id or not resource_url:
                        logger.warning("notable_upload_info_incomplete filename=%s", image.filename)
                        continue

                    put_resp = await client.put(
                        upload_url,
                        content=image.content,
                        headers={"Content-Type": image.media_type},
                    )
                    put_resp.raise_for_status()
                    uploaded.append(
                        {
                            "filename": image.filename,
                            "size": len(image.content),
                            "type": image.media_type,
                            "url": resource_url,
                            "resourceId": resource_id,
                        }
                    )
                except Exception:
                    logger.exception("notable_image_upload_failed filename=%s", image.filename)

        logger.info("notable_images_uploaded count=%s requested=%s", len(uploaded), len(images))
        return uploaded

    async def _create_record(
        self,
        *,
        token: str,
        batch_id: str,
        session_summary: str,
        candidate: dict[str, Any],
        conversation_id: str,
        trigger_message_id: str,
        attachments: list[dict[str, Any]],
    ) -> None:
        base_id = self.settings.notable_base_id
        sheet = self.settings.notable_sheet_id or self.settings.notable_sheet_name
        operator = self.settings.notable_operator_union_id
        if not base_id or not sheet or not operator:
            raise RuntimeError(
                "NOTABLE_BASE_ID / NOTABLE_SHEET_ID(or NAME) / NOTABLE_OPERATOR_UNION_ID required"
            )

        fields: dict[str, Any] = {
            "批次 ID": batch_id,
            "类型": TYPE_LABELS.get(candidate.get("type", ""), "咨询"),
            "问题描述": _format_problem_description(candidate),
            "所属模块": candidate.get("module_suggestion", ""),
            "发现者": candidate.get("reporter", ""),
            "处理进度": "待确认",
            "原消息链接": candidate.get("message_link", ""),
            "会话摘要": session_summary,
            "群 ID": conversation_id,
            "触发消息 ID": trigger_message_id,
        }
        screenshot_field = self.settings.notable_screenshot_field.strip() or "截图"
        if attachments:
            fields[screenshot_field] = attachments

        path = (
            f"https://api.dingtalk.com/v1.0/notable/bases/{base_id}"
            f"/sheets/{sheet}/records"
        )
        params = {
            "operatorId": operator,
            "clientToken": str(uuid.uuid4()),
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                path,
                params=params,
                headers={"x-acs-dingtalk-access-token": token},
                json={"records": [{"fields": fields}]},
            )
            if resp.status_code >= 400:
                logger.error(
                    "notable_create_failed status=%s body=%s fields=%s",
                    resp.status_code,
                    resp.text,
                    list(fields.keys()),
                )
            resp.raise_for_status()
            data = resp.json()
        logger.info(
            "notable_record_created batch_id=%s title=%s attachments=%s",
            batch_id,
            candidate.get("title"),
            len(attachments),
        )
        if data.get("success") is False:
            raise RuntimeError(f"notable create failed: {data}")


def make_batch_id() -> str:
    now = datetime.now(TZ_CN)
    suffix = uuid.uuid4().hex[:4]
    return now.strftime("%Y%m%d-%H%M") + f"-{suffix}"

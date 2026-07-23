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
    "optimization": "优化",
}

DEFAULT_PRIORITY = {
    "bug": "P0",
    "feature": "P1",
    "optimization": "P2",
}

TEAM_REPORTER_NAMES = ("崔宇光", "李玲", "任晓雷")


DEFAULT_OWNER_NAMES = {
    "bug": "崔宇光",
    "feature": "李玲",
    "optimization": "崔宇光",
}


def team_union_ids(settings: Settings) -> dict[str, str]:
    mapping: dict[str, str] = {}
    if settings.notable_owner_default_union_id.strip():
        mapping["崔宇光"] = settings.notable_owner_default_union_id.strip()
    if settings.notable_owner_product_union_id.strip():
        mapping["李玲"] = settings.notable_owner_product_union_id.strip()
    if settings.notable_team_renxiaolei_union_id.strip():
        mapping["任晓雷"] = settings.notable_team_renxiaolei_union_id.strip()
    return mapping


def resolve_owner_name(item_type: str) -> str:
    return DEFAULT_OWNER_NAMES.get(item_type, "崔宇光")


def format_rich_text(value: str) -> list[dict[str, str]]:
    text = (value or "").strip()
    if not text:
        return []
    return [{"type": "text", "text": text}]


def format_problem_description(title: str, summary: str) -> str:
    """Merge title + body for the 问题描述 column (list UI truncates 标题)."""
    title = (title or "").strip()
    summary = (summary or "").strip()
    if not title:
        return summary
    if not summary:
        return title
    # Avoid duplicating when model already put the title into summary.
    if summary.startswith(title) or title in summary.split("\n", 1)[0]:
        return summary
    return f"{title}\n\n{summary}"


def format_user_field(union_id: str) -> list[dict[str, str]]:
    uid = union_id.strip()
    if not uid:
        return []
    return [{"unionId": uid}]


def normalize_reporter(name: str) -> str:
    text = (name or "").strip()
    if not text:
        return ""
    for known in TEAM_REPORTER_NAMES:
        if known in text or text in known:
            return known
    return text


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


def format_created_time() -> str:
    return datetime.now(TZ_CN).strftime("%Y-%m-%d %H:%M")


def build_notable_fields(
    *,
    batch_id: str,
    session_summary: str,
    candidate: dict[str, Any],
    attachments: list[dict[str, Any]],
    screenshot_field: str,
    settings: Settings,
) -> dict[str, Any]:
    """Map one candidate to DingTalk Notable column names (must match sheet headers)."""
    item_type = candidate.get("type", "")
    reporter = normalize_reporter(candidate.get("reporter", ""))
    # 「标题」需有值（多维表主键/必填；写空会导致文本字段整行不落库）。
    # 完整内容写入「问题描述」= 标题 + 正文，避免列表截断后看不到详情。
    title = (candidate.get("title") or "").strip()
    summary = (candidate.get("summary") or "").strip()
    description = format_problem_description(title, summary)
    if not title and description:
        title = description.split("\n", 1)[0][:80]
    fields: dict[str, Any] = {
        "创建时间": format_created_time(),
        "类型": TYPE_LABELS.get(item_type, "需求"),
        "标题": title,
        "问题描述": format_rich_text(description),
        "所属模块": candidate.get("module_suggestion", ""),
        "优先级": DEFAULT_PRIORITY.get(item_type, "P1"),
        "处理进度": "待确认",
        "负责人": resolve_owner_name(item_type),
        "会话摘要": session_summary,
    }
    reporter_union_id = team_union_ids(settings).get(reporter)
    if reporter_union_id:
        fields["发现者"] = format_user_field(reporter_union_id)
    elif reporter:
        logger.warning("reporter_union_id_missing name=%s", reporter)
    if attachments:
        fields[screenshot_field] = attachments
    return fields


class NotableWriter:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def create_records(
        self,
        *,
        batch_id: str,
        session_summary: str,
        candidates: list[dict[str, Any]],
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
        attachments: list[dict[str, Any]],
    ) -> None:
        base_id = self.settings.notable_base_id
        sheet = self.settings.notable_sheet_id or self.settings.notable_sheet_name
        operator = self.settings.notable_operator_union_id
        if not base_id or not sheet or not operator:
            raise RuntimeError(
                "NOTABLE_BASE_ID / NOTABLE_SHEET_ID(or NAME) / NOTABLE_OPERATOR_UNION_ID required"
            )

        screenshot_field = self.settings.notable_screenshot_field.strip() or "图片和附件"
        fields = build_notable_fields(
            batch_id=batch_id,
            session_summary=session_summary,
            candidate=candidate,
            attachments=attachments,
            screenshot_field=screenshot_field,
            settings=self.settings,
        )

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
        desc_text = ""
        desc_field = fields.get("问题描述") or []
        if isinstance(desc_field, list):
            desc_text = "".join(
                str(part.get("text") or "") for part in desc_field if isinstance(part, dict)
            )
        logger.info(
            "notable_record_created batch_id=%s title=%s desc_chars=%s attachments=%s",
            batch_id,
            fields.get("标题"),
            len(desc_text),
            len(attachments),
        )
        if data.get("success") is False:
            raise RuntimeError(f"notable create failed: {data}")


def make_batch_id() -> str:
    now = datetime.now(TZ_CN)
    suffix = uuid.uuid4().hex[:4]
    return now.strftime("%Y%m%d-%H%M") + f"-{suffix}"

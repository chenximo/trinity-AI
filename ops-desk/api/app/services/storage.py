"""对象存储：本地 + 腾讯云 COS（合同 / 付款单 / 确认单等）。"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from app.config import settings


def cos_enabled() -> bool:
    return (
        (settings.storage or "").lower() == "cos"
        and bool(settings.cos_secret_id)
        and bool(settings.cos_secret_key)
        and bool(settings.cos_bucket)
    )


def _prefix() -> str:
    p = (settings.cos_prefix or "trinity-Ops-Desk/").strip()
    if p and not p.endswith("/"):
        p += "/"
    return p or "trinity-Ops-Desk/"


def cos_key(*parts: str) -> str:
    """拼对象键：trinity-Ops-Desk/contracts/shanhe/xxx.docx"""
    segs = [p.strip("/").replace("\\", "/") for p in parts if p and str(p).strip()]
    return _prefix() + "/".join(segs)


def public_url(key: str) -> str:
    if settings.cos_public_base:
        base = settings.cos_public_base.rstrip("/")
        return f"{base}/{key.lstrip('/')}"
    return (
        f"https://{settings.cos_bucket}.cos.{settings.cos_region}.myqcloud.com/"
        f"{key.lstrip('/')}"
    )


def _client():
    from qcloud_cos import CosConfig, CosS3Client  # type: ignore

    conf = CosConfig(
        Region=settings.cos_region,
        SecretId=settings.cos_secret_id,
        SecretKey=settings.cos_secret_key,
        Scheme="https",
    )
    return CosS3Client(conf)


def ensure_prefix_markers() -> list[str]:
    """用空对象占位，在控制台里能看见目录结构。"""
    if not cos_enabled():
        return []
    client = _client()
    created: list[str] = []
    for sub in (
        "contracts/",
        "payments/",
        "settlement-confirm/",
        "invoices/",
        "templates/",
    ):
        key = cos_key(sub.rstrip("/"), ".keep")
        try:
            client.put_object(
                Bucket=settings.cos_bucket,
                Key=key,
                Body=b"",
                ContentType="text/plain",
            )
            created.append(key)
        except Exception:
            raise
    return created


def upload_file(local_path: Path, key: str, content_type: Optional[str] = None) -> str:
    """上传本地文件，返回对象键。"""
    if not cos_enabled():
        raise RuntimeError("COS 未启用（检查 OPS_DESK_STORAGE / SECRET_*）")
    path = Path(local_path)
    if not path.is_file():
        raise FileNotFoundError(str(path))
    body = path.read_bytes()
    extra = {}
    if content_type:
        extra["ContentType"] = content_type
    elif path.suffix.lower() == ".docx":
        extra["ContentType"] = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    elif path.suffix.lower() == ".pdf":
        extra["ContentType"] = "application/pdf"
    client = _client()
    client.put_object(
        Bucket=settings.cos_bucket,
        Key=key,
        Body=body,
        **extra,
    )
    return key


def download_bytes(key: str) -> bytes:
    if not cos_enabled():
        raise RuntimeError("COS 未启用")
    client = _client()
    resp = client.get_object(Bucket=settings.cos_bucket, Key=key)
    body = resp["Body"]
    return body.read()


def object_exists(key: str) -> bool:
    if not cos_enabled():
        return False
    client = _client()
    try:
        client.head_object(Bucket=settings.cos_bucket, Key=key)
        return True
    except Exception:
        return False


def list_prefix(prefix: str, max_keys: int = 200) -> list[dict]:
    """列出某前缀下对象（跳过目录占位 .keep）。"""
    if not cos_enabled():
        return []
    client = _client()
    pfx = prefix if prefix.endswith("/") or not prefix else prefix + "/"
    # 允许相对 trinity-Ops-Desk 的短前缀
    if not pfx.startswith(_prefix()):
        pfx = cos_key(pfx.rstrip("/")) + ("/" if not pfx.endswith("/") else "")
    out: list[dict] = []
    marker = ""
    while True:
        kwargs = {
            "Bucket": settings.cos_bucket,
            "Prefix": pfx,
            "MaxKeys": min(max_keys - len(out), 100) or 100,
        }
        if marker:
            kwargs["Marker"] = marker
        resp = client.list_objects(**kwargs)
        for o in resp.get("Contents") or []:
            key = o["Key"]
            name = key.rsplit("/", 1)[-1]
            if not name or name == ".keep":
                continue
            out.append(
                {
                    "key": key,
                    "name": name,
                    "size": int(o.get("Size") or 0),
                    "url": public_url(key),
                    "last_modified": str(o.get("LastModified") or ""),
                }
            )
            if len(out) >= max_keys:
                return out
        if resp.get("IsTruncated") == "true" or resp.get("IsTruncated") is True:
            marker = resp.get("NextMarker") or (out[-1]["key"] if out else "")
            if not marker:
                break
        else:
            break
    return out

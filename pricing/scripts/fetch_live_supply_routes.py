#!/usr/bin/env python3
"""从现网 Admin API 拉取线路管理导出（与后台「线路管理 → 导出」同口径）。

环境变量：
  TRINITY_ADMIN_API_BASE  默认 https://trinityadm.trinitydesk.ai/api（勿用 api.trinitydesk.ai）
  TRINITY_ADMIN_TOKEN     Admin 登录 JWT（Bearer；优先）
  TRINITY_ADMIN_USER      无 JWT 时用账号密码登录拿 token
  TRINITY_ADMIN_PASSWORD
  TRINITY_OPS_TOKEN       X-Trinity-Ops-Token（仅 internal，不能拉 export）

说明：
  trinityadm 登录响应偶发 chunked 截断，Python urllib 会 IncompleteRead；
  本脚本 HTTP 优先走系统 curl，失败再退回 urllib。

示例：
  export TRINITY_ADMIN_TOKEN='eyJ...'
  # 或：
  export TRINITY_ADMIN_USER='…' TRINITY_ADMIN_PASSWORD='…'
  python3 pricing/scripts/fetch_live_supply_routes.py
  python3 pricing/scripts/fetch_live_supply_routes.py --modality video
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "input" / "routes-live"

MODALITIES = {
    "text": "text",
    "image": "image",
    "video": "video",
}

_TOKEN_CACHE: str | None = None


def api_base() -> str:
    base = (
        os.environ.get("TRINITY_ADMIN_API_BASE") or "https://trinityadm.trinitydesk.ai/api"
    ).strip()
    return base.rstrip("/")


def _curl_bin() -> str | None:
    return shutil.which("curl")


def _http_curl(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    body: bytes | None = None,
    timeout: int = 120,
) -> tuple[int, bytes]:
    curl = _curl_bin()
    if not curl:
        raise RuntimeError("curl not found")
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        out_path = Path(tmp.name)
    try:
        cmd = [
            curl,
            "-sS",
            "-X",
            method,
            url,
            "-o",
            str(out_path),
            "-w",
            "%{http_code}",
            "--max-time",
            str(timeout),
        ]
        for k, v in (headers or {}).items():
            cmd.extend(["-H", f"{k}: {v}"])
        if body is not None:
            cmd.extend(["--data-binary", body])
        proc = subprocess.run(cmd, capture_output=True, check=False)
        if proc.returncode != 0:
            err = (proc.stderr or b"").decode("utf-8", errors="replace")[:300]
            raise RuntimeError(f"curl exit {proc.returncode}: {err}")
        code = int((proc.stdout or b"0").decode().strip() or "0")
        data = out_path.read_bytes() if out_path.exists() else b""
        return code, data
    finally:
        out_path.unlink(missing_ok=True)


def _http_urllib(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    body: bytes | None = None,
    timeout: int = 120,
) -> tuple[int, bytes]:
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return int(resp.status), resp.read()
    except urllib.error.HTTPError as e:
        return int(e.code), e.read()


def http_request(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    body: bytes | None = None,
    timeout: int = 120,
) -> tuple[int, bytes]:
    """Prefer curl (avoids urllib IncompleteRead on trinityadm); fallback urllib."""
    if _curl_bin():
        try:
            return _http_curl(method, url, headers=headers, body=body, timeout=timeout)
        except Exception as exc:  # noqa: BLE001
            print(f"[http] curl failed ({exc}); fallback urllib")
    return _http_urllib(method, url, headers=headers, body=body, timeout=timeout)


def login_admin_token(username: str, password: str) -> str:
    url = f"{api_base()}/v1/admin/auth/login"
    payload = json.dumps({"username": username, "password": password}).encode("utf-8")
    code, raw = http_request(
        "POST",
        url,
        headers={"Content-Type": "application/json"},
        body=payload,
        timeout=60,
    )
    if code != 200:
        detail = raw.decode("utf-8", errors="replace")[:400]
        raise SystemExit(f"Admin 登录失败 HTTP {code}: {detail}")
    try:
        body = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as e:
        raise SystemExit(f"Admin 登录响应非 JSON: {raw[:200]!r}") from e
    data = body.get("data") if isinstance(body, dict) else None
    if not isinstance(data, dict):
        data = body if isinstance(body, dict) else {}
    token = str(data.get("accessToken") or data.get("token") or "").strip()
    if not token.startswith("eyJ"):
        raise SystemExit(f"Admin 登录未返回 JWT（keys={list(data.keys())}）")
    print(f"[auth] login ok as {username}")
    return token


def admin_token() -> str:
    global _TOKEN_CACHE
    if _TOKEN_CACHE:
        return _TOKEN_CACHE

    token = (os.environ.get("TRINITY_ADMIN_TOKEN") or "").strip()
    if token:
        _TOKEN_CACHE = token
        return token

    user = (os.environ.get("TRINITY_ADMIN_USER") or "").strip()
    password = os.environ.get("TRINITY_ADMIN_PASSWORD") or ""
    if user and password:
        _TOKEN_CACHE = login_admin_token(user, password)
        os.environ["TRINITY_ADMIN_TOKEN"] = _TOKEN_CACHE
        return _TOKEN_CACHE

    ops = (os.environ.get("TRINITY_OPS_TOKEN") or "").strip()
    if ops:
        raise SystemExit(
            "检测到 TRINITY_OPS_TOKEN（X-Trinity-Ops-Token），但线路导出需要 Admin 登录 JWT。\n"
            "请设置 TRINITY_ADMIN_TOKEN=eyJ…，或 TRINITY_ADMIN_USER + TRINITY_ADMIN_PASSWORD。"
        )
    raise SystemExit(
        "缺少鉴权：请设置 TRINITY_ADMIN_TOKEN（JWT），"
        "或 TRINITY_ADMIN_USER + TRINITY_ADMIN_PASSWORD 自动登录。"
    )


def fetch_export(modality: str, enabled: bool = True) -> bytes:
    params = urllib.parse.urlencode(
        {
            "modalityType": modality,
            "enabled": "true" if enabled else "false",
        }
    )
    url = f"{api_base()}/v1/admin/model-supply-routes/export?{params}"
    code, body = http_request(
        "GET",
        url,
        headers={"Authorization": f"Bearer {admin_token()}"},
        timeout=120,
    )
    if code == 401:
        raise SystemExit(
            f"拉取失败 HTTP 401: JWT 无效或过期。请换 TRINITY_ADMIN_TOKEN，"
            f"或用 USER/PASSWORD 重新登录。\n{body.decode('utf-8', errors='replace')[:300]}"
        )
    if code != 200:
        detail = body.decode("utf-8", errors="replace")[:500]
        raise SystemExit(f"拉取失败 HTTP {code}: {detail}")
    if not body:
        raise SystemExit(f"空响应: {modality}")
    return body


def write_exports(out_dir: Path, modalities: list[str]) -> dict[str, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    # resolve token once（含自动登录）
    admin_token()
    written: dict[str, Path] = {}
    for m in modalities:
        data = fetch_export(m, enabled=True)
        path = out_dir / f"{m}-enabled.xlsx"
        path.write_bytes(data)
        written[m] = path
        print(f"[fetch] {m}: {len(data)} bytes -> {path}")
    readme = out_dir / "README.md"
    readme.write_text(
        f"# routes-live · {date.today().isoformat()}\n\n"
        f"来源：`GET /v1/admin/model-supply-routes/export?enabled=true&modalityType=<text|image|video>`\n"
        f"API: `{api_base()}`\n\n"
        "鉴权：`TRINITY_ADMIN_TOKEN` 或 `TRINITY_ADMIN_USER`+`TRINITY_ADMIN_PASSWORD`\n\n"
        "重建商务总表：\n"
        "```bash\n"
        "python3 pricing/scripts/rebuild_workbook_from_live_api.py\n"
        "# 或已有 xlsx：\n"
        "python3 apps/trinity-product/docs/ai-api-platform/commercial-billing/scripts/rebuild_discount_tier_workbook.py \\\n"
        "  --from-export-text pricing/input/routes-live/text-enabled.xlsx \\\n"
        "  --from-export-image pricing/input/routes-live/image-enabled.xlsx \\\n"
        "  --from-export-video pricing/input/routes-live/video-enabled.xlsx\n"
        "```\n",
        encoding="utf-8",
    )
    return written


def main() -> None:
    parser = argparse.ArgumentParser(description="从现网拉取线路管理导出 xlsx")
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=DEFAULT_OUT,
        help=f"输出目录（默认 {DEFAULT_OUT}）",
    )
    parser.add_argument(
        "--modality",
        choices=["text", "image", "video", "all"],
        default="all",
        help="拉取模态（默认 all）",
    )
    args = parser.parse_args()
    mods = list(MODALITIES.keys()) if args.modality == "all" else [args.modality]
    write_exports(args.out_dir.resolve(), mods)
    print(f"done: {args.out_dir}")


if __name__ == "__main__":
    main()

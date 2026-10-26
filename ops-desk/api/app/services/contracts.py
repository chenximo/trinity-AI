"""合同样板扫描 + 客户合同留档路径 + 更新动态。"""

from __future__ import annotations

import json
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from app.config import settings

STATUS_LABELS = {
    "draft": "草稿",
    "review": "评审中",
    "signed": "已签约",
    "expired": "已到期",
    "void": "作废",
}

DEFAULT_PARTY_B = "陕西星瀚算力信息科技有限公司"

FEED_KIND_LABELS = {
    "module": "模块",
    "template": "样板",
    "contract": "客户合同",
    "company": "公司归档",
    "note": "备注",
}

# 运营台按东八区展示；SQLite datetime('now') 默认 UTC
_FEED_NOW_SQL = "datetime('now', '+8 hours')"


@dataclass
class TemplateInfo:
    key: str
    name: str
    filename: str
    path: str
    suffix: str
    size: int
    note: str
    kind: str = ""
    pending_latest: bool = False


def _template_root() -> Path:
    return settings.resolved_contract_template_dir()


def _load_manifest() -> list[dict]:
    root = _template_root()
    mf = root / "manifest.json"
    if not mf.is_file():
        return []
    try:
        data = json.loads(mf.read_text(encoding="utf-8"))
        return list(data.get("templates") or [])
    except (OSError, json.JSONDecodeError):
        return []


def list_templates() -> List[TemplateInfo]:
    """只展示 manifest 中的官方样板（下游框架中/英 + 居间等）。"""
    root = _template_root()
    if not root.is_dir():
        return []
    entries = _load_manifest()
    if not entries:
        # 无 manifest 时回退扫目录（兼容旧环境）
        return _scan_legacy(root)

    out: List[TemplateInfo] = []
    for e in entries:
        key = str(e.get("key") or "").strip()
        rel = str(e.get("relpath") or "").strip()
        if not key or not rel:
            continue
        path = root / rel
        pending = bool(e.get("pending_latest"))
        note = str(e.get("note") or "")
        if not path.is_file():
            fb = str(e.get("fallback") or "").strip()
            if fb and (root / fb).is_file():
                path = root / fb
                pending = True
                if "待" not in note:
                    note = (note + " · 暂用旧稿，待换最新版").strip(" ·")
            else:
                # 占位：文件未到
                out.append(
                    TemplateInfo(
                        key=key,
                        name=str(e.get("label") or Path(rel).stem),
                        filename=Path(rel).name,
                        path=str((root / rel).resolve()),
                        suffix=Path(rel).suffix.lower() or ".docx",
                        size=0,
                        note=note or "文件尚未放入样板目录",
                        kind=str(e.get("kind") or ""),
                        pending_latest=True,
                    )
                )
                continue
        out.append(
            TemplateInfo(
                key=key,
                name=str(e.get("label") or path.stem),
                filename=path.name,
                path=str(path.resolve()),
                suffix=path.suffix.lower(),
                size=path.stat().st_size if path.is_file() else 0,
                note=note,
                kind=str(e.get("kind") or ""),
                pending_latest=pending,
            )
        )
    return out


def _scan_legacy(root: Path) -> List[TemplateInfo]:
    out: List[TemplateInfo] = []
    for p in sorted(root.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() not in {".doc", ".docx", ".pdf"}:
            continue
        if p.name.startswith("~") or p.name.startswith(".") or p.name.startswith(".~"):
            continue
        if p.name == "manifest.json":
            continue
        key = _slug(p.name)
        out.append(
            TemplateInfo(
                key=key,
                name=p.stem,
                filename=p.name,
                path=str(p.resolve()),
                suffix=p.suffix.lower(),
                size=p.stat().st_size,
                note="",
            )
        )
    return out


def _slug(name: str) -> str:
    base = Path(name).stem
    if "下游客户样板" in base or ("框架协议" in base and "下游" in base):
        return "downstream-framework"
    if "居间服务协议" in base:
        return "channel-intermediary-v1"
    if "渠道合作协议" in base:
        return "channel-coop"
    ascii_part = re.sub(r"[^A-Za-z0-9\-]+", "-", base).strip("-").lower()
    if ascii_part and re.search(r"[a-z0-9]", ascii_part):
        return re.sub(r"-+", "-", ascii_part)
    s = re.sub(r"[^\w\u4e00-\u9fff\-]+", "-", base, flags=re.UNICODE)
    s = re.sub(r"-+", "-", s).strip("-").lower()
    return s or "template"


def find_template(key: str) -> Optional[TemplateInfo]:
    key = (key or "").strip()
    if not key:
        return None
    for t in list_templates():
        if t.key == key or t.filename == key or t.name == key:
            if t.size <= 0:
                return None
            return t
    return None


def customer_archive_dir(customer_id: str) -> Path:
    d = settings.resolved_contract_archive_dir() / customer_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def copy_template_to_archive(
    *,
    customer_id: str,
    template_key: str,
    dest_stem: Optional[str] = None,
) -> Path:
    tpl = find_template(template_key)
    if not tpl:
        raise FileNotFoundError(f"样板不存在或文件未就绪：{template_key}")
    src = Path(tpl.path)
    if not src.is_file():
        raise FileNotFoundError(f"样板文件缺失：{src}")
    stem = dest_stem or f"{customer_id}_{tpl.name}"
    stem = re.sub(r'[\\/:*?"<>|]+', "_", stem)
    dest = customer_archive_dir(customer_id) / f"{stem}{src.suffix}"
    n = 1
    while dest.exists():
        dest = customer_archive_dir(customer_id) / f"{stem}_{n}{src.suffix}"
        n += 1
    shutil.copy2(src, dest)
    return dest


def sync_file_to_cos(local_path: Path, customer_id: str) -> Optional[str]:
    from app.services import storage as sto

    if not sto.cos_enabled():
        return None
    path = Path(local_path)
    if not path.is_file():
        return None
    key = sto.cos_key("contracts", customer_id, path.name)
    sto.upload_file(path, key)
    return key


def resolve_existing_file(path_str: Optional[str]) -> Optional[Path]:
    if not path_str:
        return None
    p = Path(path_str)
    if p.is_file():
        return p
    alt = settings.repo_root / path_str
    if alt.is_file():
        return alt
    return None


def append_feed(
    conn,
    *,
    kind: str,
    title: str,
    body: str = "",
    ref_key: str = "",
    replace_same_ref: bool = False,
) -> None:
    """写入更新动态。replace_same_ref=True 时同 ref_key 只保留最新一条（避免重复上传刷屏）。"""
    rk = (ref_key or "").strip()
    if replace_same_ref and rk:
        conn.execute("DELETE FROM contract_feed WHERE ref_key = ?", (rk,))
    conn.execute(
        f"""
        INSERT INTO contract_feed (kind, title, body, ref_key, created_at)
        VALUES (?, ?, ?, ?, {_FEED_NOW_SQL})
        """,
        (kind, title.strip(), (body or "").strip(), rk),
    )


def cleanup_contract_feed(conn) -> None:
    """去重同 ref_key；把历史 UTC 墙钟一次性改为东八区；公司上传改 kind。"""
    # 同 ref_key 只留最新
    conn.execute(
        """
        DELETE FROM contract_feed
        WHERE ref_key != ''
          AND id NOT IN (
            SELECT MAX(id) FROM contract_feed WHERE ref_key != '' GROUP BY ref_key
          )
        """
    )
    # 公司 COS 路径误标为客户合同
    conn.execute(
        """
        UPDATE contract_feed
        SET kind = 'company'
        WHERE kind = 'contract'
          AND (
            ref_key LIKE '%/contracts/company/%'
            OR body LIKE 'company ·%'
          )
        """
    )
    # 一次性时区修正（标记表避免反复 +8）
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS ops_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL DEFAULT ''
        )
        """
    )
    done = conn.execute(
        "SELECT value FROM ops_meta WHERE key = 'contract_feed_cst_v1'"
    ).fetchone()
    if done:
        return
    conn.execute(
        """
        UPDATE contract_feed
        SET created_at = datetime(created_at, '+8 hours')
        WHERE created_at IS NOT NULL AND created_at != ''
        """
    )
    conn.execute(
        "INSERT OR REPLACE INTO ops_meta (key, value) VALUES ('contract_feed_cst_v1', '1')"
    )


def seed_contract_feed(conn) -> None:
    row = conn.execute("SELECT COUNT(*) AS c FROM contract_feed").fetchone()
    if row and int(row["c"] or 0) > 0:
        return
    append_feed(
        conn,
        kind="module",
        title="合同模块启用",
        body="样板库固定两份：下游客户框架协议 + 渠道合作协议；客户合同与更新动态同页管理。",
    )
    append_feed(
        conn,
        kind="template",
        title="样板：下游客户框架协议",
        body="Trinity-AI生成服务平台采购与技术服务框架协议-下游客户样板",
        ref_key="downstream-framework",
    )
    append_feed(
        conn,
        kind="template",
        title="样板：模型居间服务协议 v1.0 终版",
        body="Trinity-AI模型居间服务协议-v1.0.docx",
        ref_key="channel-intermediary-v1",
    )

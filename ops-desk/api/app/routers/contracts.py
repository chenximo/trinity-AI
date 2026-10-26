from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.db import connect
from app.services.contracts import (
    DEFAULT_PARTY_B,
    FEED_KIND_LABELS,
    STATUS_LABELS,
    append_feed,
    copy_template_to_archive,
    find_template,
    list_templates,
    resolve_existing_file,
    sync_file_to_cos,
)
from app.services import storage as sto

router = APIRouter(prefix="/contracts", tags=["contracts"])


class TemplateOut(BaseModel):
    key: str
    name: str
    filename: str
    path: str
    suffix: str
    size: int
    note: str
    kind: str = ""
    pending_latest: bool = False
    download_url: Optional[str] = None


class FeedIn(BaseModel):
    title: str
    body: str = ""
    kind: str = "note"
    ref_key: str = ""


class FeedOut(BaseModel):
    id: int
    kind: str
    kind_label: str
    title: str
    body: str
    ref_key: str
    created_at: Optional[str]


class ContractIn(BaseModel):
    customer_id: str
    title: str
    contract_no: str = ""
    party_a: str = ""
    party_b: str = DEFAULT_PARTY_B
    template_key: str = ""
    status: str = "draft"
    signed_date: Optional[str] = None
    effective_start: Optional[str] = None
    effective_end: Optional[str] = None
    invoice_title: str = ""
    file_path: Optional[str] = None
    note: str = ""
    copy_template: bool = Field(
        False, description="创建时是否从样板库复制一份到 AI云业务/合同/{customer}/"
    )


class ContractPatch(BaseModel):
    title: Optional[str] = None
    contract_no: Optional[str] = None
    party_a: Optional[str] = None
    party_b: Optional[str] = None
    template_key: Optional[str] = None
    status: Optional[str] = None
    signed_date: Optional[str] = None
    effective_start: Optional[str] = None
    effective_end: Optional[str] = None
    invoice_title: Optional[str] = None
    file_path: Optional[str] = None
    note: Optional[str] = None


class StatusPatch(BaseModel):
    status: str


class ContractOut(BaseModel):
    id: int
    customer_id: str
    customer_name: str
    title: str
    contract_no: str
    party_a: str
    party_b: str
    template_key: str
    status: str
    status_label: str
    signed_date: Optional[str]
    effective_start: Optional[str]
    effective_end: Optional[str]
    invoice_title: str
    file_path: Optional[str]
    file_exists: bool
    cos_key: str = ""
    cos_url: Optional[str] = None
    note: str
    created_at: Optional[str]
    updated_at: Optional[str]
    download_url: Optional[str]


def _valid_status(s: str) -> str:
    s = (s or "").strip()
    if s not in STATUS_LABELS:
        raise HTTPException(400, f"非法 status：{s}，可选 {list(STATUS_LABELS)}")
    return s


def _customer_name(conn, customer_id: str) -> str:
    row = conn.execute("SELECT name FROM customers WHERE id = ?", (customer_id,)).fetchone()
    if not row:
        raise HTTPException(404, f"客户不存在：{customer_id}")
    return str(row["name"])


def _default_invoice_title(conn, customer_id: str) -> str:
    row = conn.execute(
        """
        SELECT title FROM invoice_profiles
        WHERE customer_id = ? ORDER BY is_default DESC, id LIMIT 1
        """,
        (customer_id,),
    ).fetchone()
    return str(row["title"]) if row else ""


def _row_keys(row) -> dict:
    try:
        return dict(row)
    except Exception:
        return {k: row[k] for k in row.keys()}


def _row_out(conn, row) -> ContractOut:
    d = _row_keys(row)
    cid = str(d["customer_id"])
    name_row = conn.execute("SELECT name FROM customers WHERE id = ?", (cid,)).fetchone()
    cname = str(name_row["name"]) if name_row else cid
    status = str(d.get("status") or "draft")
    fpath = d.get("file_path")
    cos_key = str(d.get("cos_key") or "")
    exists = resolve_existing_file(fpath) is not None or bool(cos_key)
    cos_url = sto.public_url(cos_key) if cos_key else None
    return ContractOut(
        id=int(d["id"]),
        customer_id=cid,
        customer_name=cname,
        title=str(d["title"]),
        contract_no=str(d.get("contract_no") or ""),
        party_a=str(d.get("party_a") or ""),
        party_b=str(d.get("party_b") or DEFAULT_PARTY_B),
        template_key=str(d.get("template_key") or ""),
        status=status,
        status_label=STATUS_LABELS.get(status, status),
        signed_date=d.get("signed_date"),
        effective_start=d.get("effective_start"),
        effective_end=d.get("effective_end"),
        invoice_title=str(d.get("invoice_title") or ""),
        file_path=fpath,
        file_exists=exists,
        cos_key=cos_key,
        cos_url=cos_url,
        note=str(d.get("note") or ""),
        created_at=d.get("created_at"),
        updated_at=d.get("updated_at"),
        download_url=f"/api/contracts/{int(d['id'])}/file" if exists else None,
    )


def _maybe_sync_cos(conn, contract_id: int, customer_id: str, file_path: Optional[str]) -> None:
    if not file_path:
        return
    path = resolve_existing_file(file_path)
    if not path:
        return
    try:
        key = sync_file_to_cos(path, customer_id)
    except Exception as e:
        # 本机仍可用；COS 失败不阻断建档
        print(f"[contracts] COS sync failed: {e}")
        return
    if key:
        conn.execute(
            "UPDATE contracts SET cos_key = ?, updated_at = datetime('now') WHERE id = ?",
            (key, contract_id),
        )


@router.get("/templates", response_model=List[TemplateOut])
def get_templates() -> List[TemplateOut]:
    return [
        TemplateOut(
            key=t.key,
            name=t.name,
            filename=t.filename,
            path=t.path,
            suffix=t.suffix,
            size=t.size,
            note=t.note,
            kind=t.kind,
            pending_latest=t.pending_latest,
            download_url=(
                f"/api/contracts/templates/{t.key}/file" if t.size > 0 else None
            ),
        )
        for t in list_templates()
    ]


@router.get("/feed", response_model=List[FeedOut])
def list_feed(limit: int = Query(50, ge=1, le=200)) -> List[FeedOut]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT * FROM contract_feed
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [
            FeedOut(
                id=int(r["id"]),
                kind=str(r["kind"] or "note"),
                kind_label=FEED_KIND_LABELS.get(str(r["kind"] or "note"), str(r["kind"])),
                title=str(r["title"]),
                body=str(r["body"] or ""),
                ref_key=str(r["ref_key"] or ""),
                created_at=r["created_at"],
            )
            for r in rows
        ]


@router.post("/feed", response_model=FeedOut)
def create_feed(body: FeedIn) -> FeedOut:
    title = (body.title or "").strip()
    if not title:
        raise HTTPException(400, "title required")
    kind = (body.kind or "note").strip() or "note"
    if kind not in FEED_KIND_LABELS:
        kind = "note"
    with connect() as conn:
        append_feed(
            conn,
            kind=kind,
            title=title,
            body=body.body or "",
            ref_key=body.ref_key or "",
        )
        row = conn.execute(
            "SELECT * FROM contract_feed ORDER BY id DESC LIMIT 1"
        ).fetchone()
        return FeedOut(
            id=int(row["id"]),
            kind=str(row["kind"]),
            kind_label=FEED_KIND_LABELS.get(str(row["kind"]), str(row["kind"])),
            title=str(row["title"]),
            body=str(row["body"] or ""),
            ref_key=str(row["ref_key"] or ""),
            created_at=row["created_at"],
        )


@router.delete("/feed/{feed_id}")
def delete_feed(feed_id: int) -> dict:
    """删除一条更新动态（测试/误记可清掉，不影响合同正文）。"""
    with connect() as conn:
        row = conn.execute(
            "SELECT id, title FROM contract_feed WHERE id = ?", (feed_id,)
        ).fetchone()
        if not row:
            raise HTTPException(404, "动态不存在")
        conn.execute("DELETE FROM contract_feed WHERE id = ?", (feed_id,))
        return {"ok": True, "id": feed_id, "title": str(row["title"] or "")}


@router.get("/templates/{key}/file")
def download_template(key: str):
    tpl = find_template(key)
    if not tpl:
        raise HTTPException(404, "样板不存在")
    path = Path(tpl.path)
    if not path.is_file():
        raise HTTPException(404, "样板文件缺失")
    return FileResponse(
        path,
        filename=tpl.filename,
        media_type="application/octet-stream",
    )


@router.get("/company-files")
def list_company_files() -> list:
    """公司侧归档（COS trinity-Ops-Desk/contracts/company/）。"""
    return sto.list_prefix(sto.cos_key("contracts", "company"))


@router.post("/upload-cos")
async def upload_to_cos(
    file: UploadFile = File(...),
    scope: str = Form("company"),
    customer_id: str = Form(""),
    create_record: str = Form("0"),
) -> dict:
    """上传合同文件到 COS。scope=company|customer|templates。

    create_record=1 且 scope=customer 时：同时新建一条客户合同草稿并挂上附件。
    """
    if not sto.cos_enabled():
        raise HTTPException(400, "COS 未启用")
    name = Path(file.filename or "upload.bin").name
    if not name or name.startswith("."):
        raise HTTPException(400, "无效文件名")
    data = await file.read()
    if not data:
        raise HTTPException(400, "空文件")
    # 约 50MB 上限，防误传
    if len(data) > 50 * 1024 * 1024:
        raise HTTPException(400, "文件过大（上限 50MB）")

    scope = (scope or "company").strip().lower()
    cid = (customer_id or "").strip()
    want_record = str(create_record or "").strip().lower() in ("1", "true", "yes")
    if scope == "customer":
        if not cid:
            raise HTTPException(400, "customer 上传需要 customer_id")
        key = sto.cos_key("contracts", cid, name)
        local_dir = settings.resolved_contract_archive_dir() / cid
    elif scope == "templates":
        key = sto.cos_key("templates", name)
        local_dir = settings.resolved_contract_template_dir()
    else:
        # 公司侧归档
        key = sto.cos_key("contracts", "company", name)
        local_dir = settings.resolved_contract_archive_dir() / "_company"

    local_dir.mkdir(parents=True, exist_ok=True)
    local_path = local_dir / name
    local_path.write_bytes(data)
    try:
        sto.upload_file(local_path, key)
    except Exception as e:
        raise HTTPException(502, f"COS 上传失败：{e}") from e

    size_mb = round(len(data) / 1024 / 1024, 2)
    contract_id: Optional[int] = None

    with connect() as conn:
        if want_record and scope == "customer":
            cname = _customer_name(conn, cid)
            title = Path(name).stem.strip() or name
            invoice_title = _default_invoice_title(conn, cid)
            cur = conn.execute(
                """
                INSERT INTO contracts (
                  customer_id, title, contract_no, party_a, party_b, template_key,
                  status, signed_date, effective_start, effective_end, invoice_title,
                  file_path, cos_key, note, updated_at
                ) VALUES (?, ?, '', ?, ?, '', 'draft', NULL, NULL, NULL, ?, ?, ?, '', datetime('now'))
                """,
                (
                    cid,
                    title,
                    cname,
                    DEFAULT_PARTY_B,
                    invoice_title,
                    str(local_path),
                    key,
                ),
            )
            contract_id = int(cur.lastrowid)
            append_feed(
                conn,
                kind="contract",
                title=f"上传客户合同 · {cname}",
                body=f"{title} · {size_mb} MB",
                ref_key=str(contract_id),
            )
        else:
            if scope == "templates":
                feed_kind = "template"
                feed_title = f"样板上库 · {name}"
                feed_body = f"{size_mb} MB"
            elif scope == "company":
                feed_kind = "company"
                feed_title = f"公司归档上传 · {name}"
                feed_body = f"{size_mb} MB"
            else:
                feed_kind = "contract"
                feed_title = f"客户合同上传 · {name}"
                feed_body = f"{cid} · {size_mb} MB"
            append_feed(
                conn,
                kind=feed_kind,
                title=feed_title,
                body=feed_body,
                ref_key=key,
                replace_same_ref=True,
            )

    out = {
        "ok": True,
        "filename": name,
        "size": len(data),
        "cos_key": key,
        "cos_url": sto.public_url(key),
        "local_path": str(local_path),
    }
    if contract_id is not None:
        out["contract_id"] = contract_id
    return out


@router.get("", response_model=List[ContractOut])
def list_contracts(
    customer_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
) -> List[ContractOut]:
    sql = "SELECT * FROM contracts WHERE 1=1"
    args: list = []
    if customer_id:
        sql += " AND customer_id = ?"
        args.append(customer_id.strip())
    if status:
        sql += " AND status = ?"
        args.append(_valid_status(status))
    sql += " ORDER BY updated_at DESC, id DESC"
    with connect() as conn:
        rows = conn.execute(sql, args).fetchall()
        return [_row_out(conn, r) for r in rows]


@router.post("", response_model=ContractOut)
def create_contract(body: ContractIn) -> ContractOut:
    status = _valid_status(body.status)
    with connect() as conn:
        cname = _customer_name(conn, body.customer_id.strip())
        party_a = (body.party_a or "").strip() or cname
        invoice_title = (body.invoice_title or "").strip() or _default_invoice_title(
            conn, body.customer_id.strip()
        )
        title = (body.title or "").strip()
        if not title:
            raise HTTPException(400, "title required")
        file_path = (body.file_path or "").strip() or None
        template_key = (body.template_key or "").strip()
        if body.copy_template:
            if not template_key:
                raise HTTPException(400, "copy_template 需要 template_key")
            try:
                dest = copy_template_to_archive(
                    customer_id=body.customer_id.strip(),
                    template_key=template_key,
                    dest_stem=f"{party_a}_{title}"[:80],
                )
                file_path = str(dest)
            except FileNotFoundError as e:
                raise HTTPException(404, str(e)) from e
        elif template_key and find_template(template_key) is None:
            raise HTTPException(404, f"样板不存在：{template_key}")

        cur = conn.execute(
            """
            INSERT INTO contracts (
              customer_id, title, contract_no, party_a, party_b, template_key,
              status, signed_date, effective_start, effective_end, invoice_title,
              file_path, note, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                body.customer_id.strip(),
                title,
                (body.contract_no or "").strip(),
                party_a,
                (body.party_b or DEFAULT_PARTY_B).strip() or DEFAULT_PARTY_B,
                template_key,
                status,
                body.signed_date,
                body.effective_start,
                body.effective_end,
                invoice_title,
                file_path,
                (body.note or "").strip(),
            ),
        )
        cid = int(cur.lastrowid)
        _maybe_sync_cos(conn, cid, body.customer_id.strip(), file_path)
        append_feed(
            conn,
            kind="contract",
            title=f"新建客户合同 · {cname}",
            body=title,
            ref_key=str(cid),
        )
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (cid,)).fetchone()
        return _row_out(conn, row)


@router.put("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, body: ContractPatch) -> ContractOut:
    with connect() as conn:
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        if not row:
            raise HTTPException(404, "合同不存在")
        fields = {
            "title": body.title,
            "contract_no": body.contract_no,
            "party_a": body.party_a,
            "party_b": body.party_b,
            "template_key": body.template_key,
            "status": _valid_status(body.status) if body.status is not None else None,
            "signed_date": body.signed_date,
            "effective_start": body.effective_start,
            "effective_end": body.effective_end,
            "invoice_title": body.invoice_title,
            "file_path": body.file_path,
            "note": body.note,
        }
        sets = []
        args: list = []
        for k, v in fields.items():
            if v is not None:
                sets.append(f"{k} = ?")
                args.append(v.strip() if isinstance(v, str) else v)
        if not sets:
            return _row_out(conn, row)
        sets.append("updated_at = datetime('now')")
        args.append(contract_id)
        conn.execute(f"UPDATE contracts SET {', '.join(sets)} WHERE id = ?", args)
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        return _row_out(conn, row)


@router.patch("/{contract_id}/status", response_model=ContractOut)
def patch_status(contract_id: int, body: StatusPatch) -> ContractOut:
    status = _valid_status(body.status)
    with connect() as conn:
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        if not row:
            raise HTTPException(404, "合同不存在")
        signed = row["signed_date"]
        extra = ""
        args: list = [status]
        if status == "signed" and not signed:
            extra = ", signed_date = ?"
            args.append(date.today().isoformat())
        args.append(contract_id)
        old = str(row["status"] or "")
        conn.execute(
            f"UPDATE contracts SET status = ?, updated_at = datetime('now'){extra} WHERE id = ?",
            args,
        )
        append_feed(
            conn,
            kind="contract",
            title=f"状态变更 · {row['title']}",
            body=f"{STATUS_LABELS.get(old, old)} → {STATUS_LABELS.get(status, status)}",
            ref_key=str(contract_id),
        )
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        return _row_out(conn, row)


@router.post("/{contract_id}/copy-template", response_model=ContractOut)
def attach_template_copy(contract_id: int) -> ContractOut:
    """从样板库复制一份到客户合同目录并回写 file_path。"""
    with connect() as conn:
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        if not row:
            raise HTTPException(404, "合同不存在")
        key = str(row["template_key"] or "").strip()
        if not key:
            raise HTTPException(400, "该合同未关联 template_key")
        try:
            dest = copy_template_to_archive(
                customer_id=str(row["customer_id"]),
                template_key=key,
                dest_stem=f"{row['party_a'] or row['customer_id']}_{row['title']}"[:80],
            )
        except FileNotFoundError as e:
            raise HTTPException(404, str(e)) from e
        conn.execute(
            """
            UPDATE contracts SET file_path = ?, updated_at = datetime('now') WHERE id = ?
            """,
            (str(dest), contract_id),
        )
        _maybe_sync_cos(conn, contract_id, str(row["customer_id"]), str(dest))
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        return _row_out(conn, row)


@router.post("/{contract_id}/sync-cos", response_model=ContractOut)
def sync_contract_cos(contract_id: int) -> ContractOut:
    """把本地附件补传到 COS（trinity-Ops-Desk/contracts/…）。"""
    with connect() as conn:
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        if not row:
            raise HTTPException(404, "合同不存在")
        if not sto.cos_enabled():
            raise HTTPException(400, "COS 未启用，请配置 api/.env")
        path = resolve_existing_file(row["file_path"])
        if not path:
            raise HTTPException(404, "本地附件不存在，无法上传")
        try:
            key = sync_file_to_cos(path, str(row["customer_id"]))
        except Exception as e:
            raise HTTPException(502, f"COS 上传失败：{e}") from e
        if not key:
            raise HTTPException(502, "COS 上传失败")
        conn.execute(
            "UPDATE contracts SET cos_key = ?, updated_at = datetime('now') WHERE id = ?",
            (key, contract_id),
        )
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        return _row_out(conn, row)


@router.get("/{contract_id}/file")
def download_contract_file(contract_id: int):
    from fastapi.responses import Response

    with connect() as conn:
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        if not row:
            raise HTTPException(404, "合同不存在")
        path = resolve_existing_file(row["file_path"])
        if path:
            return FileResponse(
                path,
                filename=path.name,
                media_type="application/octet-stream",
            )
        cos_key = ""
        try:
            cos_key = str(row["cos_key"] or "")
        except (KeyError, IndexError):
            cos_key = ""
        if cos_key and sto.cos_enabled():
            try:
                data = sto.download_bytes(cos_key)
            except Exception as e:
                raise HTTPException(502, f"COS 下载失败：{e}") from e
            name = Path(cos_key).name
            return Response(
                content=data,
                media_type="application/octet-stream",
                headers={"Content-Disposition": f'attachment; filename="{name}"'},
            )
        raise HTTPException(404, "附件不存在")


@router.delete("/{contract_id}")
def delete_contract(contract_id: int) -> dict:
    with connect() as conn:
        row = conn.execute("SELECT * FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        if not row:
            raise HTTPException(404, "合同不存在")
        title = str(row["title"] or "")
        conn.execute("DELETE FROM contracts WHERE id = ?", (contract_id,))
        append_feed(
            conn,
            kind="contract",
            title=f"删除客户合同 · {title}",
            body="",
            ref_key=str(contract_id),
        )
        return {"ok": True, "id": contract_id}

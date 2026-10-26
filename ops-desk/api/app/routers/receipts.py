from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.db import connect
from app.services.trinity_invoice import generate_trinity_invoice_xlsx, next_invoice_no

router = APIRouter(prefix="/receipts", tags=["receipts"])


class BillToOut(BaseModel):
    id: str
    label: str
    bill_to: str
    address: str
    default_description: str
    remark: str


class TrinityIssueIn(BaseModel):
    bill_to_id: str
    amount_usd: float = Field(gt=0)
    period_label: str = Field(min_length=1, description="如 9-2026 或 Sep 07, 2026 – Sep 12, 2026")
    description: Optional[str] = None
    campaign: str = "-"
    invoice_date: Optional[date] = None
    invoice_no: Optional[str] = None


class TrinityInvoiceOut(BaseModel):
    id: int
    bill_to_id: str
    invoice_no: str
    invoice_date: str
    bill_to: str
    address: str
    description: str
    campaign: str
    period_label: str
    amount_usd: float
    status: str
    export_path: Optional[str]
    download_url: Optional[str] = None
    month_key: str
    created_at: Optional[str] = None


class TrinityIssueOut(BaseModel):
    invoice: TrinityInvoiceOut
    download_url: str
    preview: dict


def _row_out(row) -> TrinityInvoiceOut:
    inv_date = row["invoice_date"] or ""
    return TrinityInvoiceOut(
        id=row["id"],
        bill_to_id=row["bill_to_id"],
        invoice_no=row["invoice_no"],
        invoice_date=inv_date,
        bill_to=row["bill_to"],
        address=row["address"] or "",
        description=row["description"],
        campaign=row["campaign"] or "-",
        period_label=row["period_label"],
        amount_usd=float(row["amount_usd"]),
        status=row["status"],
        export_path=row["export_path"],
        download_url=f"/api/receipts/trinity/{row['id']}/file" if row["export_path"] else None,
        month_key=inv_date[:7] if inv_date else "",
        created_at=row["created_at"],
    )


def resolve_trinity_export(export_path: str | None) -> Optional[Path]:
    """本机绝对路径在工具机上会失效：按 Trinity-Invoice 导出根再解析一次。"""
    if not export_path:
        return None
    raw = Path(str(export_path))
    if raw.is_file():
        return raw
    root = settings.resolved_trinity_invoice_export_dir()
    parts = raw.parts
    if "Trinity-Invoice" in parts:
        i = parts.index("Trinity-Invoice")
        cand = root.joinpath(*parts[i + 1 :])
        if cand.is_file():
            return cand
    # YYYY-MM / filename
    if len(raw.parts) >= 2:
        cand = root / raw.parts[-2] / raw.name
        if cand.is_file():
            return cand
    cand = root / raw.name
    if cand.is_file():
        return cand
    if root.is_dir():
        for found in root.rglob(raw.name):
            if found.is_file():
                return found
    return None


@router.get("/trinity/bill-tos", response_model=List[BillToOut])
def list_bill_tos() -> List[BillToOut]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, label, bill_to, address, default_description, remark FROM bill_to_profiles ORDER BY id"
        ).fetchall()
    return [BillToOut(**dict(r)) for r in rows]


@router.get("/trinity", response_model=List[TrinityInvoiceOut])
def list_trinity(month: Optional[str] = Query(None, description="YYYY-MM")) -> List[TrinityInvoiceOut]:
    with connect() as conn:
        sql = "SELECT * FROM trinity_invoices"
        params: list = []
        if month:
            sql += " WHERE substr(invoice_date, 1, 7) = ?"
            params.append(month)
        sql += " ORDER BY invoice_date DESC, id DESC"
        rows = conn.execute(sql, params).fetchall()
        return [_row_out(r) for r in rows]


@router.post("/trinity/issue", response_model=TrinityIssueOut)
def issue_trinity(body: TrinityIssueIn) -> TrinityIssueOut:
    inv_date = body.invoice_date or date.today()
    with connect() as conn:
        bt = conn.execute(
            "SELECT * FROM bill_to_profiles WHERE id = ?", (body.bill_to_id,)
        ).fetchone()
        if not bt:
            raise HTTPException(400, "unknown bill_to_id")

        invoice_no = (body.invoice_no or "").strip() or next_invoice_no(conn, inv_date)
        exists = conn.execute(
            "SELECT 1 FROM trinity_invoices WHERE invoice_no = ?", (invoice_no,)
        ).fetchone()
        if exists:
            raise HTTPException(400, f"Invoice No. 已存在：{invoice_no}")

        description = (body.description or "").strip() or bt["default_description"]
        campaign = (body.campaign or "-").strip() or "-"
        bill_to = bt["bill_to"]
        address = bt["address"] or ""

        month_dir = inv_date.strftime("%Y-%m")
        safe_name = f"{invoice_no}_{body.bill_to_id}_{round(body.amount_usd, 2)}.xlsx"
        out_path = settings.resolved_trinity_invoice_export_dir() / month_dir / safe_name
        try:
            generate_trinity_invoice_xlsx(
                settings.resolved_trinity_invoice_template(),
                out_path,
                invoice_no=invoice_no,
                invoice_date=inv_date,
                bill_to=bill_to,
                address=address,
                description=description,
                campaign=campaign,
                period_label=body.period_label.strip(),
                amount_usd=float(body.amount_usd),
                sheet_title=invoice_no[-8:] if len(invoice_no) >= 8 else "Invoice",
            )
        except FileNotFoundError as e:
            raise HTTPException(500, str(e)) from e

        cur = conn.execute(
            """
            INSERT INTO trinity_invoices (
              bill_to_id, invoice_no, invoice_date, bill_to, address,
              description, campaign, period_label, amount_usd, status, export_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'issued', ?)
            """,
            (
                body.bill_to_id,
                invoice_no,
                inv_date.isoformat(),
                bill_to,
                address,
                description,
                campaign,
                body.period_label.strip(),
                round(float(body.amount_usd), 2),
                str(out_path),
            ),
        )
        row = conn.execute(
            "SELECT * FROM trinity_invoices WHERE id = ?", (cur.lastrowid,)
        ).fetchone()

    inv = _row_out(row)
    return TrinityIssueOut(
        invoice=inv,
        download_url=inv.download_url or f"/api/receipts/trinity/{inv.id}/file",
        preview={
            "invoice_no": inv.invoice_no,
            "invoice_date": inv.invoice_date,
            "bill_to": inv.bill_to,
            "address": inv.address,
            "description": inv.description,
            "campaign": inv.campaign,
            "period_label": inv.period_label,
            "amount_usd": inv.amount_usd,
            "beneficiary": "TRINITY AI INC",
        },
    )


@router.get("/trinity/{invoice_id}/file")
def download_trinity(invoice_id: int) -> FileResponse:
    with connect() as conn:
        row = conn.execute(
            "SELECT export_path, invoice_no FROM trinity_invoices WHERE id = ?",
            (invoice_id,),
        ).fetchone()
    if not row or not row["export_path"]:
        raise HTTPException(404, "file not found")
    path = resolve_trinity_export(row["export_path"])
    if not path:
        raise HTTPException(
            404,
            f"file missing（库路径在本机/工具机对不上）：{Path(row['export_path']).name}",
        )
    return FileResponse(
        path,
        filename=path.name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.delete("/trinity/{invoice_id}")
def delete_trinity(invoice_id: int) -> dict:
    with connect() as conn:
        row = conn.execute(
            "SELECT export_path FROM trinity_invoices WHERE id = ?", (invoice_id,)
        ).fetchone()
        if not row:
            raise HTTPException(404, "not found")
        conn.execute("DELETE FROM trinity_invoices WHERE id = ?", (invoice_id,))
    p = resolve_trinity_export(row["export_path"] if row else None)
    if p and p.is_file():
        p.unlink()
    return {"ok": True, "id": invoice_id}


@router.delete("/trinity")
def delete_trinity_month(month: str = Query(..., description="YYYY-MM")) -> dict:
    if len(month) != 7 or month[4] != "-":
        raise HTTPException(400, "month must be YYYY-MM")
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, export_path FROM trinity_invoices WHERE substr(invoice_date, 1, 7) = ?",
            (month,),
        ).fetchall()
        for r in rows:
            p = resolve_trinity_export(r["export_path"])
            if p and p.is_file():
                p.unlink()
        cur = conn.execute(
            "DELETE FROM trinity_invoices WHERE substr(invoice_date, 1, 7) = ?",
            (month,),
        )
        return {"ok": True, "month": month, "deleted": cur.rowcount}

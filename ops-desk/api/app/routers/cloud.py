from __future__ import annotations

from datetime import date
from typing import Dict, List, Optional
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.config import settings
from app.db import connect
from app.schemas import CloudLedgerRow, CloudLedgerScanOut, FeePaidOut, FeePaidPatch
from app.services.customers import settlement_customer_to_id
from app.services.export_ledger import build_ledger_xlsx, filter_ledger_rows
from app.services.scan_settlement import scan_settlement_dir

router = APIRouter(prefix="/cloud", tags=["cloud"])

_STATUS_LABEL = {
    "unbilled": "未开票",
    "invoicing": "开票中",
    "invoiced": "已开票",
}


def _load_overrides() -> Dict[str, Dict[str, Optional[str]]]:
    with connect() as conn:
        cur = conn.execute("SELECT row_key, fee_paid, note, updated_at FROM fee_payment_override")
        return {
            row["row_key"]: {
                "fee_paid": row["fee_paid"],
                "note": row["note"],
                "updated_at": row["updated_at"],
            }
            for row in cur.fetchall()
        }


def _load_invoice_state(conn) -> Dict[str, dict]:
    marks = {
        r["row_key"]: r["status"]
        for r in conn.execute("SELECT row_key, status FROM settlement_invoice_mark").fetchall()
    }
    links: Dict[str, List[dict]] = {}
    for r in conn.execute(
        """
        SELECT l.row_key, l.invoice_id, l.linked_amount, ir.status AS inv_status, ir.amount
        FROM invoice_settlement_link l
        JOIN invoice_records ir ON ir.id = l.invoice_id
        WHERE ir.status != 'void'
        """
    ).fetchall():
        links.setdefault(r["row_key"], []).append(dict(r))

    out: Dict[str, dict] = {}
    keys = set(marks) | set(links)
    for rk in keys:
        invs = links.get(rk, [])
        ids = [int(x["invoice_id"]) for x in invs]
        linked_amt = round(sum(float(x["linked_amount"] or x["amount"] or 0) for x in invs), 2) if invs else None
        mark = marks.get(rk)
        if mark == "invoiced" or (invs and all(x["inv_status"] == "invoiced" for x in invs)):
            status = "invoiced"
        elif invs or mark == "invoicing":
            status = "invoicing"
        else:
            status = "unbilled"
        out[rk] = {
            "invoice_status": status,
            "invoice_status_label": _STATUS_LABEL[status],
            "invoice_ids": ids,
            "invoice_linked_amount": linked_amt,
        }
    return out


def _enriched_rows() -> tuple[str, List[str], List[CloudLedgerRow]]:
    directory = settings.resolved_settlement_dir()
    files, rows = scan_settlement_dir(directory)
    overrides = _load_overrides()
    with connect() as conn:
        inv_state = _load_invoice_state(conn)
    for row in rows:
        row.customer_id = settlement_customer_to_id(row.customer)
        ov = overrides.get(row.row_key)
        if ov and ov.get("fee_paid") is not None and ov.get("fee_paid") != "":
            row.fee_paid = ov["fee_paid"]
            row.fee_paid_source = "override"
        elif row.fee_paid_excel:
            row.fee_paid = row.fee_paid_excel
            row.fee_paid_source = "excel"
        else:
            row.fee_paid = None
            row.fee_paid_source = "empty"
        st = inv_state.get(row.row_key)
        if st:
            row.invoice_status = st["invoice_status"]
            row.invoice_status_label = st["invoice_status_label"]
            row.invoice_ids = st["invoice_ids"]
            row.invoice_linked_amount = st["invoice_linked_amount"]
    return str(directory), files, rows


@router.get("/ledger", response_model=CloudLedgerScanOut)
def get_cloud_ledger() -> CloudLedgerScanOut:
    directory, files, rows = _enriched_rows()
    return CloudLedgerScanOut(
        settlement_dir=directory,
        files=files,
        rows=rows,
        row_count=len(rows),
    )


@router.get("/ledger/export")
def export_ledger(
    customer: str = Query(..., description="客户结算表中的客户名，如 亿点 / 山河（BID）"),
    clouds: Optional[str] = Query(None, description="逗号分隔云厂商，空=该客户全部云"),
    period: Optional[str] = Query(None, description="YYYYMM，空=全部账期"),
) -> Response:
    customer = customer.strip()
    if not customer:
        raise HTTPException(400, "customer required")
    cloud_list = [c.strip() for c in (clouds or "").split(",") if c.strip()]
    _, _, rows = _enriched_rows()
    filtered = filter_ledger_rows(
        rows,
        customer=customer,
        clouds=cloud_list or None,
        period=(period or "").strip() or None,
    )
    if not filtered:
        raise HTTPException(404, "没有符合条件的台账行")
    data = build_ledger_xlsx(filtered, customer=customer, clouds=cloud_list or sorted({r.cloud for r in filtered}))
    cloud_part = "-".join(cloud_list) if cloud_list else "全部云"
    period_part = period.strip() if period else "全部账期"
    filename = f"{customer}_{cloud_part}_{period_part}_{date.today().isoformat()}.xlsx"
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}",
        },
    )


@router.put("/ledger/fee-paid", response_model=FeePaidOut)
def put_fee_paid(body: FeePaidPatch) -> FeePaidOut:
    row_key = body.row_key.strip()
    if not row_key:
        raise HTTPException(400, "row_key required")
    fee = body.fee_paid.strip()
    with connect() as conn:
        if fee == "":
            conn.execute("DELETE FROM fee_payment_override WHERE row_key = ?", (row_key,))
            return FeePaidOut(row_key=row_key, fee_paid=None, note=None, updated_at=None)
        conn.execute(
            """
            INSERT INTO fee_payment_override (row_key, fee_paid, note, updated_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(row_key) DO UPDATE SET
              fee_paid = excluded.fee_paid,
              note = excluded.note,
              updated_at = datetime('now')
            """,
            (row_key, fee, body.note),
        )
        cur = conn.execute(
            "SELECT row_key, fee_paid, note, updated_at FROM fee_payment_override WHERE row_key = ?",
            (row_key,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(500, "failed to persist override")
        return FeePaidOut(
            row_key=row["row_key"],
            fee_paid=row["fee_paid"],
            note=row["note"],
            updated_at=row["updated_at"],
        )


class InvoiceStatusPatch(BaseModel):
    row_key: str
    status: str = Field(description="unbilled | invoiced")
    note: str = ""


class InvoiceStatusOut(BaseModel):
    row_key: str
    status: str
    status_label: str
    note: Optional[str] = None


@router.put("/ledger/invoice-status", response_model=InvoiceStatusOut)
def put_invoice_status(body: InvoiceStatusPatch) -> InvoiceStatusOut:
    row_key = body.row_key.strip()
    if not row_key:
        raise HTTPException(400, "row_key required")
    if body.status not in ("unbilled", "invoiced"):
        raise HTTPException(400, "status must be unbilled or invoiced")
    with connect() as conn:
        if body.status == "unbilled":
            conn.execute("DELETE FROM settlement_invoice_mark WHERE row_key = ?", (row_key,))
            return InvoiceStatusOut(
                row_key=row_key,
                status="unbilled",
                status_label=_STATUS_LABEL["unbilled"],
                note=None,
            )
        conn.execute(
            """
            INSERT INTO settlement_invoice_mark (row_key, status, note, updated_at)
            VALUES (?, 'invoiced', ?, datetime('now'))
            ON CONFLICT(row_key) DO UPDATE SET
              status = 'invoiced',
              note = excluded.note,
              updated_at = datetime('now')
            """,
            (row_key, body.note.strip()),
        )
        return InvoiceStatusOut(
            row_key=row_key,
            status="invoiced",
            status_label=_STATUS_LABEL["invoiced"],
            note=body.note.strip() or None,
        )

from __future__ import annotations

import json
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.config import settings
from app.db import connect, seed_issued_invoices
from app.services.customers import settlement_customer_to_id
from app.services.invoice_copy import build_invoice_copy_text
from app.services.scan_settlement import scan_settlement_dir

router = APIRouter(prefix="/invoices", tags=["invoices"])


class ProfileIn(BaseModel):
    customer_id: str
    title: str
    tax_no: str = ""
    address_phone: str = ""
    bank_account: str = ""
    default_invoice_type: str = "增值税专用发票"
    remark: str = ""
    is_default: bool = True


class ProfileOut(BaseModel):
    id: int
    customer_id: str
    customer_name: str
    title: str
    tax_no: str
    address_phone: str
    bank_account: str
    default_invoice_type: str
    remark: str
    is_default: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class RecordCreateIn(BaseModel):
    customer_id: str
    profile_id: Optional[int] = None
    buyer_name: Optional[str] = None
    tax_no: Optional[str] = None
    address_phone: Optional[str] = None
    bank_account: Optional[str] = None
    invoice_type: Optional[str] = None
    amount: float = Field(gt=0)
    amount_ex_tax: Optional[float] = None
    tax_amount: Optional[float] = None
    invoice_no: str = ""
    payment_received: str = "是"
    remark: str = ""
    apply_date: Optional[date] = None
    status: str = "draft"
    source_row_keys: List[str] = []
    skip_quota: bool = False


class RecordOut(BaseModel):
    id: int
    customer_id: str
    customer_name: str
    profile_id: Optional[int]
    buyer_name: str
    tax_no: str
    address_phone: str
    bank_account: str
    invoice_type: str
    amount: float
    amount_ex_tax: Optional[float] = None
    tax_amount: Optional[float] = None
    invoice_no: str = ""
    seller_name: str = "陕西星瀚算力信息科技有限公司"
    payment_received: str
    remark: str
    apply_date: str
    status: str
    copy_text: str
    source_row_keys: List[str] = []
    created_at: Optional[str]
    month_key: str
    # linked | orphan | none
    ledger_link: str = "none"


class StatusPatch(BaseModel):
    status: str


class QuotaOut(BaseModel):
    month: str
    quota: float
    used_total: float
    used_invoiced: float
    used_pending: float
    remaining: float
    record_count: int


class FromSettlementIn(BaseModel):
    row_keys: List[str] = Field(min_length=1)
    amount: Optional[float] = Field(default=None, gt=0)
    apply_date: Optional[date] = None
    remark: str = ""


def _quota_amount(row) -> float:
    """额度占用优先用不含税金额（与税控「金额」列一致）。"""
    if row["amount_ex_tax"] is not None:
        return float(row["amount_ex_tax"])
    return float(row["amount"] or 0)


def _month_quota(conn, month: str) -> QuotaOut:
    rows = conn.execute(
        """
        SELECT amount, amount_ex_tax, status FROM invoice_records
        WHERE substr(apply_date, 1, 7) = ? AND status != 'void'
        """,
        (month,),
    ).fetchall()
    used_invoiced = 0.0
    used_pending = 0.0
    for r in rows:
        amt = _quota_amount(r)
        if r["status"] == "invoiced":
            used_invoiced += amt
        else:
            used_pending += amt
    used_total = used_invoiced + used_pending
    quota = float(settings.invoice_monthly_quota)
    return QuotaOut(
        month=month,
        quota=quota,
        used_total=round(used_total, 2),
        used_invoiced=round(used_invoiced, 2),
        used_pending=round(used_pending, 2),
        remaining=round(max(quota - used_total, 0), 2),
        record_count=len(rows),
    )


def _customer_name(conn, customer_id: str) -> str:
    row = conn.execute("SELECT name FROM customers WHERE id = ?", (customer_id,)).fetchone()
    return row["name"] if row else customer_id


def _parse_row_keys(raw) -> List[str]:
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(x) for x in raw]
    try:
        data = json.loads(raw)
        return [str(x) for x in data] if isinstance(data, list) else []
    except (TypeError, json.JSONDecodeError):
        return []


def _profile_out(conn, row) -> ProfileOut:
    return ProfileOut(
        id=row["id"],
        customer_id=row["customer_id"],
        customer_name=_customer_name(conn, row["customer_id"]),
        title=row["title"],
        tax_no=row["tax_no"] or "",
        address_phone=row["address_phone"] or "",
        bank_account=row["bank_account"] or "",
        default_invoice_type=row["default_invoice_type"] or "增值税专用发票",
        remark=row["remark"] or "",
        is_default=bool(row["is_default"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def _record_out(conn, row) -> RecordOut:
    apply_date = row["apply_date"] or ""
    keys = _parse_row_keys(row["source_row_keys"] if "source_row_keys" in row.keys() else "[]")
    link_n = conn.execute(
        "SELECT COUNT(*) AS c FROM invoice_settlement_link WHERE invoice_id = ?",
        (row["id"],),
    ).fetchone()
    has_link = bool(keys) or (int(link_n["c"] if link_n else 0) > 0)
    status = row["status"] or ""
    if has_link:
        ledger_link = "linked"
    elif status == "invoiced":
        ledger_link = "orphan"
    else:
        ledger_link = "none"
    return RecordOut(
        id=row["id"],
        customer_id=row["customer_id"],
        customer_name=_customer_name(conn, row["customer_id"]),
        profile_id=row["profile_id"],
        buyer_name=row["buyer_name"],
        tax_no=row["tax_no"] or "",
        address_phone=row["address_phone"] or "",
        bank_account=row["bank_account"] or "",
        invoice_type=row["invoice_type"],
        amount=row["amount"],
        amount_ex_tax=row["amount_ex_tax"] if "amount_ex_tax" in row.keys() else None,
        tax_amount=row["tax_amount"] if "tax_amount" in row.keys() else None,
        invoice_no=(row["invoice_no"] if "invoice_no" in row.keys() else "") or "",
        seller_name=(
            (row["seller_name"] if "seller_name" in row.keys() else "")
            or "陕西星瀚算力信息科技有限公司"
        ),
        payment_received=row["payment_received"],
        remark=row["remark"] or "",
        apply_date=apply_date,
        status=status,
        copy_text=row["copy_text"] or "",
        source_row_keys=keys,
        created_at=row["created_at"],
        month_key=apply_date[:7] if apply_date else "",
        ledger_link=ledger_link,
    )


def _link_settlement(conn, invoice_id: int, row_keys: List[str], amount: float, status_mark: str) -> None:
    for rk in row_keys:
        rk = rk.strip()
        if not rk:
            continue
        conn.execute(
            """
            INSERT INTO invoice_settlement_link (invoice_id, row_key, linked_amount)
            VALUES (?, ?, ?)
            ON CONFLICT(invoice_id, row_key) DO UPDATE SET linked_amount = excluded.linked_amount
            """,
            (invoice_id, rk, amount),
        )
        conn.execute(
            """
            INSERT INTO settlement_invoice_mark (row_key, status, note, updated_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(row_key) DO UPDATE SET
              status = excluded.status,
              note = excluded.note,
              updated_at = datetime('now')
            """,
            (rk, status_mark, f"关联开票记录 #{invoice_id}"),
        )


def _insert_record(conn, body: RecordCreateIn) -> RecordOut:
    apply_date = body.apply_date or date.today()
    if not conn.execute("SELECT 1 FROM customers WHERE id = ?", (body.customer_id,)).fetchone():
        raise HTTPException(400, "unknown customer_id")

    buyer_name = (body.buyer_name or "").strip()
    tax_no = (body.tax_no or "").strip()
    address_phone = (body.address_phone or "").strip()
    bank_account = (body.bank_account or "").strip()
    invoice_type = (body.invoice_type or "").strip()
    profile_id = body.profile_id

    if profile_id:
        prof = conn.execute("SELECT * FROM invoice_profiles WHERE id = ?", (profile_id,)).fetchone()
        if not prof:
            raise HTTPException(400, "profile not found")
        buyer_name = buyer_name or prof["title"]
        tax_no = tax_no or (prof["tax_no"] or "")
        address_phone = address_phone or (prof["address_phone"] or "")
        bank_account = bank_account or (prof["bank_account"] or "")
        invoice_type = invoice_type or (prof["default_invoice_type"] or "增值税专用发票")
    else:
        prof = conn.execute(
            """
            SELECT * FROM invoice_profiles
            WHERE customer_id = ? ORDER BY is_default DESC, id LIMIT 1
            """,
            (body.customer_id,),
        ).fetchone()
        if prof:
            profile_id = prof["id"]
            buyer_name = buyer_name or prof["title"]
            tax_no = tax_no or (prof["tax_no"] or "")
            address_phone = address_phone or (prof["address_phone"] or "")
            bank_account = bank_account or (prof["bank_account"] or "")
            invoice_type = invoice_type or (prof["default_invoice_type"] or "增值税专用发票")

    if not buyer_name:
        raise HTTPException(400, "请填写购方名称，或先为该客户配置开票抬头")
    if not invoice_type:
        invoice_type = "增值税专用发票"

    month_key = apply_date.strftime("%Y-%m")
    quota_amt = (
        float(body.amount_ex_tax)
        if body.amount_ex_tax is not None
        else float(body.amount)
    )
    if not body.skip_quota:
        quota = _month_quota(conn, month_key)
        if quota_amt > quota.remaining + 1e-9:
            raise HTTPException(
                400,
                f"{month_key} 开票额度不足：额度 {quota.quota:,.2f}，"
                f"已用 {quota.used_total:,.2f}（已开出 {quota.used_invoiced:,.2f} + 占用 {quota.used_pending:,.2f}），"
                f"剩余 {quota.remaining:,.2f}，本次 {quota_amt:,.2f}",
            )

    copy_text = build_invoice_copy_text(
        buyer_name=buyer_name,
        tax_no=tax_no,
        address_phone=address_phone,
        bank_account=bank_account,
        amount=float(body.amount),
        invoice_type=invoice_type,
        payment_received=body.payment_received,
        remark=body.remark,
    )
    status = body.status if body.status in ("draft", "copied", "submitted", "invoiced", "void") else "draft"
    row_keys = [k.strip() for k in body.source_row_keys if k and k.strip()]

    cur = conn.execute(
        """
        INSERT INTO invoice_records (
          customer_id, profile_id, buyer_name, tax_no, address_phone, bank_account,
          invoice_type, amount, amount_ex_tax, tax_amount, invoice_no,
          payment_received, remark, apply_date, status, copy_text, source_row_keys
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            body.customer_id,
            profile_id,
            buyer_name,
            tax_no,
            address_phone,
            bank_account,
            invoice_type,
            round(float(body.amount), 2),
            round(float(body.amount_ex_tax), 2) if body.amount_ex_tax is not None else None,
            round(float(body.tax_amount), 2) if body.tax_amount is not None else None,
            (body.invoice_no or "").strip(),
            body.payment_received,
            body.remark.strip(),
            apply_date.isoformat(),
            status,
            copy_text,
            json.dumps(row_keys, ensure_ascii=False),
        ),
    )
    invoice_id = int(cur.lastrowid)
    mark = "invoiced" if status == "invoiced" else "invoicing"
    if row_keys:
        _link_settlement(conn, invoice_id, row_keys, float(body.amount), mark)
    row = conn.execute("SELECT * FROM invoice_records WHERE id = ?", (invoice_id,)).fetchone()
    return _record_out(conn, row)


@router.get("/quota", response_model=QuotaOut)
def get_quota(month: Optional[str] = Query(None, description="YYYY-MM，默认当月")) -> QuotaOut:
    m = month or date.today().strftime("%Y-%m")
    if len(m) != 7 or m[4] != "-":
        raise HTTPException(400, "month must be YYYY-MM")
    with connect() as conn:
        return _month_quota(conn, m)


@router.post("/seed-issued")
def seed_issued() -> dict:
    """幂等导入税控已开发票。"""
    with connect() as conn:
        result = seed_issued_invoices(conn)
    return {"ok": True, **result}


@router.post("/reconcile")
def reconcile_invoices_ledger() -> dict:
    """全量核对：税控票按金额挂台账，刷新状态，返回公司/行/孤儿票摘要。"""
    from app.routers.cloud import _enriched_rows

    # 触发对齐 + 状态解析
    _, _, rows = _enriched_rows()
    by_company: dict = {}
    ledger_rows = []
    for r in rows:
        cur = (r.currency or ("USD" if r.cloud == "Akamai" else "CNY")).upper()
        if cur != "CNY" or not (r.settle_total or 0):
            continue
        ledger_rows.append(
            {
                "row_key": r.row_key,
                "customer": r.customer,
                "period": r.period,
                "cloud": r.cloud,
                "settle_total": r.settle_total,
                "consume": r.consume,
                "fee_amount": r.fee_amount,
                "invoice_status": r.invoice_status,
                "invoice_status_label": r.invoice_status_label,
                "invoice_linked_amount": r.invoice_linked_amount,
            }
        )
        slot = by_company.setdefault(
            r.customer,
            {
                "customer": r.customer,
                "settle": 0.0,
                "linked": 0.0,
                "invoiced_rows": 0,
                "fee_only_rows": 0,
                "invoicing_rows": 0,
                "unbilled_rows": 0,
            },
        )
        slot["settle"] += float(r.settle_total or 0)
        slot["linked"] += float(r.invoice_linked_amount or 0)
        if r.invoice_status == "invoiced":
            slot["invoiced_rows"] += 1
        elif r.invoice_status_label == "服务费已开":
            slot["fee_only_rows"] += 1
        elif r.invoice_status == "invoicing":
            slot["invoicing_rows"] += 1
        else:
            slot["unbilled_rows"] += 1
    for slot in by_company.values():
        slot["settle"] = round(slot["settle"], 2)
        slot["linked"] = round(slot["linked"], 2)
        slot["gap"] = round(slot["settle"] - slot["linked"], 2)

    orphans = []
    linked_n = 0
    inv_n = 0
    with connect() as conn:
        for rec in conn.execute(
            """
            SELECT ir.id, ir.customer_id, ir.apply_date, ir.amount, ir.invoice_no, ir.status,
                   ir.buyer_name, ir.source_row_keys,
                   (SELECT COUNT(*) FROM invoice_settlement_link l WHERE l.invoice_id = ir.id) AS link_count
            FROM invoice_records ir
            WHERE ir.invoice_no NOT LIKE 'APP-%'
            ORDER BY ir.apply_date DESC, ir.id DESC
            """
        ).fetchall():
            inv_n += 1
            keys = _parse_row_keys(rec["source_row_keys"] if "source_row_keys" in rec.keys() else "[]")
            linked = int(rec["link_count"] or 0) > 0 or bool(keys)
            if linked:
                linked_n += 1
            elif rec["status"] == "invoiced":
                orphans.append(
                    {
                        "id": int(rec["id"]),
                        "customer_id": rec["customer_id"],
                        "buyer_name": rec["buyer_name"],
                        "apply_date": rec["apply_date"],
                        "amount": float(rec["amount"] or 0),
                        "invoice_no": rec["invoice_no"],
                    }
                )

    return {
        "ok": True,
        "by_company": sorted(by_company.values(), key=lambda x: -x["settle"]),
        "orphan_invoices": orphans,
        "summary": {
            "ledger_cny_rows": len(ledger_rows),
            "invoice_count": inv_n,
            "linked_invoices": linked_n,
            "orphan_invoices": len(orphans),
            "invoiced_ledger_rows": sum(1 for x in ledger_rows if x["invoice_status"] == "invoiced"),
            "fee_only_ledger_rows": sum(
                1 for x in ledger_rows if x["invoice_status_label"] == "服务费已开"
            ),
            "unbilled_ledger_rows": sum(1 for x in ledger_rows if x["invoice_status"] == "unbilled"),
        },
    }


@router.get("/profiles", response_model=List[ProfileOut])
def list_profiles(customer_id: Optional[str] = None) -> List[ProfileOut]:
    with connect() as conn:
        if customer_id:
            rows = conn.execute(
                "SELECT * FROM invoice_profiles WHERE customer_id = ? ORDER BY is_default DESC, id",
                (customer_id,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM invoice_profiles ORDER BY customer_id, is_default DESC, id"
            ).fetchall()
        return [_profile_out(conn, r) for r in rows]


@router.post("/profiles", response_model=ProfileOut)
def create_profile(body: ProfileIn) -> ProfileOut:
    with connect() as conn:
        if not conn.execute("SELECT 1 FROM customers WHERE id = ?", (body.customer_id,)).fetchone():
            raise HTTPException(400, "unknown customer_id")
        if body.is_default:
            conn.execute(
                "UPDATE invoice_profiles SET is_default = 0 WHERE customer_id = ?",
                (body.customer_id,),
            )
        cur = conn.execute(
            """
            INSERT INTO invoice_profiles (
              customer_id, title, tax_no, address_phone, bank_account,
              default_invoice_type, remark, is_default, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """,
            (
                body.customer_id,
                body.title.strip(),
                body.tax_no.strip(),
                body.address_phone.strip(),
                body.bank_account.strip(),
                body.default_invoice_type.strip() or "增值税专用发票",
                body.remark.strip(),
                1 if body.is_default else 0,
            ),
        )
        row = conn.execute("SELECT * FROM invoice_profiles WHERE id = ?", (cur.lastrowid,)).fetchone()
        return _profile_out(conn, row)


@router.put("/profiles/{profile_id}", response_model=ProfileOut)
def update_profile(profile_id: int, body: ProfileIn) -> ProfileOut:
    with connect() as conn:
        exists = conn.execute(
            "SELECT id FROM invoice_profiles WHERE id = ?", (profile_id,)
        ).fetchone()
        if not exists:
            raise HTTPException(404, "profile not found")
        if body.is_default:
            conn.execute(
                "UPDATE invoice_profiles SET is_default = 0 WHERE customer_id = ?",
                (body.customer_id,),
            )
        conn.execute(
            """
            UPDATE invoice_profiles SET
              customer_id = ?, title = ?, tax_no = ?, address_phone = ?, bank_account = ?,
              default_invoice_type = ?, remark = ?, is_default = ?, updated_at = datetime('now')
            WHERE id = ?
            """,
            (
                body.customer_id,
                body.title.strip(),
                body.tax_no.strip(),
                body.address_phone.strip(),
                body.bank_account.strip(),
                body.default_invoice_type.strip() or "增值税专用发票",
                body.remark.strip(),
                1 if body.is_default else 0,
                profile_id,
            ),
        )
        row = conn.execute("SELECT * FROM invoice_profiles WHERE id = ?", (profile_id,)).fetchone()
        return _profile_out(conn, row)


@router.delete("/profiles/{profile_id}")
def delete_profile(profile_id: int) -> dict:
    with connect() as conn:
        cur = conn.execute("DELETE FROM invoice_profiles WHERE id = ?", (profile_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "profile not found")
    return {"ok": True, "id": profile_id}


@router.get("/records", response_model=List[RecordOut])
def list_records(
    month: Optional[str] = Query(None, description="YYYY-MM"),
    status: Optional[str] = Query(
        "invoiced",
        description="invoiced | uninvoiced（草稿/已复制/已提交）| all",
    ),
) -> List[RecordOut]:
    with connect() as conn:
        sql = "SELECT * FROM invoice_records WHERE 1=1"
        params: list = []
        if month:
            sql += " AND substr(apply_date, 1, 7) = ?"
            params.append(month)
        st = (status or "invoiced").strip().lower()
        if st == "uninvoiced":
            sql += " AND status IN ('draft', 'copied', 'submitted')"
        elif st and st != "all":
            sql += " AND status = ?"
            params.append(st)
        # 永不把 APP-* 钉钉占位当已开票列表展示
        sql += " AND invoice_no NOT LIKE 'APP-%'"
        sql += " ORDER BY apply_date DESC, id DESC"
        rows = conn.execute(sql, params).fetchall()
        return [_record_out(conn, r) for r in rows]


@router.post("/records", response_model=RecordOut)
def create_record(body: RecordCreateIn) -> RecordOut:
    with connect() as conn:
        return _insert_record(conn, body)


@router.post("/from-settlement", response_model=RecordOut)
def create_from_settlement(body: FromSettlementIn) -> RecordOut:
    """从客户结算台账行生成开票草稿，金额默认取结算总金额合计。"""
    directory = settings.resolved_settlement_dir()
    _, rows = scan_settlement_dir(directory)
    by_key = {r.row_key: r for r in rows}
    selected = []
    for rk in body.row_keys:
        row = by_key.get(rk.strip())
        if not row:
            raise HTTPException(400, f"台账行不存在：{rk}")
        selected.append(row)

    customer_ids = {settlement_customer_to_id(r.customer) for r in selected}
    customer_ids.discard(None)
    if len(customer_ids) != 1:
        raise HTTPException(400, "请选择同一客户的台账行")
    customer_id = customer_ids.pop()

    total = body.amount
    if total is None:
        total = round(sum(float(r.settle_total or 0) for r in selected), 2)
    if total <= 0:
        raise HTTPException(400, "结算金额无效，请手填开票金额")

    periods = sorted({r.period for r in selected})
    clouds = sorted({r.cloud for r in selected})
    remark = body.remark.strip() or (
        f"来自消耗台账 {','.join(periods)} · {'/'.join(clouds)} · 结算合计"
    )
    apply_date = body.apply_date or date.today()

    with connect() as conn:
        return _insert_record(
            conn,
            RecordCreateIn(
                customer_id=customer_id,
                amount=total,
                apply_date=apply_date,
                remark=remark,
                status="draft",
                source_row_keys=[r.row_key for r in selected],
                payment_received="是",
            ),
        )


@router.patch("/records/{record_id}/status", response_model=RecordOut)
def patch_record_status(record_id: int, body: StatusPatch) -> RecordOut:
    allowed = {"draft", "copied", "submitted", "invoiced", "void"}
    if body.status not in allowed:
        raise HTTPException(400, f"status must be one of {sorted(allowed)}")
    with connect() as conn:
        cur = conn.execute(
            "UPDATE invoice_records SET status = ? WHERE id = ?",
            (body.status, record_id),
        )
        if cur.rowcount == 0:
            raise HTTPException(404, "record not found")
        row = conn.execute("SELECT * FROM invoice_records WHERE id = ?", (record_id,)).fetchone()
        keys = _parse_row_keys(row["source_row_keys"] if "source_row_keys" in row.keys() else "[]")
        if keys:
            mark = "invoiced" if body.status == "invoiced" else ("unbilled" if body.status == "void" else "invoicing")
            if body.status == "void":
                for rk in keys:
                    conn.execute("DELETE FROM invoice_settlement_link WHERE invoice_id = ? AND row_key = ?", (record_id, rk))
                    # 若无其它有效关联，清标记
                    other = conn.execute(
                        """
                        SELECT 1 FROM invoice_settlement_link l
                        JOIN invoice_records ir ON ir.id = l.invoice_id
                        WHERE l.row_key = ? AND ir.status != 'void'
                        """,
                        (rk,),
                    ).fetchone()
                    if not other:
                        conn.execute("DELETE FROM settlement_invoice_mark WHERE row_key = ?", (rk,))
            else:
                _link_settlement(conn, record_id, keys, float(row["amount"]), mark)
        return _record_out(conn, row)


@router.delete("/records/{record_id}")
def delete_record(record_id: int) -> dict:
    with connect() as conn:
        links = conn.execute(
            "SELECT row_key FROM invoice_settlement_link WHERE invoice_id = ?",
            (record_id,),
        ).fetchall()
        cur = conn.execute("DELETE FROM invoice_records WHERE id = ?", (record_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "record not found")
        conn.execute("DELETE FROM invoice_settlement_link WHERE invoice_id = ?", (record_id,))
        for lk in links:
            rk = lk["row_key"]
            other = conn.execute(
                """
                SELECT 1 FROM invoice_settlement_link l
                JOIN invoice_records ir ON ir.id = l.invoice_id
                WHERE l.row_key = ? AND ir.status != 'void'
                """,
                (rk,),
            ).fetchone()
            if not other:
                conn.execute("DELETE FROM settlement_invoice_mark WHERE row_key = ?", (rk,))
    return {"ok": True, "id": record_id}


@router.delete("/records")
def delete_records_month(month: str = Query(..., description="YYYY-MM")) -> dict:
    if len(month) != 7 or month[4] != "-":
        raise HTTPException(400, "month must be YYYY-MM")
    with connect() as conn:
        ids = [
            r["id"]
            for r in conn.execute(
                "SELECT id FROM invoice_records WHERE substr(apply_date, 1, 7) = ?",
                (month,),
            ).fetchall()
        ]
        for rid in ids:
            conn.execute("DELETE FROM invoice_settlement_link WHERE invoice_id = ?", (rid,))
        cur = conn.execute(
            "DELETE FROM invoice_records WHERE substr(apply_date, 1, 7) = ?",
            (month,),
        )
        return {"ok": True, "month": month, "deleted": cur.rowcount}

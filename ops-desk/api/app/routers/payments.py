from __future__ import annotations

import re
import time
from datetime import date
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.db import connect
from app.services.cn_amount import rmb_upper
from app.services.payment_form import build_purpose, generate_payment_xlsx

router = APIRouter(prefix="/payments", tags=["payments"])


class CustomerOut(BaseModel):
    id: str
    name: str
    purpose_name: str


class CustomerCreateIn(BaseModel):
    name: str = Field(min_length=1)
    purpose_name: Optional[str] = None
    id: Optional[str] = Field(default=None, description="可选；不填则自动生成")


def _slug_customer_id(name: str, explicit: Optional[str]) -> str:
    if explicit and explicit.strip():
        raw = explicit.strip().lower()
        slug = re.sub(r"[^a-z0-9_-]+", "", raw.replace(" ", "_"))
        if not slug:
            raise HTTPException(400, "客户 id 只能含字母数字下划线")
        return slug[:40]
    # 中文名：用时间戳短码，避免拼音依赖
    base = re.sub(r"[^a-z0-9]+", "", name.lower())
    if len(base) >= 2:
        return base[:24]
    return f"c{int(time.time()) % 10_000_000}"


class PayeeOut(BaseModel):
    cloud: str
    label: str
    full_name: str
    account: str
    bank: str
    ready: bool


class PaymentCreateIn(BaseModel):
    customer_id: str
    cloud: str = Field(description="tencent | aliyun | huawei")
    amount: float = Field(gt=0)
    apply_date: Optional[date] = None
    period_year: Optional[int] = None
    period_month: Optional[int] = Field(default=None, ge=1, le=12)
    purpose: Optional[str] = None


class PaymentOut(BaseModel):
    id: int
    customer_id: str
    customer_name: str
    cloud: str
    cloud_label: str
    amount: float
    amount_upper: str
    purpose: str
    apply_date: str
    period_year: int
    period_month: int
    status: str
    export_path: Optional[str]
    payee_name: Optional[str]
    payee_account: Optional[str]
    payee_bank: Optional[str]
    payer_name: str
    department: str
    applicant: str
    created_at: Optional[str]
    month_key: str


class PaymentCreateOut(BaseModel):
    payment: PaymentOut
    download_url: str
    preview: dict


def _row_to_out(row, customer_name: str, cloud_label: str) -> PaymentOut:
    apply_date = row["apply_date"]
    return PaymentOut(
        id=row["id"],
        customer_id=row["customer_id"],
        customer_name=customer_name,
        cloud=row["cloud"],
        cloud_label=cloud_label,
        amount=row["amount"],
        amount_upper=rmb_upper(row["amount"]),
        purpose=row["purpose"],
        apply_date=apply_date,
        period_year=row["period_year"],
        period_month=row["period_month"],
        status=row["status"],
        export_path=row["export_path"],
        payee_name=row["payee_name"],
        payee_account=row["payee_account"],
        payee_bank=row["payee_bank"],
        payer_name=settings.payer_name,
        department=settings.department,
        applicant=settings.applicant,
        created_at=row["created_at"],
        month_key=apply_date[:7] if apply_date else "",
    )


@router.get("/meta/customers", response_model=List[CustomerOut])
def list_customers() -> List[CustomerOut]:
    with connect() as conn:
        rows = conn.execute("SELECT id, name, purpose_name FROM customers ORDER BY id").fetchall()
    return [CustomerOut(**dict(r)) for r in rows]


@router.post("/meta/customers", response_model=CustomerOut)
def create_customer(body: CustomerCreateIn) -> CustomerOut:
    name = body.name.strip()
    if not name:
        raise HTTPException(400, "请填写客户名称")
    purpose = (body.purpose_name or name).strip() or name
    cid = _slug_customer_id(name, body.id)
    with connect() as conn:
        if conn.execute("SELECT 1 FROM customers WHERE id = ?", (cid,)).fetchone():
            raise HTTPException(400, f"客户 id 已存在：{cid}")
        if conn.execute("SELECT 1 FROM customers WHERE name = ?", (name,)).fetchone():
            raise HTTPException(400, f"客户名称已存在：{name}")
        conn.execute(
            "INSERT INTO customers (id, name, purpose_name) VALUES (?, ?, ?)",
            (cid, name, purpose),
        )
        row = conn.execute(
            "SELECT id, name, purpose_name FROM customers WHERE id = ?", (cid,)
        ).fetchone()
    return CustomerOut(**dict(row))


@router.get("/meta/payees", response_model=List[PayeeOut])
def list_payees() -> List[PayeeOut]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT cloud, label, full_name, account, bank FROM payees ORDER BY cloud"
        ).fetchall()
    return [
        PayeeOut(
            cloud=r["cloud"],
            label=r["label"],
            full_name=r["full_name"],
            account=r["account"],
            bank=r["bank"],
            ready=bool(r["account"] and r["full_name"] and not str(r["full_name"]).startswith("（待补")),
        )
        for r in rows
    ]


@router.get("", response_model=List[PaymentOut])
def list_payments(month: Optional[str] = Query(None, description="YYYY-MM，按申请日")) -> List[PaymentOut]:
    with connect() as conn:
        sql = """
        SELECT p.*, c.name AS customer_name, c.purpose_name, y.label AS cloud_label
        FROM payments p
        JOIN customers c ON c.id = p.customer_id
        JOIN payees y ON y.cloud = p.cloud
        """
        params: list = []
        if month:
            sql += " WHERE substr(p.apply_date, 1, 7) = ?"
            params.append(month)
        sql += " ORDER BY p.apply_date DESC, p.id DESC"
        rows = conn.execute(sql, params).fetchall()
    return [
        _row_to_out(r, r["customer_name"], r["cloud_label"]) for r in rows
    ]


@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: int) -> PaymentOut:
    with connect() as conn:
        r = conn.execute(
            """
            SELECT p.*, c.name AS customer_name, y.label AS cloud_label
            FROM payments p
            JOIN customers c ON c.id = p.customer_id
            JOIN payees y ON y.cloud = p.cloud
            WHERE p.id = ?
            """,
            (payment_id,),
        ).fetchone()
    if not r:
        raise HTTPException(404, "payment not found")
    return _row_to_out(r, r["customer_name"], r["cloud_label"])


@router.post("/issue", response_model=PaymentCreateOut)
def issue_payment(body: PaymentCreateIn) -> PaymentCreateOut:
    apply_date = body.apply_date or date.today()
    period_year = body.period_year or apply_date.year
    period_month = body.period_month or apply_date.month

    with connect() as conn:
        cust = conn.execute(
            "SELECT id, name, purpose_name FROM customers WHERE id = ?",
            (body.customer_id,),
        ).fetchone()
        if not cust:
            raise HTTPException(400, "unknown customer_id")
        payee = conn.execute(
            "SELECT cloud, label, full_name, account, bank FROM payees WHERE cloud = ?",
            (body.cloud,),
        ).fetchone()
        if not payee:
            raise HTTPException(400, "unknown cloud")
        if not payee["account"] or str(payee["full_name"]).startswith("（待补"):
            raise HTTPException(400, f"{payee['label']} 收款信息未配置，无法出单")

        purpose = (body.purpose or "").strip() or build_purpose(
            cust["purpose_name"], payee["label"], period_month
        )

        cur = conn.execute(
            """
            INSERT INTO payments (
              customer_id, cloud, amount, purpose, apply_date,
              period_year, period_month, status,
              payee_name, payee_account, payee_bank
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'created', ?, ?, ?)
            """,
            (
                body.customer_id,
                body.cloud,
                round(float(body.amount), 2),
                purpose,
                apply_date.isoformat(),
                period_year,
                period_month,
                payee["full_name"],
                payee["account"],
                payee["bank"],
            ),
        )
        payment_id = int(cur.lastrowid)

        sheet_title = f"{cust['purpose_name']}{payee['label']}{period_month}月"
        filename = (
            f"{apply_date.isoformat()}_{body.customer_id}_{body.cloud}_"
            f"{int(body.amount)}_{payment_id}.xlsx"
        )
        out_dir = settings.resolved_payment_export_dir() / f"{apply_date.year:04d}-{apply_date.month:02d}"
        out_path = out_dir / filename

        try:
            generate_payment_xlsx(
                settings.resolved_payment_template(),
                out_path,
                payer_name=settings.payer_name,
                apply_date=apply_date,
                department=settings.department,
                applicant=settings.applicant,
                payee_name=payee["full_name"],
                payee_account=payee["account"],
                payee_bank=payee["bank"],
                amount=float(body.amount),
                purpose=purpose,
                sheet_title=sheet_title,
            )
        except Exception as e:
            conn.execute("DELETE FROM payments WHERE id = ?", (payment_id,))
            raise HTTPException(500, f"生成申请单失败: {e}") from e

        try:
            rel = str(out_path.relative_to(settings.repo_root))
        except ValueError:
            rel = str(out_path)

        conn.execute(
            "UPDATE payments SET status = 'issued', export_path = ? WHERE id = ?",
            (rel, payment_id),
        )
        row = conn.execute(
            """
            SELECT p.*, c.name AS customer_name, y.label AS cloud_label
            FROM payments p
            JOIN customers c ON c.id = p.customer_id
            JOIN payees y ON y.cloud = p.cloud
            WHERE p.id = ?
            """,
            (payment_id,),
        ).fetchone()

    payment = _row_to_out(row, row["customer_name"], row["cloud_label"])
    return PaymentCreateOut(
        payment=payment,
        download_url=f"/api/payments/{payment.id}/file",
        preview={
            "payer_name": settings.payer_name,
            "department": settings.department,
            "applicant": settings.applicant,
            "apply_date_label": f"{apply_date.year} 年 {apply_date.month}月 {apply_date.day}日",
            "payee_name": payee["full_name"],
            "payee_account": payee["account"],
            "payee_bank": payee["bank"],
            "amount": payment.amount,
            "amount_upper": payment.amount_upper,
            "purpose": purpose,
        },
    )


def _resolve_export_path(export_path: Optional[str]) -> Optional[Path]:
    if not export_path:
        return None
    path = Path(export_path)
    if not path.is_absolute():
        path = settings.repo_root / path
    return path


def _delete_payment_row(conn, payment_id: int) -> bool:
    row = conn.execute(
        "SELECT id, export_path FROM payments WHERE id = ?", (payment_id,)
    ).fetchone()
    if not row:
        return False
    path = _resolve_export_path(row["export_path"])
    if path and path.is_file():
        try:
            path.unlink()
        except OSError:
            pass
    conn.execute("DELETE FROM payments WHERE id = ?", (payment_id,))
    return True


@router.delete("/{payment_id}")
def delete_payment(payment_id: int) -> dict:
    with connect() as conn:
        ok = _delete_payment_row(conn, payment_id)
    if not ok:
        raise HTTPException(404, "payment not found")
    return {"ok": True, "id": payment_id}


@router.delete("")
def delete_payments_in_month(
    month: str = Query(..., description="YYYY-MM，删除该申请月全部记录（含导出文件）"),
) -> dict:
    if len(month) != 7 or month[4] != "-":
        raise HTTPException(400, "month must be YYYY-MM")
    with connect() as conn:
        rows = conn.execute(
            "SELECT id FROM payments WHERE substr(apply_date, 1, 7) = ?",
            (month,),
        ).fetchall()
        deleted = 0
        for r in rows:
            if _delete_payment_row(conn, int(r["id"])):
                deleted += 1
    return {"ok": True, "month": month, "deleted": deleted}


@router.get("/{payment_id}/file")
def download_payment_file(payment_id: int):
    with connect() as conn:
        row = conn.execute(
            "SELECT export_path FROM payments WHERE id = ?", (payment_id,)
        ).fetchone()
    if not row or not row["export_path"]:
        raise HTTPException(404, "file not found")
    path = _resolve_export_path(row["export_path"])
    if not path or not path.is_file():
        raise HTTPException(404, f"missing file: {path}")
    return FileResponse(
        path,
        filename=path.name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

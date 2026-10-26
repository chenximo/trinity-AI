from __future__ import annotations

"""把税控开票记录按金额对齐到消耗台账行，并回写开票状态。

匹配规则（同客户）：价税合计 ≈ 实际消耗 / 服务费 / 结算合计（容差 0.02）。
状态：手动标已开票优先；否则已关联金额合计 ≥ 结算合计 → 已开票；有关联但未盖满 → 开票中。
"""

import json
import sqlite3
from typing import Any, Dict, List, Optional, Sequence, Tuple

from app.services.customers import settlement_customer_to_id

_EPS = 0.02


def _amt_eq(a: Optional[float], b: Optional[float]) -> bool:
    if a is None or b is None:
        return False
    return abs(float(a) - float(b)) <= _EPS


def _parse_keys(raw: Any) -> List[str]:
    if isinstance(raw, list):
        return [str(x) for x in raw if x]
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x) for x in data if x]
    except Exception:
        pass
    return []


def sync_ledger_invoice_links(conn: sqlite3.Connection, settlement_rows: Sequence[Any]) -> dict:
    """幂等：按金额把已开票记录挂到台账行，并刷新 settlement_invoice_mark。"""
    by_customer: Dict[str, List[Any]] = {}
    for r in settlement_rows:
        cid = settlement_customer_to_id(getattr(r, "customer", "") or "")
        if not cid:
            continue
        by_customer.setdefault(cid, []).append(r)

    records = conn.execute(
        """
        SELECT id, customer_id, amount, status, source_row_keys, invoice_no
        FROM invoice_records
        WHERE status != 'void' AND invoice_no NOT LIKE 'APP-%'
        """
    ).fetchall()

    linked_new = 0
    for rec in records:
        cid = (rec["customer_id"] or "").strip()
        amount = float(rec["amount"] or 0)
        if not cid or amount <= 0:
            continue
        invoice_id = int(rec["id"])
        existing_keys = set(_parse_keys(rec["source_row_keys"]))
        already = {
            r["row_key"]
            for r in conn.execute(
                "SELECT row_key FROM invoice_settlement_link WHERE invoice_id = ?",
                (invoice_id,),
            ).fetchall()
        }
        if already:
            existing_keys |= already
            continue  # 已有关联则不改（避免挪错行）

        candidates: List[Tuple[int, str, str]] = []
        for row in by_customer.get(cid, []):
            rk = row.row_key
            # 优先级：结算合计 > 实际消耗 > 服务费
            scored: List[Tuple[int, str]] = []
            if _amt_eq(row.settle_total, amount):
                scored.append((0, "settle"))
            if _amt_eq(row.consume, amount):
                scored.append((1, "consume"))
            if _amt_eq(getattr(row, "fee_amount", None), amount):
                scored.append((2, "fee"))
            for score, kind in scored:
                candidates.append((score, rk, kind))

        if not candidates:
            continue
        candidates.sort(key=lambda x: (x[0], x[1]))
        _, row_key, _kind = candidates[0]

        conn.execute(
            """
            INSERT OR IGNORE INTO invoice_settlement_link (invoice_id, row_key, linked_amount)
            VALUES (?, ?, ?)
            """,
            (invoice_id, row_key, amount),
        )
        keys = sorted(existing_keys | {row_key})
        conn.execute(
            "UPDATE invoice_records SET source_row_keys = ? WHERE id = ?",
            (json.dumps(keys, ensure_ascii=False), invoice_id),
        )
        linked_new += 1

    # 按台账行汇总关联金额，写回 mark
    refreshed = 0
    for r in settlement_rows:
        rk = r.row_key
        settle = float(r.settle_total or 0)
        links = conn.execute(
            """
            SELECT l.linked_amount, ir.amount, ir.status
            FROM invoice_settlement_link l
            JOIN invoice_records ir ON ir.id = l.invoice_id
            WHERE l.row_key = ? AND ir.status != 'void'
            """,
            (rk,),
        ).fetchall()
        if not links:
            continue
        linked_sum = round(
            sum(float(x["linked_amount"] or x["amount"] or 0) for x in links),
            2,
        )
        all_invoiced = all(x["status"] == "invoiced" for x in links)
        mark_row = conn.execute(
            "SELECT status, note FROM settlement_invoice_mark WHERE row_key = ?",
            (rk,),
        ).fetchone()
        manual_invoiced = bool(mark_row and mark_row["status"] == "invoiced" and not (mark_row["note"] or "").startswith("关联"))

        if manual_invoiced:
            continue
        if all_invoiced and settle > 0 and linked_sum + _EPS >= settle:
            status = "invoiced"
            note = f"台账对齐已开票 · 已关联 ¥{linked_sum:.2f}"
        elif links:
            status = "invoicing"
            note = f"台账对齐开票中 · 已关联 ¥{linked_sum:.2f}" + (
                f" / 结算 ¥{settle:.2f}" if settle else ""
            )
        else:
            continue

        conn.execute(
            """
            INSERT INTO settlement_invoice_mark (row_key, status, note, updated_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(row_key) DO UPDATE SET
              status = excluded.status,
              note = excluded.note,
              updated_at = datetime('now')
            """,
            (rk, status, note),
        )
        refreshed += 1

    return {"linked_new": linked_new, "marks_refreshed": refreshed}


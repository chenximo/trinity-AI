from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, List

from app.config import settings


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _table_cols(conn: sqlite3.Connection, table: str) -> set[str]:
    return {r[1] for r in conn.execute(f"PRAGMA table_info({table})")}


def _ensure_column(conn: sqlite3.Connection, table: str, col: str, decl: str) -> None:
    if col not in _table_cols(conn, table):
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {col} {decl}")


def init_db() -> None:
    db_path = settings.resolved_db()
    _ensure_parent(db_path)
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS fee_payment_override (
              row_key TEXT PRIMARY KEY,
              fee_paid TEXT,
              note TEXT,
              updated_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS customers (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              purpose_name TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS payees (
              cloud TEXT PRIMARY KEY,
              label TEXT NOT NULL,
              full_name TEXT NOT NULL,
              account TEXT NOT NULL,
              bank TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS payments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              customer_id TEXT NOT NULL,
              cloud TEXT NOT NULL,
              amount REAL NOT NULL,
              purpose TEXT NOT NULL,
              apply_date TEXT NOT NULL,
              period_year INTEGER NOT NULL,
              period_month INTEGER NOT NULL,
              status TEXT NOT NULL DEFAULT 'created',
              export_path TEXT,
              payee_name TEXT,
              payee_account TEXT,
              payee_bank TEXT,
              created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS invoice_profiles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              customer_id TEXT NOT NULL,
              title TEXT NOT NULL,
              tax_no TEXT NOT NULL DEFAULT '',
              address_phone TEXT NOT NULL DEFAULT '',
              bank_account TEXT NOT NULL DEFAULT '',
              default_invoice_type TEXT NOT NULL DEFAULT '增值税专用发票',
              remark TEXT NOT NULL DEFAULT '',
              is_default INTEGER NOT NULL DEFAULT 1,
              created_at TEXT DEFAULT (datetime('now')),
              updated_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS invoice_records (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              customer_id TEXT NOT NULL,
              profile_id INTEGER,
              buyer_name TEXT NOT NULL,
              tax_no TEXT NOT NULL DEFAULT '',
              address_phone TEXT NOT NULL DEFAULT '',
              bank_account TEXT NOT NULL DEFAULT '',
              invoice_type TEXT NOT NULL,
              amount REAL NOT NULL,
              payment_received TEXT NOT NULL DEFAULT '是',
              remark TEXT NOT NULL DEFAULT '',
              apply_date TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'draft',
              copy_text TEXT NOT NULL DEFAULT '',
              created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS invoice_settlement_link (
              invoice_id INTEGER NOT NULL,
              row_key TEXT NOT NULL,
              linked_amount REAL,
              PRIMARY KEY (invoice_id, row_key)
            );

            CREATE TABLE IF NOT EXISTS settlement_invoice_mark (
              row_key TEXT PRIMARY KEY,
              status TEXT NOT NULL DEFAULT 'unbilled',
              note TEXT NOT NULL DEFAULT '',
              updated_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS bill_to_profiles (
              id TEXT PRIMARY KEY,
              label TEXT NOT NULL,
              bill_to TEXT NOT NULL,
              address TEXT NOT NULL DEFAULT '',
              default_description TEXT NOT NULL DEFAULT 'Computer services',
              remark TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS trinity_invoices (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              bill_to_id TEXT NOT NULL,
              invoice_no TEXT NOT NULL UNIQUE,
              invoice_date TEXT NOT NULL,
              bill_to TEXT NOT NULL,
              address TEXT NOT NULL DEFAULT '',
              description TEXT NOT NULL,
              campaign TEXT NOT NULL DEFAULT '-',
              period_label TEXT NOT NULL,
              amount_usd REAL NOT NULL,
              status TEXT NOT NULL DEFAULT 'issued',
              export_path TEXT,
              created_at TEXT DEFAULT (datetime('now'))
            );
            """
        )
        _ensure_column(conn, "invoice_records", "invoice_no", "TEXT NOT NULL DEFAULT ''")
        _ensure_column(conn, "invoice_records", "amount_ex_tax", "REAL")
        _ensure_column(conn, "invoice_records", "tax_amount", "REAL")
        _ensure_column(conn, "invoice_records", "source_row_keys", "TEXT NOT NULL DEFAULT '[]'")
        _ensure_column(
            conn,
            "invoice_records",
            "seller_name",
            "TEXT NOT NULL DEFAULT '陕西星瀚算力信息科技有限公司'",
        )
        _seed(conn)
        seed_issued_invoices(conn)
        conn.commit()


def _seed(conn: sqlite3.Connection) -> None:
    customers = [
        ("hehe", "hehe / 远景", "远景"),
        ("yidian", "亿点宇宙（陕西）信息科技有限公司", "亿点"),
        ("shanhe", "北京山河聚量科技有限公司", "山河"),
        ("xinghan", "星瀚", "星瀚"),
    ]
    conn.executemany(
        "INSERT OR IGNORE INTO customers (id, name, purpose_name) VALUES (?, ?, ?)",
        customers,
    )
    payees = [
        (
            "tencent",
            "腾讯云",
            "腾讯云计算（北京）有限责任公司",
            "1109073168106010003303511",
            "招商银行",
        ),
        (
            "aliyun",
            "阿里云",
            "阿里云计算有限公司",
            "5719054936107020371753",
            "招商银行",
        ),
        (
            "huawei",
            "华为云",
            "（待补全称）",
            "",
            "",
        ),
    ]
    conn.executemany(
        """
        INSERT OR IGNORE INTO payees (cloud, label, full_name, account, bank)
        VALUES (?, ?, ?, ?, ?)
        """,
        payees,
    )
    bill_tos = [
        (
            "far",
            "FAR / hehe 海外",
            "FAR VISION TECH LIMITED",
            "FLAT/RM A 20/F KIU FU COMM BLDG 300 LOCKHART RD WAN CHAI HONGKONG",
            "Advertising fee",
            "",
        ),
        (
            "fengyee",
            "瑞云 / Fengyee",
            "Fengyee Technology (HK) Limited",
            "LAT 10198,10/F,LIVEN HOUSE,NO.61-63 KING YIP STREET,KWUN TONG,KOWLOON, HONGKONG.",
            "Computer services",
            "",
        ),
    ]
    conn.executemany(
        """
        INSERT OR IGNORE INTO bill_to_profiles
          (id, label, bill_to, address, default_description, remark)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        bill_tos,
    )


def seed_issued_invoices(conn: sqlite3.Connection) -> dict:
    """导入税控已开发票；按 invoice_no 幂等。返回 {inserted, skipped}。"""
    from app.services.invoice_copy import build_invoice_copy_text
    from app.services.issued_invoices import ISSUED_INVOICES, PROFILE_SEEDS

    for p in PROFILE_SEEDS:
        existing = conn.execute(
            "SELECT id FROM invoice_profiles WHERE customer_id = ? AND title = ?",
            (p["customer_id"], p["title"]),
        ).fetchone()
        if existing:
            conn.execute(
                """
                UPDATE invoice_profiles
                SET tax_no = ?, default_invoice_type = ?, updated_at = datetime('now')
                WHERE id = ?
                """,
                (p["tax_no"], p["default_invoice_type"], existing["id"] if isinstance(existing, sqlite3.Row) else existing[0]),
            )
        else:
            # 同客户其它抬头取消默认
            conn.execute(
                "UPDATE invoice_profiles SET is_default = 0 WHERE customer_id = ?",
                (p["customer_id"],),
            )
            conn.execute(
                """
                INSERT INTO invoice_profiles (
                  customer_id, title, tax_no, default_invoice_type, is_default
                ) VALUES (?, ?, ?, ?, 1)
                """,
                (p["customer_id"], p["title"], p["tax_no"], p["default_invoice_type"]),
            )

    # 修正山河税号（若旧测试税号仍在）
    conn.execute(
        """
        UPDATE invoice_profiles
        SET tax_no = '91110105MA04E4YK89', updated_at = datetime('now')
        WHERE customer_id = 'shanhe' AND title LIKE '%山河%'
        """
    )

    inserted = 0
    updated = 0
    for inv in ISSUED_INVOICES:
        prof = conn.execute(
            """
            SELECT id FROM invoice_profiles
            WHERE customer_id = ? ORDER BY is_default DESC, id LIMIT 1
            """,
            (inv["customer_id"],),
        ).fetchone()
        profile_id = prof["id"] if prof and isinstance(prof, sqlite3.Row) else (prof[0] if prof else None)

        row_keys: List[str] = list(inv.get("hint_row_keys") or [])
        seller = (inv.get("seller_name") or "陕西星瀚算力信息科技有限公司").strip()
        extra = (inv.get("remark") or "").strip()
        if str(inv["invoice_no"]).startswith("APP-"):
            remark = extra or f"钉钉开票申请·{inv['invoice_no']}"
        else:
            remark = extra or f"税控已开·数电票号 {inv['invoice_no']}"
        copy_text = build_invoice_copy_text(
            buyer_name=inv["buyer_name"],
            tax_no=inv["tax_no"],
            address_phone="",
            bank_account="",
            amount=float(inv["amount"]),
            invoice_type=inv["invoice_type"],
            payment_received="是",
            remark=remark,
        )
        ex_tax = inv.get("amount_ex_tax")
        tax_amt = inv.get("tax_amount")
        ex_tax_v = round(float(ex_tax), 2) if ex_tax is not None else None
        tax_v = round(float(tax_amt), 2) if tax_amt is not None else None

        exists = conn.execute(
            "SELECT id FROM invoice_records WHERE invoice_no = ?",
            (inv["invoice_no"],),
        ).fetchone()
        if exists:
            invoice_id = int(exists["id"] if isinstance(exists, sqlite3.Row) else exists[0])
            conn.execute(
                """
                UPDATE invoice_records SET
                  customer_id = ?, profile_id = ?, buyer_name = ?, tax_no = ?,
                  invoice_type = ?, amount = ?, amount_ex_tax = ?, tax_amount = ?,
                  seller_name = ?, remark = ?, apply_date = ?, status = 'invoiced',
                  copy_text = ?, source_row_keys = ?, payment_received = '是'
                WHERE id = ?
                """,
                (
                    inv["customer_id"],
                    profile_id,
                    inv["buyer_name"],
                    inv["tax_no"],
                    inv["invoice_type"],
                    float(inv["amount"]),
                    ex_tax_v,
                    tax_v,
                    seller,
                    remark,
                    inv["apply_date"],
                    copy_text,
                    json.dumps(row_keys, ensure_ascii=False),
                    invoice_id,
                ),
            )
            updated += 1
        else:
            cur = conn.execute(
                """
                INSERT INTO invoice_records (
                  customer_id, profile_id, buyer_name, tax_no, address_phone, bank_account,
                  invoice_type, amount, amount_ex_tax, tax_amount, invoice_no, seller_name,
                  payment_received, remark, apply_date, status, copy_text, source_row_keys
                ) VALUES (?, ?, ?, ?, '', '', ?, ?, ?, ?, ?, ?, '是', ?, ?, 'invoiced', ?, ?)
                """,
                (
                    inv["customer_id"],
                    profile_id,
                    inv["buyer_name"],
                    inv["tax_no"],
                    inv["invoice_type"],
                    float(inv["amount"]),
                    ex_tax_v,
                    tax_v,
                    inv["invoice_no"],
                    seller,
                    remark,
                    inv["apply_date"],
                    copy_text,
                    json.dumps(row_keys, ensure_ascii=False),
                ),
            )
            invoice_id = int(cur.lastrowid)
            inserted += 1

        for rk in row_keys:
            conn.execute(
                """
                INSERT OR IGNORE INTO invoice_settlement_link (invoice_id, row_key, linked_amount)
                VALUES (?, ?, ?)
                """,
                (invoice_id, rk, float(inv["amount"])),
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
                (rk, f"关联数电票 {inv['invoice_no']}"),
            )

    return {"inserted": inserted, "updated": updated, "total": len(ISSUED_INVOICES)}


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    db_path = settings.resolved_db()
    _ensure_parent(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

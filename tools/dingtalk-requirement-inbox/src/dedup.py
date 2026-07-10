"""Lightweight dedup: processed msgId store + in-batch title dedup."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

TZ_CN = ZoneInfo("Asia/Shanghai")


def dedupe_candidates_by_title(
    candidates: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[str]]:
    """Keep first candidate per exact title within one @整理 batch."""
    seen: set[str] = set()
    kept: list[dict[str, Any]] = []
    skipped: list[str] = []
    for candidate in candidates:
        title = (candidate.get("title") or "").strip()
        if title and title in seen:
            skipped.append(title)
            continue
        if title:
            seen.add(title)
        kept.append(candidate)
    return kept, skipped


class ProcessedMessageStore:
    def __init__(self, db_path: Path, *, retention_days: int = 30) -> None:
        self.db_path = db_path
        self.retention_days = retention_days
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS processed_messages (
                    msg_id TEXT PRIMARY KEY,
                    processed_at TEXT NOT NULL,
                    batch_id TEXT NOT NULL DEFAULT ''
                )
                """
            )
            conn.commit()

    def _purge_old(self, conn: sqlite3.Connection) -> None:
        cutoff = (datetime.now(TZ_CN) - timedelta(days=self.retention_days)).isoformat()
        conn.execute("DELETE FROM processed_messages WHERE processed_at < ?", (cutoff,))

    def is_processed(self, msg_id: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM processed_messages WHERE msg_id = ?",
                (msg_id,),
            ).fetchone()
        return row is not None

    def mark_processed(self, msg_id: str, batch_id: str = "") -> None:
        now = datetime.now(TZ_CN).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO processed_messages (msg_id, processed_at, batch_id)
                VALUES (?, ?, ?)
                """,
                (msg_id, now, batch_id),
            )
            self._purge_old(conn)
            conn.commit()

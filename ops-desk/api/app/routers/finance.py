from __future__ import annotations

import re
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.services import finance_ledger as fin

router = APIRouter(prefix="/finance", tags=["finance"])


class FinanceLineIn(BaseModel):
    book: str
    party_key: str
    party_name: str = ""
    opening: Optional[float] = None
    recharge: Optional[float] = None
    consume: Optional[float] = None
    fee: Optional[float] = None
    remark: str = ""
    sort_order: int = 0


class FinanceSaveIn(BaseModel):
    month_key: str = Field(..., description="YYYY-MM")
    lines: List[FinanceLineIn]


@router.get("/ledger")
def get_ledger(month: str = Query(..., description="YYYY-MM")) -> dict:
    month = month.strip()
    if not re.fullmatch(r"\d{4}-\d{2}", month):
        raise HTTPException(400, "month 须为 YYYY-MM")
    return fin.build_ledger(month)


@router.put("/ledger")
def save_ledger(body: FinanceSaveIn) -> dict:
    month = body.month_key.strip()
    if not re.fullmatch(r"\d{4}-\d{2}", month):
        raise HTTPException(400, "month_key 须为 YYYY-MM")
    for line in body.lines:
        book = (line.book or "").strip()
        pk = (line.party_key or "").strip()
        if not book or not pk:
            raise HTTPException(400, "book / party_key required")
        fin.upsert_line(
            month,
            book=book,
            party_key=pk,
            party_name=(line.party_name or pk).strip(),
            opening=line.opening,
            recharge=line.recharge,
            consume=line.consume,
            fee=line.fee,
            remark=line.remark or "",
            sort_order=int(line.sort_order or 0),
        )
    return fin.build_ledger(month)


@router.get("/ledger/export")
def export_ledger(month: str = Query(..., description="YYYY-MM")) -> Response:
    month = month.strip()
    if not re.fullmatch(r"\d{4}-\d{2}", month):
        raise HTTPException(400, "month 须为 YYYY-MM")
    data = fin.export_xlsx(month)
    filename = f"财务分类账_{month}.xlsx"
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

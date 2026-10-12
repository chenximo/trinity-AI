from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class HealthOut(BaseModel):
    ok: bool = True
    service: str = "ops-desk-api"
    repo_root: str
    settlement_dir: str
    recon_dir: str


class CloudLedgerRow(BaseModel):
    row_key: str
    customer: str
    customer_id: Optional[str] = None
    source_file: str
    period: str
    cloud: str
    account: str
    consume: Optional[float] = None
    fee_ratio: Optional[str] = None
    fee_amount: Optional[float] = None
    settle_total: Optional[float] = None
    remark: Optional[str] = None
    fee_paid_excel: Optional[str] = None
    fee_paid: Optional[str] = None
    fee_paid_source: str = Field(description="excel | override | empty")
    # 开票：未开票 | 开票中 | 已开票
    invoice_status: str = "unbilled"
    invoice_status_label: str = "未开票"
    invoice_ids: List[int] = []
    invoice_linked_amount: Optional[float] = None


class CloudLedgerScanOut(BaseModel):
    settlement_dir: str
    files: List[str]
    rows: List[CloudLedgerRow]
    row_count: int


class FeePaidPatch(BaseModel):
    row_key: str
    fee_paid: str = Field(description="已支付 / 未支付 / 空字符串清除覆盖")
    note: Optional[str] = None


class FeePaidOut(BaseModel):
    row_key: str
    fee_paid: Optional[str]
    note: Optional[str]
    updated_at: Optional[str]


class ReconIndexItem(BaseModel):
    kind: str
    name: str
    path: str
    children: List[str] = []


class ReconIndexOut(BaseModel):
    recon_dir: str
    items: List[ReconIndexItem]
    meta: dict[str, Any] = {}

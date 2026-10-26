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
    currency: str = Field(default="CNY", description="CNY | USD，与结算表币种或云厂商推断一致")
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
    # 分项：done | open | none（无此金额）
    consume_invoice_status: str = "open"
    fee_invoice_status: str = "none"


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


class ReconReportSummary(BaseModel):
    upstream_usd: Optional[float] = None
    platform_usd: Optional[float] = None
    diff_usd: Optional[float] = None
    diff_pct_of_platform: Optional[float] = None
    top_models: List[dict[str, Any]] = []


class ReconReportListItem(BaseModel):
    id: str
    supplier: str
    period: str
    path: str
    headline: str = ""
    has_overview: bool = False
    has_daily: bool = False
    has_md: bool = False
    overview_file: Optional[str] = None
    daily_file: Optional[str] = None
    md_file: Optional[str] = None
    summary: ReconReportSummary = Field(default_factory=ReconReportSummary)
    status: str = "concluded"
    status_label: str = "已出结论"


class ReconReportListOut(BaseModel):
    recon_dir: str
    upstream_dir: str
    reports: List[ReconReportListItem]
    meta: dict[str, Any] = {}


class ReconModelRow(BaseModel):
    model: str
    upstream_names: str = ""
    side: str = ""
    upstream_usd: Optional[float] = None
    platform_usd: Optional[float] = None
    diff_usd: Optional[float] = None
    share_pct: Optional[float] = None
    align_dates: str = ""
    small_gap_dates: str = ""
    big_gap_dates: str = ""
    calendar: str = ""
    conclusion: str = ""


class ReconDailyPoint(BaseModel):
    date: str
    upstream_usd: float = 0
    platform_usd: float = 0
    diff_usd: float = 0


class ReconUpstreamUsagePoint(BaseModel):
    date: str
    calls: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    cache_tokens: int = 0
    tokens_total: int = 0
    tokens_m: float = 0
    cny: float = 0
    eff_cny_per_m: Optional[float] = None


class ReconDailySeries(BaseModel):
    dates: List[str] = []
    totals: List[ReconDailyPoint] = []
    models: List[str] = []
    by_model: dict[str, List[ReconDailyPoint]] = {}
    upstream_usage: dict[str, List[ReconUpstreamUsagePoint]] = {}
    platform_has_tokens: bool = False
    usage_note: str = ""


class ReconReportDetailOut(BaseModel):
    id: str
    supplier: str
    period: str
    path: str
    status: str
    status_label: str
    summary: ReconReportSummary
    models: List[ReconModelRow]
    md_text: str = ""
    files: List[str] = []
    overview_file: Optional[str] = None
    daily_file: Optional[str] = None
    md_file: Optional[str] = None
    daily_series: ReconDailySeries = Field(default_factory=ReconDailySeries)
    calendar_legend: str = ""
    note: str = ""

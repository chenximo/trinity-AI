from __future__ import annotations

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_repo_root() -> Path:
    # ops-desk/api/app/config.py → parents[3] = trinity-AI
    return Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="OPS_DESK_", env_file=".env", extra="ignore")

    repo_root: Path = _default_repo_root()
    settlement_dir: Optional[Path] = None
    recon_dir: Optional[Path] = None
    payment_template: Optional[Path] = None
    payment_export_dir: Optional[Path] = None
    trinity_invoice_template: Optional[Path] = None
    trinity_invoice_export_dir: Optional[Path] = None
    db: Optional[Path] = None

    payer_name: str = "西安星瀚算力信息科技有限公司"
    department: str = "星瀚业务部"
    applicant: str = "李玲"
    # 每月开票额度（元），可用 OPS_DESK_INVOICE_MONTHLY_QUOTA 覆盖
    invoice_monthly_quota: float = 500_000.0

    def resolved_settlement_dir(self) -> Path:
        if self.settlement_dir:
            return Path(self.settlement_dir)
        return self.repo_root / "AI云业务" / "客户结算"

    def resolved_recon_dir(self) -> Path:
        if self.recon_dir:
            return Path(self.recon_dir)
        return self.repo_root / "pricing" / "账单对账"

    def resolved_payment_template(self) -> Path:
        if self.payment_template:
            return Path(self.payment_template)
        return self.repo_root / "AI云业务" / "发票" / "星瀚付款单+报销单.xlsx"

    def resolved_payment_export_dir(self) -> Path:
        if self.payment_export_dir:
            return Path(self.payment_export_dir)
        return self.repo_root / "AI云业务" / "发票" / "付款申请"

    def resolved_db(self) -> Path:
        if self.db:
            return Path(self.db)
        return Path(__file__).resolve().parents[1] / "data" / "ops-desk.db"

    def resolved_trinity_invoice_template(self) -> Path:
        if self.trinity_invoice_template:
            return Path(self.trinity_invoice_template)
        # ops-desk/templates/… （config 在 ops-desk/api/app）
        return Path(__file__).resolve().parents[2] / "templates" / "trinity-invoice-template.xlsx"

    def resolved_trinity_invoice_export_dir(self) -> Path:
        if self.trinity_invoice_export_dir:
            return Path(self.trinity_invoice_export_dir)
        return self.repo_root / "AI云业务" / "发票" / "Trinity-Invoice"


settings = Settings()

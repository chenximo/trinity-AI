from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import (
    ReconDailySeries,
    ReconIndexItem,
    ReconIndexOut,
    ReconModelRow,
    ReconReportDetailOut,
    ReconReportListItem,
    ReconReportListOut,
    ReconReportSummary,
)
from app.services.recon_reports import get_upstream_report, list_upstream_reports

router = APIRouter(prefix="/recon", tags=["recon"])


@router.get("/index", response_model=ReconIndexOut)
def recon_index() -> ReconIndexOut:
    directory = settings.resolved_recon_dir()
    items = []
    if directory.is_dir():
        for child in sorted(directory.iterdir()):
            if not child.is_dir() or child.name.startswith("."):
                continue
            children = sorted(
                p.name
                for p in child.iterdir()
                if not p.name.startswith(".") and p.name != ".DS_Store"
            )[:50]
            try:
                rel = str(child.relative_to(settings.repo_root))
            except ValueError:
                rel = str(child)
            items.append(
                ReconIndexItem(kind=child.name, name=child.name, path=rel, children=children)
            )
    return ReconIndexOut(
        recon_dir=str(directory),
        items=items,
        meta={"exists": directory.is_dir()},
    )


@router.get("/reports", response_model=ReconReportListOut)
def recon_reports() -> ReconReportListOut:
    directory = settings.resolved_recon_dir()
    upstream = directory / "上游对账"
    raw = list_upstream_reports(directory, settings.repo_root)
    reports = [ReconReportListItem(**item) for item in raw]
    return ReconReportListOut(
        recon_dir=str(directory),
        upstream_dir=str(upstream),
        reports=reports,
        meta={"count": len(reports), "exists": upstream.is_dir()},
    )


@router.get("/reports/{supplier}/{period}", response_model=ReconReportDetailOut)
def recon_report_detail(supplier: str, period: str) -> ReconReportDetailOut:
    directory = settings.resolved_recon_dir()
    raw = get_upstream_report(directory, settings.repo_root, supplier, period)
    if raw is None:
        raise HTTPException(status_code=404, detail=f"未找到对账结论：{supplier}/{period}")
    summary = ReconReportSummary(**(raw.get("summary") or {}))
    models = [ReconModelRow(**m) for m in raw.get("models") or []]
    daily_series = ReconDailySeries(**(raw.get("daily_series") or {}))
    return ReconReportDetailOut(
        id=raw["id"],
        supplier=raw["supplier"],
        period=raw["period"],
        path=raw["path"],
        status=raw["status"],
        status_label=raw["status_label"],
        summary=summary,
        models=models,
        md_text=raw.get("md_text") or "",
        files=raw.get("files") or [],
        overview_file=raw.get("overview_file"),
        daily_file=raw.get("daily_file"),
        md_file=raw.get("md_file"),
        daily_series=daily_series,
        calendar_legend=raw.get("calendar_legend") or "",
        note=raw.get("note") or "",
    )

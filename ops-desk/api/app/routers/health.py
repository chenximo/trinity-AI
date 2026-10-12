from __future__ import annotations

from fastapi import APIRouter

from app.config import settings
from app.schemas import HealthOut

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    return HealthOut(
        repo_root=str(settings.repo_root),
        settlement_dir=str(settings.resolved_settlement_dir()),
        recon_dir=str(settings.resolved_recon_dir()),
    )

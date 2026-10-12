from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter

from app.config import settings
from app.schemas import ReconIndexItem, ReconIndexOut

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

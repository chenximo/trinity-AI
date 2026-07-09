"""CLI entry: stream bot + dry-run API."""

from __future__ import annotations

import argparse
import logging
from typing import Any, Optional

import uvicorn
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from src.config import get_settings
from src.pipeline import dry_run_extract
from src.stream_worker import run_stream_forever, start_stream_in_background

settings = get_settings()
logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

app = FastAPI(title="dingtalk-requirement-inbox", version="0.1.0")


class DryRunRequest(BaseModel):
    messages: list[dict[str, Any]] = Field(default_factory=list)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "dingtalk-requirement-inbox"}


@app.post("/internal/dry-run")
async def internal_dry_run(
    payload: DryRunRequest,
    x_internal_token: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    if not settings.internal_dry_run_token:
        raise HTTPException(status_code=404, detail="dry-run disabled")
    if x_internal_token != settings.internal_dry_run_token:
        raise HTTPException(status_code=403, detail="forbidden")
    result = await dry_run_extract(settings, payload.messages)
    return {"ok": True, "result": result}


def main() -> None:
    parser = argparse.ArgumentParser(description="Trinity requirement inbox — DingTalk")
    parser.add_argument(
        "mode",
        choices=["stream", "api", "all"],
        help="stream=only bot; api=only dry-run API; all=both",
    )
    args = parser.parse_args()

    if args.mode == "stream":
        run_stream_forever()
        return

    if args.mode == "api":
        uvicorn.run(app, host="0.0.0.0", port=settings.api_port, log_level=settings.log_level.lower())
        return

    start_stream_in_background()
    uvicorn.run(app, host="0.0.0.0", port=settings.api_port, log_level=settings.log_level.lower())


if __name__ == "__main__":
    main()

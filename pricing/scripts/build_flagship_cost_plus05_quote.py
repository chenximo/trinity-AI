#!/usr/bin/env python3
"""主力模型定制报价：商务总表 ≥$50k 阶梯折，对客再 +0.5（5折→5.5折）。

UI 与海外三家定制表一致；刊例来自内部 L3a。
"""
from __future__ import annotations

import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from custom_quote_workbook import (  # noqa: E402
    CUSTOM_QUOTES_DIR,
    load_cloud_maas_routes,
    load_text_listing,
    load_video_listing,
    maas_route_for_matrix_upstream,
    resolve_commercial_quote,
    write_custom_quote_workbook,
)

ROOT = SCRIPTS.parent
OUT = CUSTOM_QUOTES_DIR / "Trinity模型报价表_主力模型定制.xlsx"

# 商务总表 ≥$50k 阶梯折 + 0.5（折数维度：5→5.5）
COST_UPLIFT = 0.5

FLAGSHIP_MODEL_IDS = [
    "kimi-k3",
    "glm-5.2",
    "deepseek-v4-pro",
    "qwen3.8-max",
    "gpt-5.6-sol",
    "claude-opus-5",
    "seedance-2.0-overseas-hc-os",
]


def build_rows() -> list[dict]:
    maas = load_cloud_maas_routes()
    rows: list[dict] = []
    for model_id in FLAGSHIP_MODEL_IDS:
        if model_id.startswith("seedance"):
            listing = load_video_listing(model_id, prefer_spec="720p")
        else:
            listing = load_text_listing(model_id)
        if not listing:
            raise KeyError(f"listing not found in L3a: {model_id}")

        zhe, cost_note, upstream = resolve_commercial_quote(
            model_id, uplift=COST_UPLIFT
        )
        route = maas_route_for_matrix_upstream(upstream, maas)

        rows.append(
            {
                **listing,
                "zhe": zhe,
                "route": route,
                "_cost_note": cost_note,
                "_upstream": upstream,
            }
        )
    return rows


def main() -> None:
    rows = build_rows()
    write_custom_quote_workbook(
        OUT,
        rows,
        title="Trinity · 折扣报价表",
        include_route=True,
    )
    print(f"wrote {OUT} rows={len(rows)}")
    for r in rows:
        print(
            f"  {r['model_id']:28} {r['_cost_note']:40} → {r['zhe']:6} route={r['route']}"
        )


if __name__ == "__main__":
    main()

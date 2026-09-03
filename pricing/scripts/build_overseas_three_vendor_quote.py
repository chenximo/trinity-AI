#!/usr/bin/env python3
"""海外三家（Claude / GPT / Gemini）定制折扣报价 · 共用 custom_quote_workbook UI。

表头：模态 | 厂商 | 模型 ID | 显示名 | 刊例三列 | 折扣 | 线路
"""
from __future__ import annotations

import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import openpyxl

from build_outward_quote_standard import solid_fill  # noqa: E402
from custom_quote_workbook import (  # noqa: E402
    CUSTOM_QUOTES_DIR,
    INTERNAL,
    load_cloud_maas_routes,
    write_custom_quote_workbook,
)

ROOT = SCRIPTS.parent
OUT = CUSTOM_QUOTES_DIR / "Trinity模型报价表_海外三家定制.xlsx"

VENDORS = ("OpenAI", "Anthropic", "Google")
VENDOR_TO_MAAS = {
    "OpenAI": "Azure",
    "Google": "Google Cloud",
    "Anthropic": "AWS",
}

CUSTOM_ZHE_FROM_L3A = {
    "7.2折": "5.5折",
    "7.8折": "7.5折",
    "8.8折": "8.3折",
}


def load_rows() -> list[dict]:
    maas = load_cloud_maas_routes()
    wb = openpyxl.load_workbook(INTERNAL, read_only=True)
    ws = wb["01_生文"]
    vendor = None
    out: list[dict] = []
    for row in ws.iter_rows(min_row=4, values_only=True):
        if row[0]:
            vendor = row[0]
        if not row[1]:
            continue
        mid = str(row[1]).strip()
        if vendor not in VENDORS or mid.endswith("-discount"):
            continue
        zhe = CUSTOM_ZHE_FROM_L3A.get(str(row[8]).strip(), row[8])
        if not zhe or zhe == "—":
            continue
        maas_key = VENDOR_TO_MAAS.get(vendor, "")
        route = maas.get(maas_key, maas_key or "—")
        out.append(
            {
                "modality": "生文",
                "vendor": vendor,
                "model_id": mid,
                "display": row[2],
                "inp": row[3],
                "out": row[4],
                "cache": row[5],
                "zhe": zhe,
                "route": route,
            }
        )
    order = {v: i for i, v in enumerate(VENDORS)}
    out.sort(key=lambda r: (order.get(r["vendor"], 99), r["model_id"]))
    return out


def main() -> None:
    rows = load_rows()
    fills = {
        "OpenAI": solid_fill("E8F4FC"),
        "Anthropic": solid_fill("F3E8FF"),
        "Google": solid_fill("E8F8F0"),
    }
    write_custom_quote_workbook(
        OUT,
        rows,
        vendor_fills=fills,
        include_route=True,
    )
    print(f"wrote {OUT} rows={len(rows)}")


if __name__ == "__main__":
    main()

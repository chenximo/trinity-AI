#!/usr/bin/env python3
"""同步 hehe 定制表中的 *-discount 内部 SKU：刊例价 + 客户折扣。

成本族 → hehe 折扣列（单档，非 L3a 三档）：
  - 0.277 / 0.026（≈0.28 / 0.26 成本折）→ 0.4折（不是 4折）
  - 0.693（≈0.69 成本折）→ 1折
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import openpyxl
from openpyxl.styles import PatternFill

from build_outward_quote_standard import solid_fill  # noqa: E402
from custom_quote_workbook import CUSTOM_QUOTES_DIR  # noqa: E402
from xlsx_wechat_compat import patch_xlsx_for_wechat  # noqa: E402

HEHE = CUSTOM_QUOTES_DIR / "Trinity模型报价表_hehe.xlsx"
INTERNAL = ROOT / "output/Trinity模型报价表（内部）.xlsx"

# L3b：0.0277（0.277折）· 0.026（0.26折）族
ZHE_COST_LOW = "0.4折"
# L3b：0.0693（0.693折）族
ZHE_COST_069 = "1折"

YELLOW = PatternFill(fill_type="solid", fgColor="FFF2CC")


def zhe_for_discount_model(model_id: str) -> str:
    mid = str(model_id).strip().lower()
    if not mid.endswith("-discount"):
        raise ValueError(f"not a discount SKU: {model_id}")
    if mid.startswith("claude-"):
        return ZHE_COST_069
    if mid.startswith(("gpt-", "glm-")) or mid == "gpt-image-2-discount":
        return ZHE_COST_LOW
    raise ValueError(f"unknown discount SKU family: {model_id}")


def load_internal_discount_rows() -> dict[str, dict]:
    """key = model_id; image uses single row per id."""
    wb = openpyxl.load_workbook(INTERNAL, read_only=True)
    out: dict[str, dict] = {}

    ws = wb["01_生文"]
    vendor = None
    for row in ws.iter_rows(min_row=4, values_only=True):
        if row[0]:
            vendor = row[0]
        if not row[1]:
            continue
        mid = str(row[1]).strip()
        if not mid.endswith("-discount"):
            continue
        out[mid] = {
            "vendor": vendor,
            "display": row[2],
            "inp": row[3],
            "out": row[4],
            "cache": row[5],
            "modality": "生文",
        }

    ws_img = wb["02_生图"]
    vendor = None
    for row in ws_img.iter_rows(min_row=4, values_only=True):
        if row[0]:
            vendor = row[0]
        if not row[1]:
            continue
        mid = str(row[1]).strip()
        if mid != "gpt-image-2-discount":
            continue
        if mid not in out:
            out[mid] = {
                "vendor": vendor or "OpenAI",
                "display": row[2],
                "inp": row[5],
                "out": "—",
                "cache": "—",
                "modality": "生图",
            }
        break
    return out


def sync_hehe_discounts() -> tuple[list[str], list[str]]:
    internal = load_internal_discount_rows()
    wb = openpyxl.load_workbook(HEHE)
    ws = wb["仅有折扣"]

    updated: list[str] = []
    missing: list[str] = []

    for row_idx in range(3, ws.max_row + 1):
        mid = ws.cell(row_idx, 3).value
        if not mid or "discount" not in str(mid).lower():
            continue
        mid = str(mid).strip()
        src = internal.get(mid)
        if not src:
            continue
        zhe = zhe_for_discount_model(mid)
        changes = []
        for col, key in [(4, "display"), (5, "inp"), (6, "out"), (7, "cache"), (8, "zhe")]:
            new_val = src[key] if key != "zhe" else zhe
            cell = ws.cell(row_idx, col)
            if cell.value != new_val:
                changes.append(key)
                cell.value = new_val
        if changes:
            for c in range(1, 9):
                ws.cell(row_idx, c).fill = YELLOW
            updated.append(f"{mid} ({', '.join(changes)})")

    existing = {
        str(ws.cell(i, 3).value).strip()
        for i in range(3, ws.max_row + 1)
        if ws.cell(i, 3).value
    }
    for mid in sorted(internal.keys()):
        if mid not in existing:
            missing.append(mid)

    wb.save(HEHE)
    patch_xlsx_for_wechat(HEHE)
    return updated, missing


def main() -> None:
    updated, missing = sync_hehe_discounts()
    print(f"synced {HEHE}")
    if updated:
        print("updated:")
        for u in updated:
            print(f"  {u}")
    else:
        print("no row changes (already correct)")
    if missing:
        print("still missing in hehe (add manually if needed):")
        for m in missing:
            print(f"  {m}")


if __name__ == "__main__":
    main()

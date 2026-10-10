#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build Trinity L3a outward quote sheet (数据宝形态).

- 目录价绝对价（入/出/缓存）+ 公开用量阶梯折（对外三档 $5k/$10k/$50k，入/出同折）
- 目录价含原缓存价列；阶梯列仍为入/出（缓存命中阶梯另议）
- 商务总册：读 10/11；回写 01_报价解析汇总（不改 10/11）
- 阶梯数字：定价方案-v0 公开定折矩阵（非 L3b 商务深折照抄）
- 本轮目录价：线上为主；刊例策略 §3.1 上浮两款覆盖（hy-mt2-plus / glm-5.2）
- 对内册：相对上一版新增/变更行浅黄标记，并写「相对上版变更」页 + 变更摘要.md
- 对内册：累积「更新」日志（与 L3b 商务总册同款：日期/分类/说明/备注，新→旧）；对外册不加

Sources:
  - L2 线上刊例: pricing/output/online/prices-api-text.json（主源，覆盖全量上架）
  - 可选对照: pricing/output/trinity-pricing-text.xlsx「刊例对比校验-生文」
  - 模型→成本族: pricing/output/商务洽谈折扣总表.xlsx（10 归属 + 11 推荐成本折）
  - 回写商务表: 01_报价解析汇总（报价依据）
"""
from __future__ import annotations

import json
import math
import re
import sys
from datetime import date
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
from xlsx_wechat_compat import patch_xlsx_for_wechat  # noqa: E402


def solid_fill(rgb6: str) -> PatternFill:
    """不透明实心底色。须 FF 前缀：openpyxl 默认 00=透明，微信预览会整格无色。"""
    h = str(rgb6).strip().lstrip("#").upper()
    if len(h) == 8:
        h = "FF" + h[2:]
    elif len(h) == 6:
        h = "FF" + h
    return PatternFill(fill_type="solid", fgColor=h, bgColor=h)

ROOT = Path(__file__).resolve().parents[1]
SRC_ONLINE = ROOT / "output/online/prices-api-text.json"
SRC_ONLINE_IMAGE = ROOT / "output/online/prices-api-image.json"
SRC_ONLINE_VIDEO = ROOT / "output/online/prices-api-video.json"
SRC_PRICES = ROOT / "output/trinity-pricing-text.xlsx"
SRC_COMMERCIAL = ROOT / "output/商务洽谈折扣总表.xlsx"
# routes 用于扫描“线路管理”启用/停用与成本/官方比（进而推导成本族与对外阶梯依据）
# 这里改为读取 routes-live，确保新上架模型也能被纳入解析汇总与阶梯依据。
ROUTES_TEXT = ROOT / "input/routes-live"
ROUTES_IMAGE = ROOT / "input/routes-live"
ROUTES_VIDEO = ROOT / "input/routes-live"
OUT = ROOT / "output/Trinity模型报价表（内部）.xlsx"
OUT_DISCOUNT_ONLY = ROOT / "output/Trinity模型报价表.xlsx"
OUT_DISCOUNT_ONLY_LEGACY = ROOT / "output/Trinity模型报价表-仅有折扣.xlsx"

# 相对上版：新增 / 刊例或档位变更 → 浅黄（与 hehe 定制表一致）
FILL_CHANGE = solid_fill("FFF2CC")
# 深档闸门：对外最深落到此及以下时，变更摘要单独点名
DEEP_TIER_GATE = 5.55
SHEET_CHANGE = "相对上版变更"
SHEET_UPD = "更新"  # 与 L3b 商务总册同款累积日志（新→旧）
SHEET_HEHE = "hehe公司需求"


def _change_summary_md_path() -> Path:
    """对内变更摘要.md；OUT 为软链时落在 商务成品/对内/。"""
    try:
        return OUT.resolve().parent / "变更摘要-L3a.md"
    except OSError:
        return ROOT / "商务成品/对内/变更摘要-L3a.md"


def _cell_str(val) -> str:
    if val is None:
        return ""
    return str(val).strip()


def _tiers_sig(zhes: list[float | None] | None) -> tuple[str, str, str]:
    if not zhes:
        return ("—", "—", "—")
    out: list[str] = []
    for i in range(3):
        z = zhes[i] if i < len(zhes) else None
        out.append(fmt_tier_zhe(z) if z is not None else "—")
    return (out[0], out[1], out[2])


def _listing_sig_text(inp: str, out: str, cache: str) -> str:
    return f"{inp}|{out}|{cache}"


def build_quote_snapshot(
    models: list[dict],
    image_rows: list[dict],
    video_rows: list[dict],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> dict[str, dict]:
    """本轮内存快照：model_id → 模态/刊例签名/三档折。"""
    snap: dict[str, dict] = {}
    for m in models:
        mid = m["model_id"]
        fam = resolve_family(mid, model_families, recommended)
        zhes = public_tiers_for(mid, fam)
        snap[mid] = {
            "modality": "生文",
            "vendor": m.get("vendor") or "",
            "display": m.get("display") or mid,
            "listing": _listing_sig_text(
                fmt_num(m["inp"]), fmt_num(m["out"]), fmt_cache(m.get("cache"))
            ),
            "tiers": _tiers_sig(zhes),
            "family": fam,
        }

    for mod, rows in (("生图", image_rows), ("生视频", video_rows)):
        by_id: dict[str, list[dict]] = {}
        for r in rows:
            by_id.setdefault(r["model_id"], []).append(r)
        for mid, group in by_id.items():
            fam = resolve_family(mid, model_families, recommended)
            zhes = public_tiers_for(mid, fam)
            parts = []
            for r in group:
                cat = (
                    r["catalog_display"]
                    if r.get("catalog_display")
                    else fmt_num(r["catalog"])
                )
                parts.append(f"{r.get('spec') or ''}={cat}")
            snap[mid] = {
                "modality": mod,
                "vendor": group[0].get("vendor") or "",
                "display": group[0].get("display") or mid,
                "listing": "|".join(parts),
                "tiers": _tiers_sig(zhes),
                "family": fam,
            }
    return snap


def _find_header_row(ws, must_have: str = "模型 ID", max_scan: int = 12) -> int | None:
    for r in range(1, max_scan + 1):
        for c in range(1, 16):
            if _cell_str(ws.cell(r, c).value) == must_have:
                return r
    return None


def _col_map(ws, header_row: int) -> dict[str, int]:
    m: dict[str, int] = {}
    for c in range(1, 20):
        h = _cell_str(ws.cell(header_row, c).value)
        if h:
            m[h] = c
    return m


def load_quote_snapshot(path: Path) -> dict[str, dict]:
    """从已有对内/外发 xlsx 读上版快照（优先 01/02/03，缺则 00/仅有折扣）。"""
    if not path.exists():
        return {}
    try:
        real = path.resolve()
    except OSError:
        real = path
    if not real.exists():
        return {}
    wb = openpyxl.load_workbook(real, data_only=True)
    snap: dict[str, dict] = {}

    def _ingest_text_sheet(ws) -> None:
        hr = _find_header_row(ws)
        if hr is None:
            return
        cols = _col_map(ws, hr)
        c_mid = cols.get("模型 ID")
        if not c_mid:
            return
        c_vendor = cols.get("厂商")
        c_disp = cols.get("显示名")
        c_in = cols.get("刊例价·输入")
        c_out = cols.get("刊例价·输出")
        c_cache = cols.get("刊例价·缓存")
        tier_cols = [cols.get(lab) for _, lab, _ in TIERS]
        last_vendor = ""
        for r in range(hr + 1, ws.max_row + 1):
            mid = _cell_str(ws.cell(r, c_mid).value)
            if not mid:
                continue
            if c_vendor:
                v = _cell_str(ws.cell(r, c_vendor).value)
                if v:
                    last_vendor = v
            snap[mid] = {
                "modality": "生文",
                "vendor": last_vendor,
                "display": _cell_str(ws.cell(r, c_disp).value) if c_disp else mid,
                "listing": _listing_sig_text(
                    _cell_str(ws.cell(r, c_in).value) if c_in else "",
                    _cell_str(ws.cell(r, c_out).value) if c_out else "",
                    _cell_str(ws.cell(r, c_cache).value) if c_cache else "",
                ),
                "tiers": tuple(
                    (_cell_str(ws.cell(r, tc).value) if tc else "—") or "—"
                    for tc in (tier_cols + [None, None, None])[:3]
                ),
                "family": None,
            }

    def _ingest_media_sheet(ws, modality: str) -> None:
        hr = _find_header_row(ws)
        if hr is None:
            return
        cols = _col_map(ws, hr)
        c_mid = cols.get("模型 ID")
        if not c_mid:
            return
        c_vendor = cols.get("厂商")
        c_disp = cols.get("显示名")
        c_spec = cols.get("规格")
        c_cat = cols.get("刊例价")
        tier_cols = [cols.get(lab) for _, lab, _ in TIERS]
        last_vendor = ""
        acc: dict[str, dict] = {}
        for r in range(hr + 1, ws.max_row + 1):
            mid = _cell_str(ws.cell(r, c_mid).value)
            if not mid:
                continue
            if c_vendor:
                v = _cell_str(ws.cell(r, c_vendor).value)
                if v:
                    last_vendor = v
            spec = _cell_str(ws.cell(r, c_spec).value) if c_spec else ""
            cat = _cell_str(ws.cell(r, c_cat).value) if c_cat else ""
            tiers = tuple(
                (_cell_str(ws.cell(r, tc).value) if tc else "—") or "—"
                for tc in (tier_cols + [None, None, None])[:3]
            )
            if mid not in acc:
                acc[mid] = {
                    "modality": modality,
                    "vendor": last_vendor,
                    "display": _cell_str(ws.cell(r, c_disp).value) if c_disp else mid,
                    "parts": [],
                    "tiers": tiers,
                    "family": None,
                }
            acc[mid]["parts"].append(f"{spec}={cat}")
            acc[mid]["vendor"] = last_vendor or acc[mid]["vendor"]
            acc[mid]["tiers"] = tiers
        for mid, info in acc.items():
            snap[mid] = {
                "modality": info["modality"],
                "vendor": info["vendor"],
                "display": info["display"],
                "listing": "|".join(info["parts"]),
                "tiers": info["tiers"],
                "family": None,
            }

    def _ingest_overview_sheet(ws) -> None:
        hr = _find_header_row(ws)
        if hr is None:
            return
        cols = _col_map(ws, hr)
        c_mid = cols.get("模型 ID")
        if not c_mid:
            return
        c_mod = cols.get("模态")
        c_vendor = cols.get("厂商")
        c_disp = cols.get("显示名")
        c_in = cols.get("刊例价·输入")
        c_out = cols.get("刊例价·输出")
        c_cache = cols.get("刊例价·缓存")
        tier_cols = [cols.get(lab) for _, lab, _ in TIERS]
        last_mod, last_vendor = "", ""
        for r in range(hr + 1, ws.max_row + 1):
            mid = _cell_str(ws.cell(r, c_mid).value)
            if not mid:
                continue
            if c_mod:
                v = _cell_str(ws.cell(r, c_mod).value)
                if v:
                    last_mod = v
            if c_vendor:
                v = _cell_str(ws.cell(r, c_vendor).value)
                if v:
                    last_vendor = v
            if mid in snap:
                continue  # 分册已覆盖
            snap[mid] = {
                "modality": last_mod or "—",
                "vendor": last_vendor,
                "display": _cell_str(ws.cell(r, c_disp).value) if c_disp else mid,
                "listing": _listing_sig_text(
                    _cell_str(ws.cell(r, c_in).value) if c_in else "",
                    _cell_str(ws.cell(r, c_out).value) if c_out else "",
                    _cell_str(ws.cell(r, c_cache).value) if c_cache else "",
                ),
                "tiers": tuple(
                    (_cell_str(ws.cell(r, tc).value) if tc else "—") or "—"
                    for tc in (tier_cols + [None, None, None])[:3]
                ),
                "family": None,
            }

    if "01_生文" in wb.sheetnames:
        _ingest_text_sheet(wb["01_生文"])
    if "02_生图" in wb.sheetnames:
        _ingest_media_sheet(wb["02_生图"], "生图")
    if "03_生视频" in wb.sheetnames:
        _ingest_media_sheet(wb["03_生视频"], "生视频")
    if "00_折扣一览" in wb.sheetnames:
        _ingest_overview_sheet(wb["00_折扣一览"])
    elif "仅有折扣" in wb.sheetnames:
        _ingest_overview_sheet(wb["仅有折扣"])
    wb.close()
    return snap


def _parse_zhe_num(label: str) -> float | None:
    """'8.5折' / '6折' / '—' → float or None。"""
    s = _cell_str(label)
    if not s or s in {"—", "-", "原价"}:
        return None
    m = re.search(r"(\d+(?:\.\d+)?)", s)
    if not m:
        return None
    return float(m.group(1))


def diff_quote_snapshots(prev: dict[str, dict], curr: dict[str, dict]) -> dict:
    """相对上版：新增 / 下架 / 刊例变 / 档位变；highlight=新增+变更。"""
    added: list[dict] = []
    removed: list[dict] = []
    listing_changed: list[dict] = []
    tier_changed: list[dict] = []
    deep_flags: list[dict] = []

    for mid, now in sorted(curr.items()):
        if mid not in prev:
            added.append({"model_id": mid, **now})
            deep = min(
                (z for z in (_parse_zhe_num(t) for t in now["tiers"]) if z is not None),
                default=None,
            )
            if deep is not None and deep <= DEEP_TIER_GATE:
                deep_flags.append(
                    {
                        "model_id": mid,
                        "kind": "新增深档",
                        "tiers": "/".join(now["tiers"]),
                        "deep": deep,
                    }
                )
            continue
        old = prev[mid]
        if old.get("listing") != now.get("listing"):
            listing_changed.append(
                {
                    "model_id": mid,
                    "modality": now.get("modality") or old.get("modality"),
                    "display": now.get("display") or mid,
                    "before": old.get("listing"),
                    "after": now.get("listing"),
                }
            )
        if tuple(old.get("tiers") or ()) != tuple(now.get("tiers") or ()):
            tier_changed.append(
                {
                    "model_id": mid,
                    "modality": now.get("modality") or old.get("modality"),
                    "display": now.get("display") or mid,
                    "before": "/".join(old.get("tiers") or ()),
                    "after": "/".join(now.get("tiers") or ()),
                }
            )
            deep = min(
                (z for z in (_parse_zhe_num(t) for t in now["tiers"]) if z is not None),
                default=None,
            )
            old_deep = min(
                (
                    z
                    for z in (_parse_zhe_num(t) for t in (old.get("tiers") or ()))
                    if z is not None
                ),
                default=None,
            )
            if deep is not None and deep <= DEEP_TIER_GATE and (
                old_deep is None or old_deep > DEEP_TIER_GATE or deep < (old_deep or 99)
            ):
                deep_flags.append(
                    {
                        "model_id": mid,
                        "kind": "档位落入深档",
                        "tiers": "/".join(now["tiers"]),
                        "deep": deep,
                        "before": "/".join(old.get("tiers") or ()),
                    }
                )

    for mid, old in sorted(prev.items()):
        if mid not in curr:
            removed.append({"model_id": mid, **old})

    highlight_ids = {
        *(r["model_id"] for r in added),
        *(r["model_id"] for r in listing_changed),
        *(r["model_id"] for r in tier_changed),
    }
    return {
        "added": added,
        "removed": removed,
        "listing_changed": listing_changed,
        "tier_changed": tier_changed,
        "deep_flags": deep_flags,
        "highlight_ids": highlight_ids,
        "prev_count": len(prev),
        "curr_count": len(curr),
    }


def write_change_summary_sheet(
    wb,
    diff: dict,
    *,
    valid_until: str,
    thin,
    white_bold,
    body_font,
    num_font,
    center,
    left,
) -> None:
    """对内册：相对上版变更页（插在 00 之后）。"""
    if SHEET_CHANGE in wb.sheetnames:
        del wb[SHEET_CHANGE]
    idx = 1 if "00_折扣一览" in wb.sheetnames else 0
    ws = wb.create_sheet(SHEET_CHANGE, idx)
    header_fill = solid_fill("1B4F72")
    n_cols = 6
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=n_cols)
    ws["A1"] = "Trinity · 相对上版变更"
    ws["A1"].font = Font(name="PingFang SC", size=18, bold=True, color="1D2939")
    ws.row_dimensions[1].height = 28
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=n_cols)
    ws["A2"] = (
        f"对照重建前磁盘上的上一版对内表。有效期：{valid_until}。"
        f"　上版 {diff['prev_count']} 款 → 本版 {diff['curr_count']} 款。"
        f"　+{len(diff['added'])} / −{len(diff['removed'])} / "
        f"刊例变 {len(diff['listing_changed'])} / 档位变 {len(diff['tier_changed'])}。"
        "　分册与折扣一览中浅黄行 = 本表「新增」或「变更」。"
        "　下架仅列于此，不在分册留空行。"
    )
    ws["A2"].font = Font(name="PingFang SC", size=10, color="475467")
    ws["A2"].alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[2].height = 48

    headers = ["类型", "模态", "模型 ID", "显示名", "上版", "本版"]
    for i, h in enumerate(headers, 1):
        cell = ws.cell(4, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
    ws.row_dimensions[4].height = 24

    rows_out: list[tuple] = []
    for r in diff["added"]:
        rows_out.append(
            (
                "新增",
                r.get("modality") or "",
                r["model_id"],
                r.get("display") or "",
                "—",
                f"{r.get('listing') or ''} · {'/'.join(r.get('tiers') or ())}",
            )
        )
    for r in diff["removed"]:
        rows_out.append(
            (
                "下架",
                r.get("modality") or "",
                r["model_id"],
                r.get("display") or "",
                f"{r.get('listing') or ''} · {'/'.join(r.get('tiers') or ())}",
                "—",
            )
        )
    for r in diff["listing_changed"]:
        rows_out.append(
            (
                "刊例变",
                r.get("modality") or "",
                r["model_id"],
                r.get("display") or "",
                r.get("before") or "",
                r.get("after") or "",
            )
        )
    for r in diff["tier_changed"]:
        rows_out.append(
            (
                "档位变",
                r.get("modality") or "",
                r["model_id"],
                r.get("display") or "",
                r.get("before") or "",
                r.get("after") or "",
            )
        )
    for r in diff["deep_flags"]:
        rows_out.append(
            (
                f"⚠ {r['kind']}",
                "",
                r["model_id"],
                "",
                r.get("before") or "—",
                r.get("tiers") or "",
            )
        )

    type_fills = {
        "新增": FILL_CHANGE,
        "下架": solid_fill("FEE2E2"),
        "刊例变": FILL_CHANGE,
        "档位变": FILL_CHANGE,
    }
    for idx_r, vals in enumerate(rows_out):
        r = 5 + idx_r
        kind = vals[0]
        fill = FILL_CHANGE if kind.startswith("⚠") else type_fills.get(kind)
        for c, v in enumerate(vals, 1):
            cell = ws.cell(r, c, v)
            style_cell(
                cell,
                font=body_font,
                align=center if c <= 2 else left,
                border=thin,
                fill=fill,
            )

    for i, w in enumerate([12, 8, 28, 22, 36, 36], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A5"


def _fmt_dot_date(d: date | None = None) -> str:
    d = d or date.today()
    return f"{d.year}.{d.month}.{d.day}"


def _fmt_id_list(ids: list[str], limit: int = 12) -> str:
    ids = list(ids)
    if len(ids) <= limit:
        return "、".join(ids)
    return "、".join(ids[:limit]) + f" 等共 {len(ids)} 款"


def load_l3a_changelog_from_xlsx(path: Path) -> list[dict[str, str]]:
    """读取对内 L3a「更新」页历史（跳过说明行/表头）。"""
    if not path.exists():
        return []
    try:
        real = path.resolve()
    except OSError:
        real = path
    if not real.exists():
        return []
    try:
        wb = openpyxl.load_workbook(real, data_only=True)
    except Exception:  # noqa: BLE001
        return []
    try:
        if SHEET_UPD not in wb.sheetnames:
            return []
        ws = wb[SHEET_UPD]
        rows: list[dict[str, str]] = []
        for i, row in enumerate(ws.iter_rows(max_col=4, values_only=True), 1):
            a, b, c, d = (list(row) + [None, None, None, None])[:4]
            if i <= 2:
                continue
            date_s = _cell_str(a)
            detail = _cell_str(c)
            if not date_s and not detail:
                continue
            if date_s == "日期":
                continue
            if "账单说明" in date_s or "本表为" in date_s:
                continue
            rows.append(
                {
                    "date": date_s,
                    "category": _cell_str(b),
                    "detail": detail,
                    "note": _cell_str(d),
                }
            )
        return rows
    finally:
        wb.close()


def changelog_entries_from_diff(diff: dict, today: str) -> list[dict[str, str]]:
    """由本轮相对上版 diff 生成「更新」日志行（有变更才写）。"""
    entries: list[dict[str, str]] = []
    for mod in ("生文", "生图", "生视频"):
        adds = [r["model_id"] for r in diff["added"] if r.get("modality") == mod]
        rems = [r["model_id"] for r in diff["removed"] if r.get("modality") == mod]
        if adds:
            entries.append(
                {
                    "date": today,
                    "category": mod,
                    "detail": f"新增 {len(adds)} 款：{_fmt_id_list(adds)}",
                    "note": "相对上版 · L3a 对内",
                }
            )
        if rems:
            entries.append(
                {
                    "date": today,
                    "category": mod,
                    "detail": f"下架 {len(rems)} 款：{_fmt_id_list(rems)}",
                    "note": "相对上版 · 线上刊例已无或未再上架",
                }
            )

    by_mod_listing: dict[str, list[str]] = {}
    for r in diff["listing_changed"]:
        by_mod_listing.setdefault(r.get("modality") or "总册", []).append(r["model_id"])
    for mod, ids in by_mod_listing.items():
        entries.append(
            {
                "date": today,
                "category": mod,
                "detail": f"刊例变 {len(ids)} 款：{_fmt_id_list(ids)}",
                "note": "相对上版 · 详见「相对上版变更」",
            }
        )

    by_mod_tier: dict[str, list[str]] = {}
    for r in diff["tier_changed"]:
        by_mod_tier.setdefault(r.get("modality") or "总册", []).append(r["model_id"])
    for mod, ids in by_mod_tier.items():
        entries.append(
            {
                "date": today,
                "category": mod,
                "detail": f"档位折变 {len(ids)} 款：{_fmt_id_list(ids)}",
                "note": "相对上版 · 详见「相对上版变更」",
            }
        )

    if diff["deep_flags"]:
        ids = [r["model_id"] for r in diff["deep_flags"]]
        entries.append(
            {
                "date": today,
                "category": "总册",
                "detail": f"深档闸门（须人审）{len(ids)} 款：{_fmt_id_list(ids)}",
                "note": f"对外最深 ≤{DEEP_TIER_GATE:g} 折",
            }
        )
    return entries


def write_l3a_changelog_sheet(
    wb,
    entries: list[dict[str, str]],
    *,
    thin,
    white_bold,
    body_font,
    center,
    left,
) -> None:
    """对内册首页「更新」：与 L3b 同结构，新→旧。"""
    if SHEET_UPD in wb.sheetnames:
        del wb[SHEET_UPD]
    ws = wb.create_sheet(SHEET_UPD, 0)
    header_fill = solid_fill("1B4F72")
    hint_fill = solid_fill("FEF3C7")
    alt = solid_fill("F8FAFC")

    ws.merge_cells("A1:D1")
    ws["A1"] = (
        "账单说明：本表为 L3a 对内报价册（折扣一览 + 分册），整表不外发。"
        "对外客户只用 Trinity模型报价表.xlsx。"
        "本页为累积更新日志（新→旧）：新增 / 下架 / 刊例变 / 档位折变。"
        "本轮逐行明细见「相对上版变更」；浅黄行为本轮变更。"
        "重建：python3 pricing/scripts/build_outward_quote_standard.py。"
    )
    ws["A1"].font = Font(name="PingFang SC", size=9, color="713F12")
    ws["A1"].fill = hint_fill
    ws["A1"].alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[1].height = 52

    for i, h in enumerate(("日期", "分类", "更新说明", "备注"), 1):
        cell = ws.cell(2, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
    ws.row_dimensions[2].height = 22

    for idx, ent in enumerate(entries):
        r = 3 + idx
        fill = alt if idx % 2 else None
        vals = (
            ent.get("date") or "",
            ent.get("category") or "",
            ent.get("detail") or "",
            ent.get("note") or "",
        )
        for c, v in enumerate(vals, 1):
            cell = ws.cell(r, c, v)
            style_cell(
                cell,
                font=body_font,
                align=center if c <= 2 else left,
                border=thin,
                fill=fill,
            )
        ws.row_dimensions[r].height = 36 if len(vals[2]) > 60 else 22

    for i, w in enumerate([12, 8, 72, 28], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A3"


def write_change_summary_md(
    diff: dict,
    *,
    generated: str,
    changelog: list[dict[str, str]] | None = None,
) -> Path:
    """写变更摘要.md（本轮明细 + 累积更新日志）。"""
    path = _change_summary_md_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = [
        "# L3a 相对上版变更摘要",
        "",
        f"- 生成日期：{generated}",
        f"- 上版模型数：{diff['prev_count']} → 本版：{diff['curr_count']}",
        f"- 新增 **{len(diff['added'])}** · 下架 **{len(diff['removed'])}** · "
        f"刊例变 **{len(diff['listing_changed'])}** · 档位变 **{len(diff['tier_changed'])}**",
        "",
        "## 对外短摘要",
        "",
    ]
    if not diff["prev_count"]:
        lines.append("（无上版文件可对照，本轮为全量基线。）")
    else:
        bits = [
            f"+{len(diff['added'])}",
            f"−{len(diff['removed'])}",
            f"档位变 {len(diff['tier_changed'])}",
            f"刊例变 {len(diff['listing_changed'])}",
        ]
        lines.append("；".join(bits) + "。")
        if diff["added"]:
            lines.append(
                "- 新增："
                + "、".join(f"`{r['model_id']}`" for r in diff["added"][:20])
                + ("…" if len(diff["added"]) > 20 else "")
            )
        if diff["removed"]:
            lines.append(
                "- 下架："
                + "、".join(f"`{r['model_id']}`" for r in diff["removed"][:20])
                + ("…" if len(diff["removed"]) > 20 else "")
            )
        if diff["tier_changed"]:
            lines.append("- 档位变（节选）：")
            for r in diff["tier_changed"][:15]:
                lines.append(
                    f"  - `{r['model_id']}`：{r['before']} → {r['after']}"
                )
            if len(diff["tier_changed"]) > 15:
                lines.append(f"  - …共 {len(diff['tier_changed'])} 款")
        if diff["deep_flags"]:
            lines.append("- **深档闸门（须人审）**：")
            for r in diff["deep_flags"]:
                lines.append(
                    f"  - `{r['model_id']}` {r['kind']}：{r.get('tiers')}"
                )
    lines.extend(["", "## 对内明细", ""])

    def _sec(title: str, items: list[dict], fmt) -> None:
        lines.append(f"### {title}（{len(items)}）")
        lines.append("")
        if not items:
            lines.append("（无）")
            lines.append("")
            return
        for r in items:
            lines.append(fmt(r))
        lines.append("")

    _sec("新增", diff["added"], lambda r: f"- `{r['model_id']}`（{r.get('modality')}）· {'/'.join(r.get('tiers') or ())}")
    _sec("下架", diff["removed"], lambda r: f"- `{r['model_id']}`（{r.get('modality')}）")
    _sec(
        "刊例变",
        diff["listing_changed"],
        lambda r: f"- `{r['model_id']}`：`{r['before']}` → `{r['after']}`",
    )
    _sec(
        "档位变",
        diff["tier_changed"],
        lambda r: f"- `{r['model_id']}`：{r['before']} → {r['after']}",
    )

    lines.extend(
        [
            "## 累积更新日志",
            "",
            "与对内册「更新」页同步（新→旧）。对外册不含本日志。",
            "",
        ]
    )
    if not changelog:
        lines.append("（尚无历史条目）")
        lines.append("")
    else:
        lines.append("| 日期 | 分类 | 更新说明 | 备注 |")
        lines.append("| --- | --- | --- | --- |")
        for ent in changelog[:80]:
            detail = (ent.get("detail") or "").replace("|", "\\|")
            note = (ent.get("note") or "").replace("|", "\\|")
            lines.append(
                f"| {ent.get('date') or ''} | {ent.get('category') or ''} "
                f"| {detail} | {note} |"
            )
        if len(changelog) > 80:
            lines.append(f"| … | | 另有 {len(changelog) - 80} 条见对内 xlsx「更新」 | |")
        lines.append("")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def _row_fill_for_change(mid: str, highlight_ids: set[str], fallback):
    if mid in highlight_ids:
        return FILL_CHANGE
    return fallback

SHEET_COMMERCIAL_MAIN = "10_商务总表-生文"
SHEET_COMMERCIAL_CROSS = "11_交叉模型-生文"
SHEET_IMAGE_MAIN = "20_商务总表-生图"
SHEET_IMAGE_CROSS = "21_交叉模型-生图"
SHEET_VIDEO_MAIN = "30_商务总表-生视频"
SHEET_VIDEO_CROSS = "31_交叉模型-生视频"
SHEET_RESOLUTION = "01_报价解析汇总"

IMAGE_VENDOR_ORDER = [
    "OpenAI",
    "Google",
    "Midjourney",
    "阿里云·通义",
    "腾讯·混元",
    "字节·即梦",
    "可灵",
    "Vidu",
    "其他",
]

VIDEO_VENDOR_ORDER = [
    "Google",
    "字节·即梦",
    "可灵",
    "MiniMax",
    "快手·可灵",
    "Vidu",
    "阿里云·通义",
    "腾讯·混元",
    "其他",
]

# 生图分辨率展示顺序
_IMAGE_SPEC_ORDER = {
    "1K以下": 0,
    "1K": 1,
    "2K": 2,
    "4K": 3,
    "标准": 10,
    "条件": 90,
}

# 本轮写回闸：只上浮这两款目录价（刊例策略 §3.1）；降价项仍用线上
CATALOG_OVERRIDES_USD: dict[str, tuple[float, float, float | None]] = {
    "hy-mt2-plus": (0.1, 0.4, None),
    "glm-5.2": (1.4, 4.4, 0.26),
}

VENDOR_CN = {
    "anthropic": "Anthropic",
    "openai": "OpenAI",
    "google": "Google",
    "google deepmind": "Google",
    "google deep mind": "Google",
    "deepmind": "Google",
    "deepseek": "DeepSeek",
    "moonshot": "月之暗面",
    "moonshot ai": "月之暗面",
    "minimax": "MiniMax",
    "zhipu": "智谱",
    "zhipu ai": "智谱",
    "智谱": "智谱",
    "tongyi": "阿里云·通义",
    "alibaba": "阿里云·通义",
    "tencent": "腾讯·混元",
    "hunyuan": "腾讯·混元",
    "豆包": "字节·豆包",
    "即梦": "字节·即梦",
    "jimeng": "字节·即梦",
    "seedance": "字节·即梦",
    "vidu": "Vidu",
    "kling": "可灵",
    "GPT": "OpenAI",
    "GK": "GK",
}

_CANON_VENDORS = {
    "OpenAI", "Anthropic", "Google", "DeepSeek", "月之暗面", "MiniMax", "智谱",
    "阿里云·通义", "腾讯·混元", "字节·豆包", "字节·即梦", "Midjourney", "可灵",
    "快手·可灵", "Vidu", "GK", "其他",
}

VENDOR_ORDER = [
    "OpenAI",
    "Anthropic",
    "Google",
    "DeepSeek",
    "月之暗面",
    "MiniMax",
    "智谱",
    "阿里云·通义",
    "腾讯·混元",
    "字节·豆包",
]

# 对外客户档（Standard=目录价列）：仅三档 ≥$5k / ≥$10k / ≥$50k（表头标「对外」）
# 对内商务仍为五档 $1k/$5k/$10k/$30k/$50k；对外折取商务 Mid/Growth/Enterprise
TIERS = [
    ("mid", "对外·≥$5k", 0),
    ("growth", "对外·≥$10k", 1),
    ("enterprise", "对外·≥$50k", 2),
]

# L3a 公开定折：折数如 8.5=八五折；顺序 = $5k / $10k / $50k（浅→深）
# 来源：定价方案-v0 §6；对客折底线 5.5；不直接抄 L3b 全五档
PUBLIC_FAMILY_TIERS: dict[float, list[float]] = {
    # ≤5 折：最深已拍（0.40→5.5；0.50→6.0）；取商务 Mid/Growth/Ent
    0.34: [6.2, 6.0, 5.5],
    0.40: [6.2, 6.0, 5.5],
    0.50: [6.8, 6.5, 6.0],
    0.55: [7.5, 7.0, 6.4],
    0.60: [8.2, 7.6, 6.7],
    0.64: [8.4, 8.1, 7.1],
    0.65: [8.5, 8.2, 7.2],
    0.70: [9.2, 8.8, 7.8],
    0.75: [9.0, 8.7, 8.2],
    0.85: [9.8, 9.7, 9.4],
}

# 单模覆盖（优先于成本族）
PUBLIC_MODEL_TIERS: dict[str, list[float]] = {
    "claude-opus-4-6": [9.5, 9.2, 8.8],
    # 供应侧多为 1.0，对外公开阶梯与 0.65 主锚对齐
    "gpt-5-nano": [8.5, 8.2, 7.2],
}

CLAUDE_OPUS_TIER_ZHE: list[float] = [9.5, 9.2, 8.8]
FAM_078浅折_TIER_ZHE: list[float] = [9.4, 9.2, 8.5]
_LIST_PRICE_ZHE = [10.0, 10.0, 10.0]


def public_tiers_for(model_id: str, fam: float | None) -> list[float | None] | None:
    """Return 3-tier zhe list ($5k/$10k/$50k) for L3a, or None if no public ladder."""
    if model_id in PUBLIC_MODEL_TIERS:
        return list(PUBLIC_MODEL_TIERS[model_id])
    # prefix match for versioned ids
    for mid, zhes in PUBLIC_MODEL_TIERS.items():
        if model_id == mid or model_id.startswith(mid + "-"):
            return list(zhes)
    # 未映射成本族：有刊例外发仍按原价（不用「—」）
    if fam is None:
        return list(_LIST_PRICE_ZHE)
    # 口径：Claude 只允许在成本族=1.0 时显示为原价；
    # 其它成本族的 Claude 全部使用与 opus-4-6 相同的公开折扣梯度。
    if str(model_id).startswith("claude-"):
        if abs(float(fam) - 1.0) < 1e-9:
            return list(_LIST_PRICE_ZHE)
        return list(CLAUDE_OPUS_TIER_ZHE)
    for k, zhes in PUBLIC_FAMILY_TIERS.items():
        if abs(float(fam) - k) < 1e-6:
            return list(zhes)
    # 0.78：如果模型没有更低折扣族可选，则给一个“浅折”公开梯度
    if abs(float(fam) - 0.78) < 1e-6:
        return list(FAM_078浅折_TIER_ZHE)
    # 1.0 及其它 ≥0.78 未进公开分族：对外标原价
    if fam >= 0.78:
        return list(_LIST_PRICE_ZHE)
    # 现网新成本折（<0.78 未冻结）：邻档线性插值，保证模型仍出报价
    interp = _interpolate_public_tiers(float(fam))
    print(
        f"[warn] public ladder: fam={fam} not frozen; interpolated {interp} "
        "(人审后写入 PUBLIC_FAMILY_TIERS)"
    )
    return interp


def _interpolate_public_tiers(fam: float) -> list[float]:
    keys = sorted(PUBLIC_FAMILY_TIERS)
    if not keys:
        return list(_LIST_PRICE_ZHE)
    if fam <= keys[0]:
        return list(PUBLIC_FAMILY_TIERS[keys[0]])
    if fam >= keys[-1]:
        return list(PUBLIC_FAMILY_TIERS[keys[-1]])
    lo = max(k for k in keys if k <= fam)
    hi = min(k for k in keys if k >= fam)
    if abs(hi - lo) < 1e-12:
        return list(PUBLIC_FAMILY_TIERS[lo])
    t = (fam - lo) / (hi - lo)
    a, b = PUBLIC_FAMILY_TIERS[lo], PUBLIC_FAMILY_TIERS[hi]
    return [round(a[i] + t * (b[i] - a[i]), 1) for i in range(3)]

def parse_usd(s):
    """Parse 入$x · 出$y · 缓$z → (in, out, cache|None)."""
    if not s or s == "—":
        return None
    m = re.search(
        r"入\s*\$([\d.]+)\s*·\s*出\s*\$([\d.]+)(?:\s*·\s*缓\s*\$([\d.]+))?",
        str(s),
    )
    if not m:
        return None
    cache = float(m.group(3)) if m.group(3) else None
    return float(m.group(1)), float(m.group(2)), cache


def ceil_money_2(v: float | None) -> float | None:
    """对外金额：最多两位小数；第 3 位起有数则向上进到分。

    例：0.615→0.62，0.610→0.61，1.2→1.2，2→2
    """
    if v is None:
        return None
    x = float(v)
    if not math.isfinite(x):
        return None
    # 浮点误差：略小于整分时不误进
    scaled = x * 100.0
    if abs(scaled - round(scaled)) < 1e-9:
        return round(scaled) / 100.0
    return math.ceil(scaled - 1e-12) / 100.0


def fmt_num(v: float) -> str:
    """对外展示固定两位小数（已 ceil 进位）。"""
    x = ceil_money_2(v)
    if x is None:
        return "—"
    return f"{x:.2f}"


def fmt_cache(v: float | None) -> str:
    if v is None:
        return "—"
    return fmt_num(v)


def fmt_tier_zhe(zhe: float | None) -> str:
    """阶梯列只展示对客折：如 8.5折 / 原价（入出同折，不写绝对价）。"""
    if zhe is None:
        return "—"
    if zhe >= 9.999:
        return "原价"
    zhe_s = (
        f"{zhe:.1f}".rstrip("0").rstrip(".")
        if abs(zhe - round(zhe)) > 1e-9
        else str(int(round(zhe)))
    )
    return f"{zhe_s}折"


def parse_zhe_cell(val) -> float | None:
    """Parse '9.0（GM 28%）' / '原价（GM 25%）' / '—' → 折数 or 10.0 or None."""
    if val is None:
        return None
    s = str(val).strip()
    if not s or s == "—" or s == "-":
        return None
    if s.startswith("原价"):
        return 10.0
    m = re.match(r"([\d.]+)", s)
    if not m:
        return None
    return float(m.group(1))


def parse_family_key(label: str) -> float | None:
    m = re.match(r"(0\.\d+|1\.0)", str(label))
    return float(m.group(1)) if m else None


def _ingest_commercial_pair(
    wb,
    main_sheet: str,
    cross_sheet: str,
    family_tiers: dict[float, list[float | None]],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
    required: bool = True,
) -> int:
    """Parse one 商务总表 + 交叉模型 pair into shared maps. Returns model count added."""
    if main_sheet not in wb.sheetnames:
        if required:
            raise ValueError(
                f"{SRC_COMMERCIAL.name} 缺少 {main_sheet}；"
                "请先跑 rebuild_discount_tier_workbook.py"
            )
        return 0
    # 占位页（待补）跳过
    a1 = str(wb[main_sheet]["A1"].value or "")
    if "待补" in a1:
        return 0

    before = len(model_families)
    ws = wb[main_sheet]
    for row in ws.iter_rows(min_row=2, max_row=20, max_col=11, values_only=True):
        if not row[0]:
            continue
        fam = parse_family_key(row[0])
        if fam is None:
            continue
        tiers = [parse_zhe_cell(row[i]) for i in range(1, 6)]
        family_tiers.setdefault(fam, tiers)
        models_cell = row[8]
        if not models_cell or str(models_cell).strip() in ("（待补）", "—", "-"):
            continue
        for part in re.split(r"[；;\n]+", str(models_cell)):
            part = part.strip()
            if not part:
                continue
            mid = part.split("：")[0].split(":")[0].strip().rstrip("※").strip()
            if not mid:
                continue
            model_families.setdefault(mid, [])
            if fam not in model_families[mid]:
                model_families[mid].append(fam)

    if cross_sheet in wb.sheetnames and "待补" not in str(wb[cross_sheet]["A1"].value or ""):
        ws2 = wb[cross_sheet]
        header_row = None
        rec_col = None
        for r in range(1, 6):
            for c in range(1, ws2.max_column + 1):
                if str(ws2.cell(r, c).value or "").strip() == "推荐成本折":
                    header_row = r
                    rec_col = c
                    break
            if rec_col:
                break
        if rec_col is not None:
            for r in range(header_row + 1, ws2.max_row + 1):
                mid = ws2.cell(r, 1).value
                rec = ws2.cell(r, rec_col).value
                if not mid or rec in (None, ""):
                    continue
                try:
                    recommended[str(mid).strip()] = float(rec)
                except (TypeError, ValueError):
                    continue
    return len(model_families) - before


def load_commercial():
    """Return family_tiers, model_family[id], recommended（10/11+20/21+30/31）。"""
    if not SRC_COMMERCIAL.exists():
        raise FileNotFoundError(f"商务表缺失: {SRC_COMMERCIAL}")
    wb = openpyxl.load_workbook(SRC_COMMERCIAL, data_only=True)
    family_tiers: dict[float, list[float | None]] = {}
    model_families: dict[str, list[float]] = {}
    recommended: dict[str, float] = {}

    n_text = _ingest_commercial_pair(
        wb,
        SHEET_COMMERCIAL_MAIN,
        SHEET_COMMERCIAL_CROSS,
        family_tiers,
        model_families,
        recommended,
        required=True,
    )
    n_img = _ingest_commercial_pair(
        wb,
        SHEET_IMAGE_MAIN,
        SHEET_IMAGE_CROSS,
        family_tiers,
        model_families,
        recommended,
        required=False,
    )
    n_vid = _ingest_commercial_pair(
        wb,
        SHEET_VIDEO_MAIN,
        SHEET_VIDEO_CROSS,
        family_tiers,
        model_families,
        recommended,
        required=False,
    )

    print(
        f"commercial {SRC_COMMERCIAL.name}: "
        f"models={len(model_families)} (+text≈{n_text} +image≈{n_img} +video≈{n_vid}) "
        f"families={sorted(family_tiers)} recommended={len(recommended)}"
    )
    return family_tiers, model_families, recommended


def resolve_family(
    model_id: str,
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> float | None:
    # 低于 2 折（成本折 < 0.2）= 特殊线路，不参与对外阶梯依据
    _min_fam = 0.2

    def _ok(f: float | None) -> bool:
        return f is not None and float(f) >= _min_fam

    if model_id in recommended and _ok(recommended[model_id]):
        return recommended[model_id]
    fams = model_families.get(model_id) or []
    usable = [f for f in fams if _ok(f)]
    if not usable:
        return None
    # 厚利优先：成本折数字越小越优先（已排除特殊深折）
    return min(usable)


def _num_amount(block) -> float | None:
    if not isinstance(block, dict):
        return None
    try:
        return float(block.get("amount"))
    except (TypeError, ValueError):
        return None


def _online_default_prices(entry: dict) -> tuple[float, float, float | None] | None:
    """Take first usable default / short-context tier from /v1/prices entry.

    Supports legacy ``default`` groups and ``token_kind`` + ranges
    (context_length_range / usage_token_range).
    """
    groups = entry.get("price_groups") or []

    # 1) legacy / flat: prices.input + prices.output on a group
    ranked = []
    for g in groups:
        prices = g.get("prices") or {}
        inp = _num_amount(prices.get("input"))
        out = _num_amount(prices.get("output"))
        if inp is None or out is None:
            continue
        cache = _num_amount(prices.get("cache")) or _num_amount(
            prices.get("cached_input")
        )
        label = str(g.get("label") or g.get("conditions_summary") or "")
        demote = 1 if re.search(r">\s*272|>\s*262|长上下文|long", label, re.I) else 0
        ranked.append((demote, g.get("type") != "default", inp, out, cache))
    if ranked:
        ranked.sort(key=lambda x: (x[0], x[1]))
        _, _, inp, out, cache = ranked[0]
        return inp, out, cache

    # 2) token_kind ranges (GPT-5.x / Gemini pro / GLM / Qwen 分档)
    def _kind(kind: str):
        return next(
            (
                g
                for g in groups
                if g.get("type") == "token_kind" and g.get("token_kind") == kind
            ),
            None,
        )

    input_g = _kind("input")
    out_g = _kind("output")
    cache_g = _kind("cached_input") or _kind("cache")
    ranges = (input_g or {}).get("ranges") or []
    if not ranges:
        return None

    def range_score(r: dict) -> tuple[int, float]:
        label = str(
            (r.get("range") or {}).get("display_short")
            or (r.get("range") or {}).get("display")
            or ""
        )
        demote = 1 if re.search(r"^>|长|long", label, re.I) else 0
        mn = (r.get("range") or {}).get("min")
        try:
            min_v = float(mn) if mn is not None else 0.0
        except (TypeError, ValueError):
            min_v = 0.0
        return demote, min_v

    order = sorted(range(len(ranges)), key=lambda i: range_score(ranges[i]))
    i = order[0]
    inp = _num_amount((ranges[i].get("price") or {}))
    out_ranges = (out_g or {}).get("ranges") or []
    cache_ranges = (cache_g or {}).get("ranges") or []
    out = _num_amount((out_ranges[i].get("price") or {})) if i < len(out_ranges) else None
    cache = (
        _num_amount((cache_ranges[i].get("price") or {}))
        if i < len(cache_ranges)
        else None
    )
    if inp is None or out is None:
        return None
    return inp, out, cache


def canon_vendor(name: str, *, modality: str = "text") -> str:
    """同一品牌只留一个标签，避免 Tongyi / 阿里云·通义、Google DeepMind / Google 拆成两块。"""
    raw = (name or "").strip()
    if not raw:
        return "其他"
    if raw in _CANON_VENDORS:
        if raw == "字节·豆包" and modality in ("image", "video"):
            return "字节·即梦"
        if raw == "字节·即梦" and modality == "text":
            return "字节·豆包"
        return raw
    mapped = VENDOR_CN.get(raw) or VENDOR_CN.get(raw.lower())
    if mapped and mapped != raw:
        return canon_vendor(mapped, modality=modality)
    return raw


def _vendor_rank(vendor: str, order: dict[str, int]) -> tuple:
    if vendor in order:
        return (0, order[vendor], "")
    if vendor == "其他":
        return (2, 0, "")
    return (1, 0, vendor)


def _deep_public_zhe(
    model_id: str,
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> float:
    fam = resolve_family(model_id, model_families, recommended)
    zhes = public_tiers_for(model_id, fam) or []
    nums = [z for z in zhes if z is not None]
    return min(nums) if nums else 10.0


def _guess_vendor(model_id: str, display_name: str = "") -> str:
    mid = (model_id or "").lower()
    name = (display_name or "").lower()
    if mid.startswith("gpt-") or mid.startswith("o1") or mid.startswith("o3"):
        return "OpenAI"
    if mid.startswith("claude") or "anthropic" in name:
        return "Anthropic"
    if mid.startswith("gemini") or "google" in name:
        return "Google"
    if mid.startswith("deepseek"):
        return "DeepSeek"
    if mid.startswith("kimi") or "moonshot" in name:
        return "月之暗面"
    if mid.startswith("minimax"):
        return "MiniMax"
    if mid.startswith("glm") or "智谱" in name or "zhipu" in name:
        return "智谱"
    if mid.startswith("qwen"):
        return "阿里云·通义"
    if mid.startswith("hy") or mid.startswith("hunyuan"):
        return "腾讯·混元"
    if mid.startswith("doubao") or "豆包" in name:
        return "字节·豆包"
    if mid.startswith("grok"):
        return "GK"
    return "其他"


def _guess_vendor_image(model_id: str, display_name: str = "") -> str:
    mid = (model_id or "").lower()
    name = (display_name or "").lower()
    if mid.startswith("gpt-") or mid.startswith("og-image") or "image-2" in name:
        return "OpenAI"
    if mid.startswith("gemini") or mid.startswith("gg-") or "nano" in name:
        return "Google"
    if mid.startswith("mj") or "midjourney" in name:
        return "Midjourney"
    if mid.startswith("qwen"):
        return "阿里云·通义"
    if mid.startswith("hunyuan") or mid.startswith("hy"):
        return "腾讯·混元"
    if mid.startswith("jimeng") or mid.startswith("si-") or "seedream" in name:
        return "字节·即梦"
    if mid.startswith("kling"):
        return "可灵"
    if mid.startswith("vidu"):
        return "Vidu"
    return "其他"


def _norm_image_spec(label: str) -> str:
    s = str(label or "").strip()
    sl = s.lower().replace(" ", "")
    if sl in ("lt_1k", "lt1k", "<1k", "sub1k") or "1k以下" in s:
        return "1K以下"
    if re.fullmatch(r"1k", sl) or s in ("1K", "1k"):
        return "1K"
    if re.fullmatch(r"2k", sl) or s in ("2K", "2k"):
        return "2K"
    if re.fullmatch(r"4k", sl) or s in ("4K", "4k"):
        return "4K"
    if "条件" in s:
        return "条件"
    if not s or s in ("标准计价", "标准价", "default"):
        return "标准"
    return s


def load_image_rows() -> list[dict]:
    """生图：线上 /v1/prices image；按张分分辨率行，按 token 则一行汇总目录价。"""
    if not SRC_ONLINE_IMAGE.exists():
        raise FileNotFoundError(f"missing online image prices: {SRC_ONLINE_IMAGE}")
    raw = json.loads(SRC_ONLINE_IMAGE.read_text(encoding="utf-8"))
    entries = raw.get("data") or raw.get("models") or []
    rows: list[dict] = []
    for e in entries:
        mid = str(e.get("model") or e.get("id") or "").strip()
        if not mid:
            continue
        display = str(e.get("display_name") or mid).strip()
        vendor = canon_vendor(_guess_vendor_image(mid, display), modality="image")
        charge = str(e.get("charge_unit") or "")
        groups = e.get("price_groups") or []

        if charge == "image_count" or str(e.get("price_unit") or "") == "per_image":
            seen: set[tuple[str, float]] = set()
            for g in groups:
                prices = g.get("prices") or {}
                unit_block = prices.get("unit") or prices.get("image") or {}
                amt = _num_amount(unit_block)
                if amt is None:
                    continue
                spec = _norm_image_spec(
                    g.get("label") or g.get("type") or g.get("conditions_summary") or ""
                )
                key = (spec, round(amt, 6))
                if key in seen:
                    continue
                seen.add(key)
                rows.append(
                    {
                        "vendor": vendor,
                        "model_id": mid,
                        "display": display,
                        "spec": spec,
                        "unit": "USD/张",
                        "catalog": ceil_money_2(amt),
                        "catalog_display": None,
                    }
                )
        else:
            # token 生图：一行列出入/出/缓
            prices = _online_default_prices(e)
            if not prices:
                continue
            inp, outp, cache = prices
            parts = [f"入 {fmt_num(inp)}", f"出 {fmt_num(outp)}"]
            if cache is not None:
                parts.append(f"缓 {fmt_num(cache)}")
            rows.append(
                {
                    "vendor": vendor,
                    "model_id": mid,
                    "display": display,
                    "spec": "标准",
                    "unit": "USD/百万 tokens",
                    "catalog": ceil_money_2(inp),
                    "catalog_display": " · ".join(parts),
                }
            )

    order = {v: i for i, v in enumerate(IMAGE_VENDOR_ORDER)}

    def sort_key(r: dict):
        return (
            order.get(r["vendor"], 99),
            r["model_id"],
            _IMAGE_SPEC_ORDER.get(r["spec"], 50),
            r["spec"],
        )

    rows.sort(key=sort_key)
    return rows


def is_internal_only_sku(model_id: str) -> bool:
    """对内 SKU：id 以 -discount 结尾（如 gpt-image-2-discount），不进对外折扣报价。"""
    return str(model_id or "").strip().lower().endswith("-discount")


def has_public_ladder(
    model_id: str,
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> bool:
    fam = resolve_family(model_id, model_families, recommended)
    zhes = public_tiers_for(model_id, fam)
    return bool(zhes and any(z is not None and z < 9.999 for z in zhes))


def _dedupe_models_by_id(rows: list[dict]) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for r in rows:
        mid = r["model_id"]
        if mid in seen:
            continue
        seen.add(mid)
        out.append(r)
    return out


def _listing_cols_for_overview(mod: str, m: dict) -> tuple[str, str, str]:
    """对外折扣一览刊例三列（与 01 生文表头对齐）；图/视频多规格时输入列给摘要。"""
    if mod == "生文":
        return (
            fmt_num(m.get("inp")),
            fmt_num(m.get("out")),
            fmt_cache(m.get("cache")),
        )
    # 生图/生视频：token 汇总或代表价放「输入」；出/缓无则 —
    disp = m.get("catalog_display")
    if disp:
        return (str(disp), "—", "—")
    cat = m.get("catalog")
    unit = str(m.get("unit") or "")
    spec = str(m.get("spec") or "")
    if cat is not None:
        label = fmt_num(cat)
        if unit or spec:
            label = f"{label}" + (f"（{spec}）" if spec else "")
        return (label, "—", "—")
    return ("—", "—", "—")


def collect_discounted_models(
    models: list[dict],
    image_rows: list[dict],
    video_rows: list[dict],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> list[dict]:
    """有公开用量折扣的模型一览（原价不进）；按模态→厂商→最深折。不含成本族。"""
    modality_items = (
        ("生文", models),
        ("生图", _dedupe_models_by_id(image_rows)),
        ("生视频", _dedupe_models_by_id(video_rows)),
    )
    rows: list[dict] = []
    for mod, items in modality_items:
        for m in items:
            mid = m["model_id"]
            if is_internal_only_sku(mid):
                continue
            if not has_public_ladder(mid, model_families, recommended):
                continue
            fam = resolve_family(mid, model_families, recommended)
            zhes = public_tiers_for(mid, fam) or [None, None, None]
            deep = min((z for z in zhes if z is not None), default=10.0)
            inp, outp, cache = _listing_cols_for_overview(mod, m)
            rows.append(
                {
                    "modality": mod,
                    "vendor": m.get("vendor") or "",
                    "model_id": mid,
                    "display": m.get("display") or mid,
                    "inp": inp,
                    "out": outp,
                    "cache": cache,
                    "zhes": zhes,
                    "deep": deep,
                }
            )
    mod_order = {"生文": 0, "生图": 1, "生视频": 2}
    vendor_orders = {
        "生文": {v: i for i, v in enumerate(VENDOR_ORDER)},
        "生图": {v: i for i, v in enumerate(IMAGE_VENDOR_ORDER)},
        "生视频": {v: i for i, v in enumerate(VIDEO_VENDOR_ORDER)},
    }
    rows.sort(
        key=lambda r: (
            mod_order.get(r["modality"], 9),
            _vendor_rank(r["vendor"], vendor_orders.get(r["modality"], {})),
            r["deep"],
            r["model_id"],
        )
    )
    return rows


DISCOUNT_TITLE = "Trinity · 折扣报价表"


def _discount_overview_headers() -> list[str]:
    return [
        "模态",
        "厂商",
        "模型 ID",
        "显示名",
        "刊例价·输入",
        "刊例价·输出",
        "刊例价·缓存",
    ] + [label for _, label, _ in TIERS]


def _write_discount_title_row(ws, *, row: int, n_cols: int) -> None:
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=n_cols)
    cell = ws.cell(row, 1, DISCOUNT_TITLE)
    cell.font = Font(name="PingFang SC", size=16, bold=True, color="1D2939")
    ws.row_dimensions[row].height = 26


def _fill_discount_overview_table(
    ws,
    discount_rows: list[dict],
    *,
    header_row: int,
    data_start: int,
    thin,
    white_bold,
    body_font,
    num_font,
    center,
    left,
    highlight_ids: set[str] | None = None,
) -> None:
    fills = {
        "生文": solid_fill("DBEAFE"),
        "生图": solid_fill("FEF3C7"),
        "生视频": solid_fill("D1FAE5"),
    }
    highlight_ids = highlight_ids or set()
    header_fill = solid_fill("1B4F72")
    headers = _discount_overview_headers()
    for i, h in enumerate(headers, 1):
        cell = ws.cell(header_row, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
    ws.row_dimensions[header_row].height = 24

    for idx, row in enumerate(discount_rows):
        r = data_start + idx
        fill = _row_fill_for_change(
            row["model_id"], highlight_ids, fills.get(row["modality"])
        )
        zhes = row["zhes"]
        vals = [
            row["modality"],
            row["vendor"],
            row["model_id"],
            row["display"],
            row["inp"],
            row["out"],
            row["cache"],
        ]
        for ti in range(len(TIERS)):
            vals.append(fmt_tier_zhe(zhes[ti] if ti < len(zhes) else None))
        for c, v in enumerate(vals, 1):
            cell = ws.cell(r, c, v)
            style_cell(
                cell,
                font=num_font if c >= 5 else body_font,
                align=center if c == 1 or c >= 5 else left,
                border=thin,
                fill=fill,
            )

    def _merge_runs(col: int, keys: list) -> None:
        i = 0
        n = len(keys)
        while i < n:
            j = i + 1
            while j < n and keys[j] == keys[i]:
                j += 1
            if j - i > 1:
                ws.merge_cells(
                    start_row=data_start + i,
                    start_column=col,
                    end_row=data_start + j - 1,
                    end_column=col,
                )
                top = ws.cell(data_start + i, col)
                top.alignment = Alignment(
                    horizontal="center", vertical="center", wrap_text=True
                )
            i = j

    _merge_runs(1, [r["modality"] for r in discount_rows])
    _merge_runs(2, [(r["modality"], r["vendor"]) for r in discount_rows])

    for i, w in enumerate([8, 12, 26, 22, 14, 14, 12] + [14] * len(TIERS), 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = f"H{data_start}"


def write_discount_overview_sheet(
    wb,
    discount_rows: list[dict],
    *,
    valid_until: str,
    thin,
    white_bold,
    body_font,
    num_font,
    center,
    left,
    highlight_ids: set[str] | None = None,
) -> None:
    """00_折扣一览（整本 L3a 内）：标题 + 说明 + 表头 + 仅有折扣模型。"""
    name = "00_折扣一览"
    if name in wb.sheetnames:
        del wb[name]
    ws = wb.create_sheet(name, 0)
    n_cols = len(_discount_overview_headers())
    _write_discount_title_row(ws, row=1, n_cols=n_cols)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=n_cols)
    counts = {
        m: sum(1 for r in discount_rows if r["modality"] == m)
        for m in ("生文", "生图", "生视频")
    }
    n_hl = len(highlight_ids or set())
    ws["A2"] = (
        f"有效期：{valid_until}　|　共 {len(discount_rows)} 款有折扣"
        f"（生文 {counts['生文']} · 生图 {counts['生图']} · 生视频 {counts['生视频']}）。"
        "底色：生文蓝 · 生图琥珀 · 生视频绿；"
        f"浅黄 = 相对上版新增或变更（本轮标黄 {n_hl} 款，详见「{SHEET_CHANGE}」）。"
        "表头与分册一致（+模态）；不含成本/线路。"
        "图/视频多规格刊例见 02/03；达档=企业户累积消耗（按刊例价计）。"
    )
    ws["A2"].font = Font(name="PingFang SC", size=10, color="475467")
    ws["A2"].alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[2].height = 44
    _fill_discount_overview_table(
        ws,
        discount_rows,
        header_row=4,
        data_start=5,
        thin=thin,
        white_bold=white_bold,
        body_font=body_font,
        num_font=num_font,
        center=center,
        left=left,
        highlight_ids=highlight_ids,
    )
    print(
        f"discount overview: {len(discount_rows)} models "
        f"(text={counts['生文']} image={counts['生图']} video={counts['生视频']})"
    )


def write_discount_only_workbook(
    path: Path,
    discount_rows: list[dict],
    *,
    thin,
    white_bold,
    body_font,
    num_font,
    center,
    left,
) -> None:
    """单独外发册：标题 + 表头 + 仅有折扣表；无说明行。"""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "仅有折扣"
    n_cols = len(_discount_overview_headers())
    _write_discount_title_row(ws, row=1, n_cols=n_cols)
    _fill_discount_overview_table(
        ws,
        discount_rows,
        header_row=2,
        data_start=3,
        thin=thin,
        white_bold=white_bold,
        body_font=body_font,
        num_font=num_font,
        center=center,
        left=left,
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)
    patch_xlsx_for_wechat(path)
    print(f"wrote {path} sheets={wb.sheetnames} rows={len(discount_rows)}")


def sort_image_rows_discount_first(
    rows: list[dict],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> list[dict]:
    """全局折扣优先；同折扣深度内再按厂商与规格排序。"""
    order = {v: i for i, v in enumerate(IMAGE_VENDOR_ORDER)}

    def sort_key(r: dict):
        mid = r["model_id"]
        return (
            _deep_public_zhe(mid, model_families, recommended),
            _vendor_rank(r["vendor"], order),
            r["model_id"],
            _IMAGE_SPEC_ORDER.get(r["spec"], 50),
            r["spec"],
        )

    return sorted(rows, key=sort_key)


def _guess_vendor_video(model_id: str, display_name: str = "") -> str:
    mid = (model_id or "").lower()
    name = (display_name or "").lower()
    if mid.startswith("gemini") or mid.startswith("gv-") or mid.startswith("veo"):
        return "Google"
    if mid.startswith("seedance") or mid.startswith("jimeng") or mid.startswith("jv-"):
        return "字节·即梦"
    if mid.startswith("kling"):
        return "可灵"
    if mid.startswith("hailuo") or mid.startswith("minimax") or mid.startswith("h2"):
        return "MiniMax"
    if mid.startswith("happyhorse"):
        return "其他"
    if mid.startswith("vidu"):
        return "Vidu"
    if mid.startswith("wan") or mid.startswith("os-"):
        return "阿里云·通义"
    if mid.startswith("pixverse"):
        return "其他"
    if "hunyuan" in mid or mid.startswith("hy"):
        return "腾讯·混元"
    return "其他"


def _norm_video_spec(label: str) -> str:
    s = str(label or "").strip()
    if not s:
        return "标准"
    sl = s.lower().replace(" ", "")
    for key in ("4k", "1080p", "720p", "768p", "480p", "540p"):
        if key in sl:
            return key.upper() if key == "4k" else key
    if "输入" in s or "input" in sl:
        return "输入"
    if "视频输出" in s or "output_video" in sl or "video" in sl and "输出" in s:
        return "视频输出"
    if "文本" in s or "output_text" in sl or "思考" in s:
        return "文本/思考输出"
    return s[:24]


_VIDEO_SPEC_ORDER = {
    "输入": 0,
    "文本/思考输出": 1,
    "视频输出": 2,
    "480p": 10,
    "540p": 11,
    "720p": 12,
    "768p": 13,
    "1080p": 14,
    "4K": 15,
    "标准": 20,
}


def load_video_rows() -> list[dict]:
    """生视频：线上刊例；按分辨率/token 种类分行。"""
    if not SRC_ONLINE_VIDEO.exists():
        raise FileNotFoundError(f"missing online video prices: {SRC_ONLINE_VIDEO}")
    raw = json.loads(SRC_ONLINE_VIDEO.read_text(encoding="utf-8"))
    entries = raw.get("data") or raw.get("models") or []
    rows: list[dict] = []
    for e in entries:
        mid = str(e.get("model") or e.get("id") or "").strip()
        if not mid:
            continue
        display = str(e.get("display_name") or mid).strip()
        vendor = canon_vendor(_guess_vendor_video(mid, display), modality="video")
        charge = str(e.get("charge_unit") or "")
        groups = e.get("price_groups") or []
        seen: set[tuple[str, str, float]] = set()

        for g in groups:
            prices = g.get("prices") or {}
            # unit / per-second / per-resolution
            unit_block = prices.get("unit") or prices.get("video") or {}
            amt = _num_amount(unit_block)
            kind = None
            catalog_display = None
            if amt is None:
                for k in ("input", "output_text", "output_video", "output"):
                    if k in prices:
                        amt = _num_amount(prices.get(k))
                        kind = k
                        break
            if amt is None and (
                "start" in prices or "per_second_after" in prices or "examples" in prices
            ):
                start_amt = _num_amount(prices.get("start"))
                after_amt = _num_amount(prices.get("per_second_after"))
                ex = prices.get("examples") or {}
                ex5_amt = _num_amount(ex.get("5s"))
                ex10_amt = _num_amount(ex.get("10s"))
                if start_amt is not None and after_amt is not None:
                    amt = ex5_amt if ex5_amt is not None else start_amt
                    parts = [f"首秒 {fmt_num(start_amt)}", f"续秒 {fmt_num(after_amt)}/秒"]
                    if ex5_amt is not None:
                        parts.append(f"5s示例 {fmt_num(ex5_amt)}")
                    if ex10_amt is not None:
                        parts.append(f"10s示例 {fmt_num(ex10_amt)}")
                    catalog_display = " + ".join(parts)
            if amt is None:
                continue
            label = g.get("label") or g.get("type") or g.get("conditions_summary") or ""
            if kind == "input":
                spec = "输入"
            elif kind == "output_text":
                spec = "文本/思考输出"
            elif kind == "output_video":
                spec = "视频输出"
            else:
                spec = _norm_video_spec(str(label))
            key = (spec, charge, round(float(amt), 6))
            if key in seen:
                continue
            seen.add(key)
            if charge == "video_token" and kind:
                unit = "USD/百万 video tokens"
            elif charge == "video_token":
                unit = "USD/百万 video tokens"
            elif catalog_display:
                unit = "USD/首秒+续秒"
            else:
                unit = "USD/秒"
            rows.append(
                {
                    "vendor": vendor,
                    "model_id": mid,
                    "display": display,
                    "spec": spec,
                    "unit": unit,
                    "catalog": ceil_money_2(float(amt)),
                    "catalog_display": catalog_display,
                }
            )

    order = {v: i for i, v in enumerate(VIDEO_VENDOR_ORDER)}

    def sort_key(r: dict):
        return (
            order.get(r["vendor"], 99),
            r["model_id"],
            _VIDEO_SPEC_ORDER.get(r["spec"], 50),
            r["spec"],
        )

    rows.sort(key=sort_key)
    return rows


def sort_video_rows_discount_first(
    rows: list[dict],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> list[dict]:
    order = {v: i for i, v in enumerate(VIDEO_VENDOR_ORDER)}

    def sort_key(r: dict):
        mid = r["model_id"]
        return (
            _deep_public_zhe(mid, model_families, recommended),
            _vendor_rank(r["vendor"], order),
            r["model_id"],
            _VIDEO_SPEC_ORDER.get(r["spec"], 50),
            r["spec"],
        )

    return sorted(rows, key=sort_key)


def load_compare_meta() -> dict[str, dict]:
    """Trinity ID → vendor/display from 刊例对比（可选 enrichment）。"""
    if not SRC_PRICES.exists():
        return {}
    wb = openpyxl.load_workbook(SRC_PRICES, data_only=True)
    if "刊例对比校验-生文" not in wb.sheetnames:
        return {}
    ws = wb["刊例对比校验-生文"]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return {}
    header = [str(h or "").strip() for h in rows[0]]
    try:
        i_tid = header.index("Trinity ID")
        i_name = header.index("显示名")
        i_brand = header.index("厂商")
    except ValueError:
        return {}
    meta: dict[str, dict] = {}
    for r in rows[1:]:
        if not r or not r[i_tid] or r[i_tid] in ("—", "-"):
            continue
        tid = str(r[i_tid]).strip()
        if tid in meta:
            continue
        brand = str(r[i_brand] or "").strip()
        meta[tid] = {
            "display": str(r[i_name] or tid).strip(),
            "vendor": canon_vendor(VENDOR_CN.get(brand, brand) or "其他", modality="text"),
        }
    return meta


def load_models():
    """目录价主源 = 线上 /v1/prices（全量上架）；一张模型一行（取短上下文/默认档）。"""
    if not SRC_ONLINE.exists():
        raise FileNotFoundError(f"missing online prices: {SRC_ONLINE}")
    raw = json.loads(SRC_ONLINE.read_text(encoding="utf-8"))
    entries = raw.get("data") or raw.get("models") or []
    meta = load_compare_meta()
    out = []
    for e in entries:
        mid = str(e.get("model") or e.get("id") or "").strip()
        if not mid:
            continue
        prices = _online_default_prices(e)
        if not prices:
            continue
        inp, outp, cache = prices
        if mid in CATALOG_OVERRIDES_USD:
            oi, oo, oc = CATALOG_OVERRIDES_USD[mid]
            inp, outp = oi, oo
            if oc is not None:
                cache = oc
        m = meta.get(mid, {})
        display = m.get("display") or e.get("display_name") or mid
        vendor = canon_vendor(m.get("vendor") or _guess_vendor(mid, display), modality="text")
        out.append(
            {
                "vendor": vendor,
                "model_id": mid,
                "display": display,
                "tier": "",
                "inp": ceil_money_2(inp),
                "out": ceil_money_2(outp),
                "cache": ceil_money_2(cache),
            }
        )
    order = {v: i for i, v in enumerate(VENDOR_ORDER)}
    out.sort(key=lambda m: (order.get(m["vendor"], 99), m["model_id"]))
    return out


def style_cell(cell, *, fill=None, font=None, align=None, border=None):
    if fill:
        cell.fill = fill
    if font:
        cell.font = font
    if align:
        cell.alignment = align
    if border:
        cell.border = border


def _sheet_styles():
    thin = Border(
        left=Side(style="thin", color="E4E7EC"),
        right=Side(style="thin", color="E4E7EC"),
        top=Side(style="thin", color="E4E7EC"),
        bottom=Side(style="thin", color="E4E7EC"),
    )
    return {
        "thin": thin,
        "header_fill": solid_fill("1B4F72"),
        "alt": solid_fill("F8FAFC"),
        "body_font": Font(name="PingFang SC", size=10),
        "num_font": Font(name="Menlo", size=9),
        "white_bold": Font(name="PingFang SC", size=10, bold=True, color="FFFFFF"),
        "center": Alignment(horizontal="center", vertical="center", wrap_text=True),
        "left": Alignment(horizontal="left", vertical="center"),
    }


def ladder_source_label(
    model_id: str,
    fam: float | None,
    recommended: dict[str, float],
) -> str:
    if str(model_id).startswith("claude-") and (
        fam is None or abs(float(fam) - 1.0) > 1e-9
    ):
        src = "Claude对齐opus阶梯"
    elif model_id == "gpt-5-nano" or model_id.startswith("gpt-5-nano-"):
        src = "单模对齐0.65公开阶梯"
    elif model_id in PUBLIC_MODEL_TIERS or any(
        model_id == mid or model_id.startswith(mid + "-")
        for mid in PUBLIC_MODEL_TIERS
    ):
        src = "单模特例"
    elif fam in PUBLIC_FAMILY_TIERS:
        src = f"公开族 {fam}"
    elif fam is not None and abs(float(fam) - 0.78) < 1e-6:
        src = "0.78浅折"
    elif fam is not None and abs(float(fam) - 1.0) < 1e-9:
        src = "1.0→原价"
    elif fam is not None and fam >= 0.78:
        src = "≥0.78→原价"
    elif fam is not None:
        src = "族未进公开矩阵"
    else:
        src = "未映射→原价"
    if model_id in recommended:
        return f"{src}（02推荐）"
    if fam is not None and not src.startswith("未映射"):
        return f"{src}（01归属）"
    return src


def _parse_cost_ratios(cost_cell) -> list[float]:
    ratios: list[float] = []
    if not cost_cell:
        return ratios
    for m in re.finditer(r"官方\s*([\d.]+)\s*/\s*成本\s*([\d.]+)", str(cost_cell)):
        o, c = float(m.group(1)), float(m.group(2))
        if o > 0:
            ratios.append(c / o)
    return ratios


def scan_route_lines() -> list[dict]:
    """扫描生文+生图+生视频线路源：启用+停用，含成本/官方比。"""
    rows: list[dict] = []
    for root, tag in (
        (ROUTES_TEXT, "text"),
        (ROUTES_IMAGE, "image"),
        (ROUTES_VIDEO, "video"),
    ):
        if not root.exists():
            continue
        for path in sorted(root.glob("*.xlsx")):
            if path.name.startswith("~") or path.name.lower() == "readme.md":
                continue
            wb = openpyxl.load_workbook(path, data_only=True)
            if "线路管理" not in wb.sheetnames:
                continue
            ws = wb["线路管理"]
            cur = None
            for r in range(2, ws.max_row + 1):
                mid = ws.cell(r, 1).value
                if mid:
                    cur = str(mid).strip()
                if not cur:
                    continue
                route = ws.cell(r, 4).value
                if not mid and not route and not ws.cell(r, 9).value:
                    continue
                disc = ws.cell(r, 9).value
                en = ws.cell(r, 11).value
                cost = ws.cell(r, 12).value
                ratios = _parse_cost_ratios(cost)
                if not mid and not route:
                    continue
                rows.append(
                    {
                        "source": f"{tag}/{path.name}",
                        "modality": tag,
                        "model_id": cur,
                        "route": str(route or "").strip(),
                        "discount": disc,
                        "status": str(en or "").strip(),
                        "min_ratio": min(ratios) if ratios else None,
                        "ratios": ratios,
                    }
                )
    return rows


def write_price_resolution_sheet(
    wb,
    meta: list[tuple[str, str]],
    models: list[dict],
    image_rows: list[dict],
    video_rows: list[dict],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> None:
    """01_报价解析汇总：对外阶梯依据（含停用更低进价；吸收原 90/91）。"""
    name = SHEET_RESOLUTION
    # 保持页签顺序：删后插到 index 1（00 之后）
    if name in wb.sheetnames:
        del wb[name]
    ws = wb.create_sheet(name, 1)
    route_rows = scan_route_lines()
    by_mid: dict[str, list[dict]] = {}
    for rr in route_rows:
        by_mid.setdefault(rr["model_id"], []).append(rr)

    head_font = Font(name="PingFang SC", size=14, bold=True, color="B42318")
    sec_font = Font(name="PingFang SC", size=11, bold=True, color="1D2939")
    bold = Font(name="PingFang SC", bold=True)
    body = Font(name="PingFang SC", size=10)
    mono = Font(name="Menlo", size=9)
    hint = Font(name="PingFang SC", size=9, color="64748B", italic=True)
    fill_head = solid_fill("FEF3C7")
    fill_sec = solid_fill("F1F5F9")
    fill_yuan = solid_fill("FEF2F2")
    fill_ok = solid_fill("ECFDF3")

    ws["A1"] = "01_报价解析汇总 · 对外阶梯依据（对内 · 勿外发）"
    ws["A1"].font = head_font
    ws.merge_cells("A1:L1")
    ws["A2"] = (
        f"对应外发：{OUT.name}（01_生文/02_生图/03_生视频）｜"
        f"线路源：{ROUTES_TEXT.name}/ · {ROUTES_IMAGE.name}/ · {ROUTES_VIDEO.name}/｜"
        "启用线路→商务成本族→公开阶梯；停用更低进价仅作依据，不自动改对外折。"
        "重建：python3 pricing/scripts/build_outward_quote_standard.py"
    )
    ws["A2"].font = hint
    ws.merge_cells("A2:L2")
    ws.row_dimensions[2].height = 36

    # 外发口径摘要（原 90）
    ws["A3"] = "〇、外发口径摘要"
    ws["A3"].font = sec_font
    ws["A3"].fill = fill_sec
    ws.merge_cells("A3:L3")
    r_meta = 4
    for k, v in meta[:10]:
        ws.cell(r_meta, 1, k).font = bold
        ws.cell(r_meta, 2, v).font = body
        ws.cell(r_meta, 2).alignment = Alignment(wrap_text=True)
        ws.merge_cells(start_row=r_meta, start_column=2, end_row=r_meta, end_column=6)
        r_meta += 1
    r_concl = r_meta + 1

    # ---- 结论条 ----
    yuanjia_models = []
    for m in models:
        fam = resolve_family(m["model_id"], model_families, recommended)
        zhes = public_tiers_for(m["model_id"], fam)
        is_yuan = bool(zhes) and all(z is not None and z >= 9.999 for z in zhes)
        if is_yuan:
            yuanjia_models.append(m["model_id"])

    dormant_cheaper = []
    for mid in yuanjia_models:
        for rr in by_mid.get(mid, []):
            st = rr["status"]
            if st == "启用":
                continue
            ratio = rr["min_ratio"]
            if ratio is not None and ratio < 0.97:
                dormant_cheaper.append((mid, rr))

    ws.cell(r_concl, 1, "一、结论（原价对外）").font = sec_font
    ws.cell(r_concl, 1).fill = fill_sec
    ws.merge_cells(start_row=r_concl, start_column=1, end_row=r_concl, end_column=12)
    conclusions = [
        (
            "对外原价款数",
            f"{len(yuanjia_models)} / {len(models)}（生文）",
        ),
        (
            "原价原因",
            "当前启用线路折扣列=1 且成本/官方≈1.0；商务归属 1.0 族 → 公开不设用量阶梯",
        ),
        (
            "是否「有折扣进价却对外原价」",
            "否（启用侧无厚利）；有停用更低进价见第三节",
        ),
        (
            "停用更低进价条数",
            f"{len(dormant_cheaper)} 条（涉及 "
            f"{len({m for m, _ in dormant_cheaper})} 款原价模型）",
        ),
    ]
    for i, (k, v) in enumerate(conclusions):
        r = r_concl + 1 + i
        ws.cell(r, 1, k).font = bold
        ws.cell(r, 2, v).font = body
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)

    # ---- 第二节：全量生文解析 ----
    r0 = r_concl + 1 + len(conclusions) + 1
    ws.cell(r0, 1, "二、生文全量 · 报价解析（目录价阶梯依据）").font = sec_font
    ws.cell(r0, 1).fill = fill_sec
    ws.merge_cells(start_row=r0, start_column=1, end_row=r0, end_column=12)
    headers = [
        "厂商",
        "模型 ID",
        "显示名",
        "映射成本折",
        "对外·≥$5k",
        "对外·≥$10k",
        "对外·≥$50k",
        "阶梯来源",
        "启用最低成本比",
        "启用线路摘要",
        "停用更低进价",
        "判定",
    ]
    for c, h in enumerate(headers, 1):
        cell = ws.cell(r0 + 1, c, h)
        cell.font = bold
        cell.fill = fill_head

    def emit_resolution_rows(start_r: int, items: list[dict]) -> int:
        rr = start_r
        for m in items:
            mid = m["model_id"]
            fam = resolve_family(mid, model_families, recommended)
            zhes = public_tiers_for(mid, fam) or [None, None, None]
            src = ladder_source_label(mid, fam, recommended)
            enabled = [x for x in by_mid.get(mid, []) if x["status"] == "启用"]
            disabled_cheap = [
                x
                for x in by_mid.get(mid, [])
                if x["status"] != "启用"
                and x["min_ratio"] is not None
                and x["min_ratio"] < 0.97
            ]
            en_ratios = [x["min_ratio"] for x in enabled if x["min_ratio"] is not None]
            min_en = min(en_ratios) if en_ratios else None
            en_routes = "；".join(
                dict.fromkeys(
                    f"{x['route'] or '—'}"
                    + (f"({x['min_ratio']:.2f})" if x["min_ratio"] is not None else "")
                    for x in enabled
                    if x["route"]
                )
            )[:120]
            dis_txt = "；".join(
                f"{x['route'] or '—'}·{x['discount']}·{x['status']}"
                f"·比{x['min_ratio']:.2f}·{x['source']}"
                for x in disabled_cheap
            )[:160]
            is_yuan = all(z is not None and z >= 9.999 for z in zhes)
            if is_yuan and min_en is not None and min_en >= 0.97:
                judge = "启用进价≈原价 → 对外原价"
            elif is_yuan and disabled_cheap:
                judge = "启用原价；另有停用更低进价（未进阶梯）"
            elif is_yuan:
                judge = "对外原价"
            elif disabled_cheap:
                judge = "有公开阶梯；另见停用更低进价"
            else:
                judge = "有公开阶梯"

            z3 = list(zhes) + [None] * 3
            vals = [
                m["vendor"],
                mid,
                m["display"],
                fam if fam is not None else "—",
                fmt_tier_zhe(z3[0]),
                fmt_tier_zhe(z3[1]),
                fmt_tier_zhe(z3[2]),
                src,
                f"{min_en:.2f}" if min_en is not None else "—",
                en_routes or "—",
                dis_txt or "—",
                judge,
            ]
            for c, v in enumerate(vals, 1):
                cell = ws.cell(rr, c, v)
                cell.font = mono if c in (2, 4, 5, 6, 7, 9) else body
                if is_yuan:
                    cell.fill = fill_yuan
                elif min_en is not None and min_en < 0.78:
                    cell.fill = fill_ok
            rr += 1
        return rr

    r = emit_resolution_rows(r0 + 2, models)

    # ---- 二-B：生图全量 ----
    img_models = []
    seen_img: set[str] = set()
    for m in image_rows:
        if m["model_id"] in seen_img:
            continue
        seen_img.add(m["model_id"])
        img_models.append(m)
    r += 1
    ws.cell(r, 1, "二-B、生图全量 · 报价解析").font = sec_font
    ws.cell(r, 1).fill = fill_sec
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=12)
    r += 1
    for c, h in enumerate(headers, 1):
        cell = ws.cell(r, c, h)
        cell.font = bold
        cell.fill = fill_head
    r = emit_resolution_rows(r + 1, img_models)

    # ---- 二-C：生视频全量 ----
    vid_models = []
    seen_vid: set[str] = set()
    for m in video_rows:
        if m["model_id"] in seen_vid:
            continue
        seen_vid.add(m["model_id"])
        vid_models.append(m)
    r += 1
    ws.cell(r, 1, "二-C、生视频全量 · 报价解析").font = sec_font
    ws.cell(r, 1).fill = fill_sec
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=12)
    r += 1
    for c, h in enumerate(headers, 1):
        cell = ws.cell(r, c, h)
        cell.font = bold
        cell.fill = fill_head
    r = emit_resolution_rows(r + 1, vid_models)

    # 原价名单扩及生图/生视频
    for m in img_models + vid_models:
        fam = resolve_family(m["model_id"], model_families, recommended)
        zhes = public_tiers_for(m["model_id"], fam)
        if zhes and all(z is not None and z >= 9.999 for z in zhes):
            if m["model_id"] not in yuanjia_models:
                yuanjia_models.append(m["model_id"])

    # ---- 第三节：原价专项 + 停用明细 ----
    r += 1
    ws.cell(
        r, 1, "三、对外原价专项 · 启用=1.0 与停用更低进价明细（生文+生图+生视频）"
    ).font = sec_font
    ws.cell(r, 1).fill = fill_sec
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=12)
    r += 1
    ws.cell(
        r,
        1,
        "说明：下表逐条列出原价模型的启用线路（成本比）及全部非启用且成本比<0.97 的线路，"
        "作为「为何对外原价 / 是否可改阶梯」的报价依据。",
    ).font = hint
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=12)
    r += 1
    h2 = [
        "模型 ID",
        "启停",
        "折扣列",
        "成本/官方比",
        "线路名",
        "源文件",
        "对报价含义",
    ]
    for c, h in enumerate(h2, 1):
        cell = ws.cell(r, c, h)
        cell.font = bold
        cell.fill = fill_head
    r += 1

    for mid in yuanjia_models:
        lines = by_mid.get(mid, [])
        if not lines:
            ws.cell(r, 1, mid).font = mono
            ws.cell(r, 7, "线路源无记录").font = body
            r += 1
            continue
        # 启用在前，再停用低价，再其它
        def sort_key(x):
            en = 0 if x["status"] == "启用" else 1
            ratio = x["min_ratio"] if x["min_ratio"] is not None else 9
            return (en, ratio, x["source"], x["route"])

        for x in sorted(lines, key=sort_key):
            # 原价专项：启用全记；非启用只记更低进价
            if x["status"] != "启用" and (
                x["min_ratio"] is None or x["min_ratio"] >= 0.97
            ):
                continue
            if x["status"] == "启用":
                meaning = "当前供给·进货≈挂牌 → 支撑对外原价"
            else:
                meaning = "停用更低进价·未进商务归属/对外阶梯；若启用需回灌成本族"
            vals = [
                mid,
                x["status"] or "—",
                str(x["discount"]) if x["discount"] is not None else "—",
                f"{x['min_ratio']:.3f}" if x["min_ratio"] is not None else "—",
                x["route"] or "—",
                x["source"],
                meaning,
            ]
            for c, v in enumerate(vals, 1):
                cell = ws.cell(r, c, v)
                cell.font = mono if c in (1, 4) else body
                if x["status"] != "启用":
                    cell.fill = fill_yuan
            r += 1

    r += 1
    ws.cell(r, 1, "四、口径备忘").font = sec_font
    ws.cell(r, 1).fill = fill_sec
    r += 1
    for line in [
        "1) 对外三档（$5k/$10k/$50k）取公开定折矩阵；对内商务仍五档；不抄 L3b 全列深折。",
        "2) 模型→成本族：商务归属 + 交叉推荐（厚利优先）。",
        "3) 1.0 族 / 未映射 → 对外原价；0.78 → 浅折；Claude 非 1.0 → 对齐 opus 公开阶梯。",
        "4) 停用线路不改变对外价；重新启用并回灌商务表后，需重跑本脚本刷新 01 与外发表。",
        "5) ≤0.50：0.40 最深 5.5、0.50 最深 6.0；对客折底线暂定 5.5；097 全停用仅线路扫描。",
    ]:
        ws.cell(r, 1, line).font = body
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=12)
        r += 1

    widths = [14, 28, 22, 12, 10, 10, 10, 22, 12, 36, 40, 28]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = f"A{r0 + 2}"
    print(
        f"price resolution: text={len(models)} image={len(img_models)} "
        f"video={len(vid_models)} yuanjia={len(yuanjia_models)} "
        f"dormant_cheaper_rows={len(dormant_cheaper)} route_rows={len(route_rows)}"
    )


def write_l3a_internal_to_commercial(
    meta: list[tuple[str, str]],
    models: list[dict],
    image_rows: list[dict],
    video_rows: list[dict],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> None:
    """回写商务总册 01_报价解析汇总（勿外发）；不再写 90/91/src。"""
    path = SRC_COMMERCIAL
    if not path.exists():
        print(f"skip L3a internal sheets: missing {path}")
        return
    wb = openpyxl.load_workbook(path)
    # 清理旧页签（迁移期）
    for name in (
        "90_L3a对外说明",
        "91_L3a映射索引",
        "92_报价解析汇总",
        "00_说明_L3a",
        "99_对内索引_勿外发",
        "01_商务洽谈总表",
        "02_交叉模型",
    ):
        if name in wb.sheetnames:
            del wb[name]
    # 清理旧 src_* 
    for name in list(wb.sheetnames):
        if name.startswith("src_"):
            del wb[name]

    write_price_resolution_sheet(
        wb, meta, models, image_rows, video_rows, model_families, recommended
    )

    # 刷新 00_说明 · 解析回写日
    if "00_说明" in wb.sheetnames:
        wsr = wb["00_说明"]
        found = False
        for r in range(1, wsr.max_row + 1):
            if str(wsr.cell(r, 1).value or "").strip() == "01最近回写":
                wsr.cell(r, 2, date.today().isoformat())
                found = True
                break
        if not found:
            r = wsr.max_row + 1
            wsr.cell(r, 1, "01最近回写").font = Font(name="PingFang SC", bold=True)
            wsr.cell(r, 2, date.today().isoformat()).font = Font(name="PingFang SC")

    wb.save(path)
    print(f"updated {SHEET_RESOLUTION} → {path.name} sheets={wb.sheetnames}")


def build():
    # 先读磁盘上版，再覆盖写出（相对上版标黄 + 变更摘要 + 累积更新日志）
    prev_snap = load_quote_snapshot(OUT)
    if not prev_snap:
        prev_snap = load_quote_snapshot(OUT_DISCOUNT_ONLY)
    changelog_history = load_l3a_changelog_from_xlsx(OUT)

    models = load_models()
    image_rows = load_image_rows()
    video_rows = load_video_rows()
    _family_tiers_l3b, model_families, recommended = load_commercial()
    image_rows = sort_image_rows_discount_first(
        image_rows, model_families, recommended
    )
    video_rows = sort_video_rows_discount_first(
        video_rows, model_families, recommended
    )
    text_order = {v: i for i, v in enumerate(VENDOR_ORDER)}
    models.sort(
        key=lambda m: (
            _deep_public_zhe(m["model_id"], model_families, recommended),
            _vendor_rank(m["vendor"], text_order),
            m["model_id"],
        )
    )
    today = date.today()
    valid_until = "2026-09-30 24:00"
    st = _sheet_styles()
    thin = st["thin"]
    header_fill = st["header_fill"]
    alt = st["alt"]
    body_font = st["body_font"]
    num_font = st["num_font"]
    white_bold = st["white_bold"]
    center = st["center"]
    left = st["left"]

    curr_snap = build_quote_snapshot(
        models, image_rows, video_rows, model_families, recommended
    )
    diff = diff_quote_snapshots(prev_snap, curr_snap)
    highlight_ids = diff["highlight_ids"]

    with_ladder = 0
    for m in models:
        fam = resolve_family(m["model_id"], model_families, recommended)
        zhes = public_tiers_for(m["model_id"], fam)
        if zhes and any(z is not None and z < 9.999 for z in zhes):
            with_ladder += 1
    image_models = len({r["model_id"] for r in image_rows})
    video_models = len({r["model_id"] for r in video_rows})
    meta = [
        ("外发文件", OUT_DISCOUNT_ONLY.name),
        ("定位", "L3a 内部报价单（含 hehe公司需求；外发折扣册见 Trinity模型报价表.xlsx）"),
        (
            "形态",
            "更新（累积日志）· 00_折扣一览 · 相对上版变更 · 01_生文 · 02_生图 · 03_生视频 · hehe公司需求；"
            "刊例价 + 用量档对客折（对外三档）；浅黄=相对上版新增/变更",
        ),
        ("不含", "上游成本折/线路/中转站/GM；报价依据在商务总册 01_报价解析汇总"),
        (
            "刊例价来源",
            "L2 线上刊例 · prices-api-text/image/video.json（与 /v1/prices 一致）；"
            "生文本轮上浮 hy-mt2-plus、glm-5.2（刊例策略 §3.1）",
        ),
        (
            "小数规则",
            "对外金额统一两位小数；原值第 3 位及以后有数则向上进位到分",
        ),
        (
            "客户档",
            "对外三档：≥$5k · ≥$10k · ≥$50k（表头标「对外」；对内商务仍五档）",
        ),
        (
            "阶梯来源",
            "定价方案-v0 公开定折矩阵；模型→成本族取自本商务表；"
            "≤0.50：0.40 最深 5.5、0.50 最深 6.0；对客折底线暂定 5.5；"
            "图/视频多数 1.0 则写原价；不抄 L3b 商务全五档",
        ),
        (
            "公开定折摘要",
            "顺序 对外$5k/$10k/$50k · "
            "0.40: 6.2/6.0/5.5；0.50: 6.8/6.5/6.0；"
            "0.60: 8.2/7.6/6.7；0.65: 8.5/8.2/7.2；"
            "0.70: 9.2/8.8/7.8；0.75: 9.0/8.7/8.2；"
            "0.85: 9.8/9.7/9.4；≥0.78/未映射: 原价（Claude/单模特例除外）",
        ),
        ("达档口径", "企业户累积消耗（按刊例价计）"),
        ("生成日期", today.isoformat()),
        ("有效期（初版暂定）", f"至 {valid_until}；过期请向运营索取新版"),
        (
            "单位",
            "生文：USD/百万 tokens；生图：USD/张或百万 tokens；"
            "生视频：USD/秒或百万 video tokens（见规格列）",
        ),
        (
            "覆盖",
            f"生文 {len(models)} 款（公开阶梯非原价约 {with_ladder}）；"
            f"生图 {image_models} 款 / {len(image_rows)} 规格行；"
            f"生视频 {video_models} 款 / {len(video_rows)} 规格行",
        ),
        (
            "相对上版",
            f"+{len(diff['added'])} / −{len(diff['removed'])} / "
            f"刊例变 {len(diff['listing_changed'])} / 档位变 {len(diff['tier_changed'])}；"
            f"标黄 {len(highlight_ids)} 款",
        ),
        ("重建", "python3 pricing/scripts/build_outward_quote_standard.py"),
    ]

    # ---- 对外 workbook：仅客户可发 Sheet ----
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "01_生文"
    # A厂商 B模型ID C显示名 D目录入 E目录出 F目录缓 | 各用量档（仅对客折，入出同折）
    n_cols = 6 + len(TIERS)

    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=n_cols)
    ws["A1"] = "Trinity · 生文标准档报价"
    ws["A1"].font = Font(name="PingFang SC", size=18, bold=True, color="1D2939")
    ws.row_dimensions[1].height = 28

    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=n_cols)
    ws["A2"] = (
        f"【生文】单位：USD / 百万 tokens　|　有效期：{valid_until}，过期作废，请联系商务获取最新报价。"
        "　阶梯达档：企业户累积消耗（按刊例价计）；更大用量或合同价请联系商务。"
        "　用量档列仅列对客折（入/出同折）；折后价 = 刊例价 × 折数。"
    )
    ws["A2"].font = Font(name="PingFang SC", size=10, color="475467")
    ws["A2"].alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[2].height = 40

    # 单行表头（用量档不再分子列「输入/输出」）
    headers = [
        "厂商",
        "模型 ID",
        "显示名",
        "刊例价·输入",
        "刊例价·输出",
        "刊例价·缓存",
    ] + [label for _, label, _ in TIERS]
    for i, h in enumerate(headers, 1):
        cell = ws.cell(4, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
    ws.row_dimensions[4].height = 24

    prev_vendor = None
    for idx, m in enumerate(models):
        r = 5 + idx
        show_vendor = m["vendor"] if m["vendor"] != prev_vendor else ""
        prev_vendor = m["vendor"]
        fam = resolve_family(m["model_id"], model_families, recommended)
        zhes = public_tiers_for(m["model_id"], fam)

        vals = [
            show_vendor,
            m["model_id"],
            m["display"],
            fmt_num(m["inp"]),
            fmt_num(m["out"]),
            fmt_cache(m.get("cache")),
        ]
        for ti, (_, _, _) in enumerate(TIERS):
            if not zhes or zhes[ti] is None:
                vals.append("—")
            else:
                vals.append(fmt_tier_zhe(zhes[ti]))

        for c, v in enumerate(vals, 1):
            cell = ws.cell(r, c, v)
            style_cell(
                cell,
                font=num_font if c >= 4 else body_font,
                align=center if c == 1 or c >= 4 else left,
                border=thin,
                fill=_row_fill_for_change(
                    m["model_id"], highlight_ids, alt if idx % 2 else None
                ),
            )

    widths = [12, 26, 26, 12, 12, 12] + [14] * len(TIERS)
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "G5"

    # ---- 02_生图 ----
    ws_img = wb.create_sheet("02_生图", 1)
    n_img = 6 + len(TIERS)
    ws_img.merge_cells(start_row=1, start_column=1, end_row=1, end_column=n_img)
    ws_img["A1"] = "Trinity · 生图标准档报价"
    ws_img["A1"].font = Font(name="PingFang SC", size=18, bold=True, color="1D2939")
    ws_img.row_dimensions[1].height = 28
    ws_img.merge_cells(start_row=2, start_column=1, end_row=2, end_column=n_img)
    ws_img["A2"] = (
        f"【生图】有效期：{valid_until}，过期作废，请联系商务获取最新报价。"
        "　阶梯达档：企业户累积消耗（按刊例价计）。"
        "　规格多为分辨率（USD/张）；token 生图见单位列。"
        "　用量档仅列对客折；折后价 = 刊例价 × 折数。"
        "　刊例价 = 线上 L2（/v1/prices），对外金额两位小数进位。"
    )
    ws_img["A2"].font = Font(name="PingFang SC", size=10, color="475467")
    ws_img["A2"].alignment = Alignment(wrap_text=True, vertical="center")
    ws_img.row_dimensions[2].height = 44

    img_headers = [
        "厂商",
        "模型 ID",
        "显示名",
        "规格",
        "单位",
        "刊例价",
    ] + [label for _, label, _ in TIERS]
    for i, h in enumerate(img_headers, 1):
        cell = ws_img.cell(4, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
    ws_img.row_dimensions[4].height = 24

    prev_vendor = None
    for idx, m in enumerate(image_rows):
        r = 5 + idx
        show_vendor = m["vendor"] if m["vendor"] != prev_vendor else ""
        prev_vendor = m["vendor"]
        fam = resolve_family(m["model_id"], model_families, recommended)
        zhes = public_tiers_for(m["model_id"], fam)
        cat_cell = (
            m["catalog_display"]
            if m.get("catalog_display")
            else fmt_num(m["catalog"])
        )
        vals = [
            show_vendor,
            m["model_id"],
            m["display"],
            m["spec"],
            m["unit"],
            cat_cell,
        ]
        for ti, (_, _, _) in enumerate(TIERS):
            if not zhes or zhes[ti] is None:
                vals.append("—")
            else:
                vals.append(fmt_tier_zhe(zhes[ti]))
        for c, v in enumerate(vals, 1):
            cell = ws_img.cell(r, c, v)
            style_cell(
                cell,
                font=num_font if c >= 4 else body_font,
                align=center if c == 1 or c >= 4 else left,
                border=thin,
                fill=_row_fill_for_change(
                    m["model_id"], highlight_ids, alt if idx % 2 else None
                ),
            )

    for i, w in enumerate([12, 22, 22, 10, 16, 28] + [14] * len(TIERS), 1):
        ws_img.column_dimensions[get_column_letter(i)].width = w
    ws_img.freeze_panes = "G5"

    # ---- 03_生视频 ----
    ws_vid = wb.create_sheet("03_生视频", 2)
    n_vid = 6 + len(TIERS)
    ws_vid.merge_cells(start_row=1, start_column=1, end_row=1, end_column=n_vid)
    ws_vid["A1"] = "Trinity · 生视频标准档报价"
    ws_vid["A1"].font = Font(name="PingFang SC", size=18, bold=True, color="1D2939")
    ws_vid.row_dimensions[1].height = 28
    ws_vid.merge_cells(start_row=2, start_column=1, end_row=2, end_column=n_vid)
    ws_vid["A2"] = (
        f"【生视频】有效期：{valid_until}，过期作废，请联系商务获取最新报价。"
        "　阶梯达档：企业户累积消耗（按刊例价计）。"
        "　规格多为分辨率或时长计费（USD/秒）；token 生视频见单位列。"
        "　用量档仅列对客折；折后价 = 刊例价 × 折数。"
        "　刊例价 = 线上 L2（/v1/prices），对外金额两位小数进位。"
    )
    ws_vid["A2"].font = Font(name="PingFang SC", size=10, color="475467")
    ws_vid["A2"].alignment = Alignment(wrap_text=True, vertical="center")
    ws_vid.row_dimensions[2].height = 44

    vid_headers = [
        "厂商",
        "模型 ID",
        "显示名",
        "规格",
        "单位",
        "刊例价",
    ] + [label for _, label, _ in TIERS]
    for i, h in enumerate(vid_headers, 1):
        cell = ws_vid.cell(4, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
    ws_vid.row_dimensions[4].height = 24

    prev_vendor = None
    for idx, m in enumerate(video_rows):
        r = 5 + idx
        show_vendor = m["vendor"] if m["vendor"] != prev_vendor else ""
        prev_vendor = m["vendor"]
        fam = resolve_family(m["model_id"], model_families, recommended)
        zhes = public_tiers_for(m["model_id"], fam)
        cat_cell = (
            m["catalog_display"]
            if m.get("catalog_display")
            else fmt_num(m["catalog"])
        )
        vals = [
            show_vendor,
            m["model_id"],
            m["display"],
            m["spec"],
            m["unit"],
            cat_cell,
        ]
        for ti, (_, _, _) in enumerate(TIERS):
            if not zhes or zhes[ti] is None:
                vals.append("—")
            else:
                vals.append(fmt_tier_zhe(zhes[ti]))
        for c, v in enumerate(vals, 1):
            cell = ws_vid.cell(r, c, v)
            style_cell(
                cell,
                font=num_font if c >= 4 else body_font,
                align=center if c == 1 or c >= 4 else left,
                border=thin,
                fill=_row_fill_for_change(
                    m["model_id"], highlight_ids, alt if idx % 2 else None
                ),
            )

    for i, w in enumerate([12, 26, 22, 14, 22, 14] + [14] * len(TIERS), 1):
        ws_vid.column_dimensions[get_column_letter(i)].width = w
    ws_vid.freeze_panes = "G5"

    discount_rows = collect_discounted_models(
        models, image_rows, video_rows, model_families, recommended
    )
    write_discount_overview_sheet(
        wb,
        discount_rows,
        valid_until=valid_until,
        thin=thin,
        white_bold=white_bold,
        body_font=body_font,
        num_font=num_font,
        center=center,
        left=left,
        highlight_ids=highlight_ids,
    )
    write_change_summary_sheet(
        wb,
        diff,
        valid_until=valid_until,
        thin=thin,
        white_bold=white_bold,
        body_font=body_font,
        num_font=num_font,
        center=center,
        left=left,
    )
    today_dot = _fmt_dot_date(today)
    new_log = changelog_entries_from_diff(diff, today_dot)
    seen = {(e["date"], e["category"], e["detail"]) for e in changelog_history}
    prepend = [e for e in new_log if (e["date"], e["category"], e["detail"]) not in seen]
    changelog = prepend + changelog_history
    if not changelog:
        changelog = [
            {
                "date": today_dot,
                "category": "总册",
                "detail": (
                    f"启用「更新」累积日志（与商务总册同结构）；"
                    f"本轮相对上版无差异（{diff['curr_count']} 款）"
                ),
                "note": "L3a 对内 · 首启",
            }
        ]
    write_l3a_changelog_sheet(
        wb,
        changelog,
        thin=thin,
        white_bold=white_bold,
        body_font=body_font,
        center=center,
        left=left,
    )
    md_path = write_change_summary_md(
        diff, generated=today.isoformat(), changelog=changelog
    )
    print(
        f"change vs prev: +{len(diff['added'])}/-{len(diff['removed'])} "
        f"listing={len(diff['listing_changed'])} tier={len(diff['tier_changed'])} "
        f"yellow={len(highlight_ids)} log+{len(prepend)}/{len(changelog)} → {md_path.name}"
    )

    wb.save(OUT)
    patch_xlsx_for_wechat(OUT)  # 微信预览：补 applyFill 等
    write_discount_only_workbook(
        OUT_DISCOUNT_ONLY,
        discount_rows,
        thin=thin,
        white_bold=white_bold,
        body_font=body_font,
        num_font=num_font,
        center=center,
        left=left,
    )
    # Media-Hub 表二 → hehe公司需求（写回内部总册）
    try:
        from media_hub_trinity_crosswalk import (  # noqa: WPS433
            collect_media_hub_rows,
            write_hehe_sheet,
        )

        _disc, table2 = collect_media_hub_rows()
        wb_hehe = openpyxl.load_workbook(OUT)
        write_hehe_sheet(wb_hehe, table2)
        wb_hehe.save(OUT)
        patch_xlsx_for_wechat(OUT)
        print(f"appended {SHEET_HEHE} rows={len(table2)} → {OUT.name}")
    except Exception as exc:  # noqa: BLE001
        print(f"WARN: skip {SHEET_HEHE}: {exc}")

    if OUT_DISCOUNT_ONLY_LEGACY.exists():
        OUT_DISCOUNT_ONLY_LEGACY.unlink()
        print(f"removed legacy {OUT_DISCOUNT_ONLY_LEGACY.name}")

    mapped = sum(
        1
        for m in models
        if resolve_family(m["model_id"], model_families, recommended) is not None
    )
    print(
        f"wrote {OUT} sheets={openpyxl.load_workbook(OUT, read_only=True).sheetnames} "
        f"text={len(models)} "
        f"mapped_family={mapped} public_ladder≈{with_ladder} "
        f"image_models={image_models} image_rows={len(image_rows)} "
        f"video_models={video_models} video_rows={len(video_rows)}"
    )

    # 说明 + 映射索引 → 商务内部表（对内）；外发仅 OUT 一份
    write_l3a_internal_to_commercial(
        meta, models, image_rows, video_rows, model_families, recommended
    )
    if SRC_COMMERCIAL.exists():
        patch_xlsx_for_wechat(SRC_COMMERCIAL)


if __name__ == "__main__":
    build()

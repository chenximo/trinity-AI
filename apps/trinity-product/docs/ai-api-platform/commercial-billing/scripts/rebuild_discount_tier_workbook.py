#!/usr/bin/env python3
"""Rebuild 商务洽谈折扣总表.xlsx from 线路管理 exports.

SOP: ../discount-tier-workbook-sop.md
折数真源: pricing-strategy-evidence-chain.md — change tiers there first, then FAMILY_TIERS here.
"""

from __future__ import annotations

from collections import defaultdict
from copy import copy
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

# ---------------------------------------------------------------------------
# Config — register new cost-family exports here
# ---------------------------------------------------------------------------

DOWNLOADS = Path.home() / "Downloads"
OUT = Path(__file__).resolve().parent.parent / "商务洽谈折扣总表.xlsx"

# (export path, 折扣列原文, d_cost key, src sheet name)
SOURCES: list[tuple[Path, str, str, str]] = [
    (DOWNLOADS / "model-supply-routes-20260716 (2).xlsx", "6.5折", "0.65", "src_065"),
    (DOWNLOADS / "model-supply-routes-20260716 (3).xlsx", "7折", "0.70", "src_070"),
    (DOWNLOADS / "model-supply-routes-20260716 (4).xlsx", "7.5折", "0.75", "src_075"),
    (DOWNLOADS / "model-supply-routes-20260716 (5).xlsx", "7.8折", "0.78", "src_078"),
    (DOWNLOADS / "model-supply-routes-20260716 (6).xlsx", "9.7折", "0.97", "src_097"),
]

# d_cost -> label, tiers[Plus..Enterprise], band, public_flag, no_ladder
# tiers values: "原价" | "9.0" | "—"
FAMILY_TIERS: list[tuple] = [
    (0.65, "0.65（6.5折）·主锚", ["9.0", "8.5", "8.2", "7.6", "7.2"],
     "Growth 8.5～8.2；Scale 7.5～7.7", "否（公开另文）", False),
    (0.60, "0.60（6折）", ["8.5", "8.2", "7.6", "7.0", "6.7"], "—", "待定", False),
    (0.70, "0.70（7折）", ["9.7", "9.2", "8.8", "8.2", "7.8"], "—", "待定", False),
    (0.75, "0.75（7.5折）", ["原价", "9.8", "9.4", "8.8", "8.3"], "—", "待定", False),
    (0.78, "0.78（7.8折）", ["原价", "原价", "9.8", "9.1", "8.7"], "—", "待定", False),
    (0.80, "0.80（8折·薄利）", ["9.8", "9.5", "9.3", "9.1", "8.9"], "—", "否·仅商务", False),
    (0.85, "0.85（8.5折·薄利）", ["9.9", "9.8", "9.7", "9.5", "9.4"], "—", "否·仅商务", False),
    (0.90, "0.90（9折·薄利）", ["原价", "9.9", "9.9", "9.8", "9.7"], "—", "否·仅商务", False),
    (0.97, "0.97（9.7折）·不设阶梯", ["—", "—", "—", "—", "—"],
     "不设用量阶梯；对客原价（刊例 GM≈3%）", "否·仅刊例/商务点名", True),
]

FAMILY_ORDER = ["0.65", "0.70", "0.75", "0.78", "0.97", "0.60", "0.80", "0.85", "0.90"]
CROSS_ROUTE_COLS = ["0.65", "0.70", "0.75", "0.78"]

TIER_HEADERS = [
    "上游成本折",
    "≥$1k（Plus）",
    "≥$5k（Mid）",
    "≥$10k（Growth）",
    "≥$50k（Scale）",
    "≥$100k（Enterprise）",
    "操作带",
    "模型数",
    "模型（ID：主线路）",
    "是否进公开阶梯",
]

# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------

THIN = Border(
    left=Side(style="thin", color="D0D5DD"),
    right=Side(style="thin", color="D0D5DD"),
    top=Side(style="thin", color="D0D5DD"),
    bottom=Side(style="thin", color="D0D5DD"),
)
FILL_HINT = PatternFill("solid", fgColor="FEF9C3")
FILL_HEAD = PatternFill("solid", fgColor="F1F5F9")
FILL_ANCHOR = PatternFill("solid", fgColor="FFF7ED")
FILL_FILLED = PatternFill("solid", fgColor="F0FDF4")
FILL_NOLADDER = PatternFill("solid", fgColor="F1F5F9")
FILL_ROW = PatternFill("solid", fgColor="FFFFFF")
FILL_ALT = PatternFill("solid", fgColor="F8FAFC")
FILL_TITLE = PatternFill("solid", fgColor="FEE2E2")
FILL_REC = PatternFill("solid", fgColor="DCFCE7")
HEAD_BORDER = Border(
    left=Side(style="thin", color="D0D5DD"),
    right=Side(style="thin", color="D0D5DD"),
    top=Side(style="thin", color="D0D5DD"),
    bottom=Side(style="medium", color="334155"),
)


def font(bold=False, size=10, color="1E293B", name="PingFang SC"):
    return Font(name=name, bold=bold, size=size, color=color)


# ---------------------------------------------------------------------------
# Load
# ---------------------------------------------------------------------------

def fix_route(route: str) -> str:
    if not route:
        return ""
    return route.replace("??????", "网聚云联")


def load_source(path: Path, discount_label: str):
    """Return (worksheet, pairs for summary, route map for cross)."""
    if not path.exists():
        raise FileNotFoundError(f"SOURCE missing: {path}")
    wb = load_workbook(path, data_only=True)
    ws = wb["线路管理"]
    pairs = []  # (id, route) for 01 model cell
    routes = defaultdict(list)  # id -> [(route, pri, weight)]
    for i, row in enumerate(ws.iter_rows(values_only=True), 1):
        if i == 1 or not row[0]:
            continue
        if row[8] != discount_label or row[10] != "启用":
            continue
        mid = row[0]
        route = fix_route(row[3] or "")
        pri = str(row[4] or "—")
        weight = str(row[5] or "—")
        pairs.append((mid, route))
        entry = (route, pri, weight)
        if entry not in routes[mid]:
            routes[mid].append(entry)
    return ws, pairs, routes


def gm_pct(d_cost: float, tier: str):
    if tier in ("—", "-"):
        return None
    if tier == "原价":
        return (1 - d_cost) * 100
    return (1 - d_cost / (float(tier) / 10.0)) * 100


def fmt_gm(gm: float) -> str:
    half = round(gm * 2) / 2
    if abs(gm - half) < 0.35:
        return f"{int(half)}" if half == int(half) else f"{half:.1f}"
    return f"{gm:.1f}"


def gm_label(d_cost: float, tier: str) -> str:
    if tier in ("—", "-"):
        return "—"
    if tier == "原价":
        return f"原价（GM {fmt_gm(gm_pct(d_cost, tier))}%）"
    return f"{tier}（GM {fmt_gm(gm_pct(d_cost, tier))}%）"


def models_cell(pairs: list[tuple[str, str]]) -> str:
    if not pairs:
        return "（待补）"
    lines = [f"{mid}：{route}；" for mid, route in pairs[:-1]]
    lines.append(f"{pairs[-1][0]}：{pairs[-1][1]}")
    return "\n".join(lines)


def row_height_for(n: int) -> float:
    if n <= 0:
        return 38
    return max(42, n * 14.5 + 16)


def copy_src_sheet(wb_out: Workbook, name: str, src_ws, note: str):
    ws = wb_out.create_sheet(name)
    for row in src_ws.iter_rows():
        for cell in row:
            val = cell.value
            if cell.column == 4 and isinstance(val, str) and "??????" in val:
                val = fix_route(val)
            new = ws.cell(cell.row, cell.column, val)
            if cell.has_style:
                try:
                    new.font = copy(cell.font)
                    new.alignment = copy(cell.alignment)
                    if cell.fill and cell.fill.fill_type:
                        new.fill = copy(cell.fill)
                    new.border = copy(cell.border)
                    new.number_format = cell.number_format
                except Exception:
                    pass
    for letter in list("ABCDEFGHIJKL"):
        dim = src_ws.column_dimensions.get(letter)
        ws.column_dimensions[letter].width = dim.width if dim and dim.width else 14
    ws.insert_rows(1)
    ws.merge_cells("A1:L1")
    n = ws.cell(1, 1, note)
    n.font = Font(name="PingFang SC", size=9, color="64748B", italic=True)
    n.fill = PatternFill("solid", fgColor="F1F5F9")
    ws.freeze_panes = "A3"


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def build():
    loaded = {}  # d_cost key -> (ws, pairs, routes, fname, src_name, label)
    for path, label, key, src_name in SOURCES:
        ws, pairs, routes = load_source(path, label)
        loaded[key] = (ws, pairs, routes, path.name, src_name, label)
        print(f"loaded {key}: {len(pairs)} models from {path.name}")

    # merge routes for cross: mid -> {d_cost: [(route,pri,w)]}
    all_routes: dict[str, dict[str, list]] = defaultdict(lambda: defaultdict(list))
    for key, (_ws, _pairs, routes, *_rest) in loaded.items():
        for mid, ents in routes.items():
            for e in ents:
                if e not in all_routes[mid][key]:
                    all_routes[mid][key].append(e)

    pairs_by_key = {k: v[1] for k, v in loaded.items()}

    wb = Workbook()

    # ---- 00_说明 ----
    wsr = wb.active
    wsr.title = "00_说明"
    imported = " · ".join(f"{k}:{len(loaded[k][1])}" for k in sorted(loaded, key=lambda x: FAMILY_ORDER.index(x) if x in FAMILY_ORDER else 99))
    for i, (a, b) in enumerate([
        ("文件名", "商务洽谈折扣总表.xlsx"),
        ("生成", "scripts/rebuild_discount_tier_workbook.py"),
        ("SOP", "discount-tier-workbook-sop.md"),
        ("01_商务洽谈总表", "按成本折：阶梯折（含GM）+ 模型清单"),
        ("02_交叉模型", "宽表 · 跨折同名 · 线路格含 优先级/权重"),
        ("档名", "Standard → Plus → Mid → Growth → Scale → Enterprise"),
        ("已导入", imported),
        ("源 sheet", " / ".join(loaded[k][4] for k in sorted(loaded, key=lambda x: FAMILY_ORDER.index(x) if x in FAMILY_ORDER else 99))),
    ], 1):
        wsr.cell(i, 1, a).font = font(bold=True)
        wsr.cell(i, 2, b).font = font()
    wsr.column_dimensions["A"].width = 18
    wsr.column_dimensions["B"].width = 72

    # ---- 01_商务洽谈总表 ----
    ws = wb.create_sheet("01_商务洽谈总表", 1)
    for col, h in enumerate(TIER_HEADERS, 1):
        cell = ws.cell(1, col, h)
        cell.font = font(bold=True)
        cell.fill = FILL_HEAD
        cell.border = HEAD_BORDER
        cell.alignment = Alignment(wrap_text=True, horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 34

    key_map = {
        0.65: "0.65", 0.60: "0.60", 0.70: "0.70", 0.75: "0.75",
        0.78: "0.78", 0.80: "0.80", 0.85: "0.85", 0.90: "0.90", 0.97: "0.97",
    }
    for i, (d_cost, label, tiers, band, public, noladder) in enumerate(FAMILY_TIERS):
        key = key_map[d_cost]
        pairs = pairs_by_key.get(key, [])
        r = 2 + i
        vals = [
            label,
            *[gm_label(d_cost, t) for t in tiers],
            band,
            len(pairs) if pairs else "—",
            models_cell(pairs),
            public,
        ]
        if d_cost == 0.65:
            fill = FILL_ANCHOR
        elif noladder and pairs:
            fill = FILL_NOLADDER
        elif pairs:
            fill = FILL_FILLED
        else:
            fill = FILL_ALT if i % 2 else FILL_ROW
        for col, v in enumerate(vals, 1):
            cell = ws.cell(r, col, v)
            cell.border = THIN
            cell.fill = fill
            if col == 1:
                cell.font = font(bold=True)
                cell.alignment = Alignment(vertical="top", wrap_text=True)
            elif 2 <= col <= 6:
                cell.font = font()
                cell.alignment = Alignment(vertical="top", horizontal="center", wrap_text=True)
            elif col == 9:
                cell.font = Font(name="Menlo", size=9, color="334155")
                cell.alignment = Alignment(vertical="top", wrap_text=True)
            elif col == 8:
                cell.font = font()
                cell.alignment = Alignment(vertical="top", horizontal="center")
            else:
                cell.font = font(size=9, color="64748B")
                cell.alignment = Alignment(vertical="top", wrap_text=True)
        ws.row_dimensions[r].height = row_height_for(len(pairs)) if pairs else 38

    note_row = 2 + len(FAMILY_TIERS) + 1
    ws.merge_cells(start_row=note_row, start_column=1, end_row=note_row, end_column=10)
    c = ws.cell(
        note_row, 1,
        "说明：档名 Standard→Plus→Mid→Growth→Scale→Enterprise｜档位格=对客折（GM）｜"
        "达档=企业户月消耗刊例·非预存｜Standard<$1k原价｜≥0.95不设阶梯｜"
        "跨成本折同名模型见「02_交叉模型」｜SOP 见 discount-tier-workbook-sop.md｜释义见证据链§3.0",
    )
    c.font = font(size=9, color="713F12")
    c.fill = FILL_HINT
    c.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[note_row].height = 40
    for i, w in enumerate([18, 14, 14, 15, 15, 18, 28, 8, 52, 16], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "B2"

    # ---- 02_交叉模型 ----
    cross_ids = sorted([mid for mid, m in all_routes.items() if len(m) >= 2])
    ws2 = wb.create_sheet("02_交叉模型", 2)
    ws2.merge_cells("A1:H1")
    c = ws2.cell(1, 1, f"02_交叉模型 · 宽表 · 共 {len(cross_ids)} 个（线路格含 优先级/权重）")
    c.font = font(bold=True, size=11, color="991B1B")
    c.fill = FILL_TITLE
    c.alignment = Alignment(vertical="center")
    ws2.row_dimensions[1].height = 24

    ws2.merge_cells("A2:H2")
    c = ws2.cell(
        2, 1,
        "用法：点名先查本表 →「推荐成本折」→ 回 01 读阶梯折。"
        "线路格：线路名 · 优先级/权重。P1 多为默认主路。"
        "推荐：成本折越小越优先（0.65>0.70>0.75>0.78）。P/W 是路由配置，不是商务折依据。",
    )
    c.font = font(size=9, color="713F12")
    c.fill = FILL_HINT
    c.alignment = Alignment(wrap_text=True, vertical="center")
    ws2.row_dimensions[2].height = 48

    headers2 = [
        "Trinity ID", "涉及成本折",
        "线路@0.65", "线路@0.70", "线路@0.75", "线路@0.78",
        "推荐成本折", "商务提示",
    ]
    for col, h in enumerate(headers2, 1):
        cell = ws2.cell(3, col, h)
        cell.font = font(bold=True)
        cell.fill = FILL_HEAD
        cell.border = THIN
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws2.row_dimensions[3].height = 28

    def recommend(families):
        for f in ["0.65", "0.70", "0.75", "0.78", "0.97"]:
            if f in families:
                return f
        return sorted(families)[0]

    def tip(families, rec):
        fs = set(families)
        if fs >= {"0.65", "0.78"} and len(fs) == 2:
            return "厚利 0.65（网聚）优先；0.78 中转站备选（多为 P2）"
        if fs >= {"0.70", "0.75", "0.78"}:
            return "三线并存：优先 P1 所在更厚利族（多为 0.70）；核默认路由后再定 0.75/0.78"
        if fs >= {"0.70", "0.75"} and "0.78" not in fs:
            return "双线：优先 0.70（多为 P1）；0.75 多为 P2 备选/覆盖"
        return f"优先推荐成本折 {rec}；并结合格内 P1/权重看默认路由"

    def fmt_routes(entries):
        return "；".join(f"{route} · {pri}/{w}" for route, pri, w in entries)

    for i, mid in enumerate(cross_ids):
        r = 4 + i
        fam_map = all_routes[mid]
        families = sorted(fam_map.keys(), key=lambda x: FAMILY_ORDER.index(x) if x in FAMILY_ORDER else 99)
        rec = recommend(families)
        route_cells = [fmt_routes(fam_map[f]) if f in fam_map else "" for f in CROSS_ROUTE_COLS]
        vals = [mid, "、".join(families), *route_cells, rec, tip(families, rec)]
        fill = FILL_ANCHOR if "0.65" in fam_map else FILL_ROW
        for col, v in enumerate(vals, 1):
            cell = ws2.cell(r, col, v)
            cell.border = THIN
            cell.fill = FILL_REC if col == 7 else fill
            cell.font = font(bold=True, color="166534") if col == 7 else (
                Font(name="Menlo", size=9, color="334155") if col == 1 or 3 <= col <= 6 else font(size=9)
            )
            cell.alignment = Alignment(
                vertical="center", wrap_text=True,
                horizontal="center" if col in (2, 7) else "left",
            )
        ws2.row_dimensions[r].height = 40

    fr = 4 + len(cross_ids) + 1
    ws2.merge_cells(start_row=fr, start_column=1, end_row=fr, end_column=8)
    c = ws2.cell(
        fr, 1,
        "附：同族多线路（未跨成本折）见对应 src_*（如 0.78 Claude 双线路）。主表 01 不含优先级/权重。",
    )
    c.font = Font(name="PingFang SC", size=9, color="64748B", italic=True)
    c.alignment = Alignment(wrap_text=True)
    ws2.row_dimensions[fr].height = 28
    for i, w in enumerate([22, 16, 28, 24, 28, 24, 12, 46], 1):
        ws2.column_dimensions[get_column_letter(i)].width = w
    ws2.freeze_panes = "B4"

    # ---- src_* ----
    for key in sorted(loaded, key=lambda x: FAMILY_ORDER.index(x) if x in FAMILY_ORDER else 99):
        ws_src, pairs, routes, fname, src_name, label = loaded[key]
        copy_src_sheet(
            wb, src_name, ws_src,
            f"原文件「线路管理」·{label} · {fname} · 销售谈价用 01_商务洽谈总表",
        )

    wb.save(OUT)
    print(f"saved {OUT}")
    print(f"sheets: {wb.sheetnames}")
    print(f"cross models: {len(cross_ids)}")


if __name__ == "__main__":
    build()

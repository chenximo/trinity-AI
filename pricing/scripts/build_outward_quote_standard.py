#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build Trinity L3a outward quote sheet (数据宝形态).

- 目录价绝对价 + 商务阶梯折（Plus→Enterprise）
- 不含缓存命中列
- 不修改 商务洽谈折扣总表.xlsx

Sources:
  - L2 线上刊例: pricing/output/trinity-pricing-text.xlsx
  - 阶梯: pricing/output/商务洽谈折扣总表.xlsx（01 + 02 推荐成本折）
"""
from __future__ import annotations

import re
from datetime import date
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parents[1]
SRC_PRICES = ROOT / "output/trinity-pricing-text.xlsx"
SRC_COMMERCIAL = ROOT / "output/商务洽谈折扣总表.xlsx"
OUT = ROOT / "output/trinity-outward-quote-standard.xlsx"

VENDOR_CN = {
    "anthropic": "Anthropic",
    "openai": "OpenAI",
    "google deepMind": "Google",
    "deepseek": "DeepSeek",
    "moonshot": "月之暗面",
    "minimax": "MiniMax",
    "zhipu": "智谱",
    "智谱": "智谱",
    "tongyi": "阿里云·通义",
    "tencent": "腾讯·混元",
    "豆包": "字节·豆包",
    "GPT": "OpenAI",
    "GK": "GK",
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

# 对外展示的客户档（Standard=目录价列，不重复）
TIERS = [
    ("plus", "≥$1k Plus", 1),
    ("mid", "≥$5k Mid", 2),
    ("growth", "≥$10k Growth", 3),
    ("scale", "≥$50k Scale", 4),
    ("enterprise", "≥$100k Enterprise", 5),
]


def parse_usd(s):
    if not s or s == "—":
        return None
    m = re.search(
        r"入\s*\$([\d.]+)\s*·\s*出\s*\$([\d.]+)(?:\s*·\s*缓\s*\$([\d.]+))?",
        str(s),
    )
    if not m:
        return None
    return float(m.group(1)), float(m.group(2))


def fmt_num(v: float) -> str:
    if abs(v - round(v)) < 1e-9:
        return str(int(round(v)))
    return f"{v:.6f}".rstrip("0").rstrip(".")


def fmt_tier_cell(list_price: float, zhe: float | None) -> str:
    """zhe: 对客折数，如 9.0=九折、10.0=原价；None=无阶梯."""
    if zhe is None:
        return "—"
    if zhe >= 9.999:
        return f"{fmt_num(list_price)} (原价)"
    price = list_price * (zhe / 10.0)
    return f"{fmt_num(price)} ({fmt_num(zhe)}折)"


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
    m = re.match(r"(0\.\d+)", str(label))
    return float(m.group(1)) if m else None


def load_commercial():
    """Return family_tiers[0.65]=[plus,mid,...], model_family[id]=0.65, recommended from 02."""
    wb = openpyxl.load_workbook(SRC_COMMERCIAL, data_only=True)
    ws = wb["01_商务洽谈总表"]
    family_tiers: dict[float, list[float | None]] = {}
    model_families: dict[str, list[float]] = {}

    for row in ws.iter_rows(min_row=2, max_row=15, max_col=10, values_only=True):
        if not row[0]:
            continue
        fam = parse_family_key(row[0])
        if fam is None:
            continue
        tiers = [parse_zhe_cell(row[i]) for i in range(1, 6)]
        family_tiers[fam] = tiers
        models_cell = row[8]
        if not models_cell or str(models_cell).strip() in ("（待补）", "—", "-"):
            continue
        for part in re.split(r"[；;\n]+", str(models_cell)):
            part = part.strip()
            if not part:
                continue
            mid = part.split("：")[0].split(":")[0].strip()
            if not mid:
                continue
            model_families.setdefault(mid, [])
            if fam not in model_families[mid]:
                model_families[mid].append(fam)

    recommended: dict[str, float] = {}
    ws2 = wb["02_交叉模型"]
    for row in ws2.iter_rows(min_row=4, max_row=40, max_col=8, values_only=True):
        if not row[0] or not row[6]:
            continue
        try:
            recommended[str(row[0]).strip()] = float(row[6])
        except (TypeError, ValueError):
            continue

    return family_tiers, model_families, recommended


def resolve_family(
    model_id: str,
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> float | None:
    if model_id in recommended:
        return recommended[model_id]
    fams = model_families.get(model_id)
    if not fams:
        # try without -old / -preview suffixes already exact
        return None
    # 厚利优先：成本折数字越小越优先
    return min(fams)


def load_models():
    wb = openpyxl.load_workbook(SRC_PRICES, data_only=True)
    ws = wb["刊例对比校验-生文"]
    rows = list(ws.iter_rows(values_only=True))
    out = []
    for r in rows[1:]:
        if not r or not r[1] or r[1] == "—":
            continue
        online = parse_usd(r[10])
        if not online:
            continue
        vendor = VENDOR_CN.get(r[3], r[3] or "其他")
        out.append(
            {
                "vendor": vendor,
                "model_id": r[1],
                "display": r[2] or r[1],
                "tier": r[4] or "",
                "inp": online[0],
                "out": online[1],
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


def build():
    models = load_models()
    family_tiers, model_families, recommended = load_commercial()
    today = date.today()
    valid_until = "2026-08-31 24:00"

    thin = Border(
        left=Side(style="thin", color="E4E7EC"),
        right=Side(style="thin", color="E4E7EC"),
        top=Side(style="thin", color="E4E7EC"),
        bottom=Side(style="thin", color="E4E7EC"),
    )
    header_fill = PatternFill("solid", fgColor="1B4F72")
    sub_fill = PatternFill("solid", fgColor="2E86AB")
    alt = PatternFill("solid", fgColor="F8FAFC")
    body_font = Font(name="PingFang SC", size=10)
    num_font = Font(name="Menlo", size=9)
    white_bold = Font(name="PingFang SC", size=10, bold=True, color="FFFFFF")
    center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    left = Alignment(horizontal="left", vertical="center")

    wb = openpyxl.Workbook()

    # ---- 00_说明 ----
    ws0 = wb.active
    ws0.title = "00_说明"
    with_ladder = sum(
        1
        for m in models
        if resolve_family(m["model_id"], model_families, recommended) is not None
        and family_tiers.get(
            resolve_family(m["model_id"], model_families, recommended), [None]
        )
        != [None] * 5
        and any(
            family_tiers.get(
                resolve_family(m["model_id"], model_families, recommended), []
            )
        )
    )
    meta = [
        ("文件", "trinity-outward-quote-standard.xlsx"),
        ("定位", "L3a 对外标准档报价单（销售可发）"),
        ("形态", "数据宝式：厂商×模型×目录价 + 用量阶梯绝对价（标注对客折）"),
        ("不含", "缓存命中列；上游成本折/线路/中转站/GM"),
        ("目录价来源", "L2 线上刊例 · trinity-pricing-text.xlsx「线上刊例」USD"),
        (
            "阶梯来源",
            "商务洽谈折扣总表 01（对客折）× 02 推荐成本折（交叉模型）或 01 模型归属",
        ),
        ("达档口径", "与商务表一致：企业户月消耗按目录价累计（非预存余额）"),
        ("生成日期", today.isoformat()),
        ("有效期（初版暂定）", f"至 {valid_until}；过期请向运营索取新版"),
        ("单位", "USD / 百万 tokens"),
        ("商务表", "保持独立、仅对内；本文件为新建外发表，不覆盖商务表"),
        ("状态", "初版草稿 · 待产品/商务确认后正式外发"),
        (
            "覆盖",
            f"生文有线上刊例 {len(models)} 款；其中已映射商务阶梯约 {with_ladder} 款，其余阶梯列标「—」询价",
        ),
        ("重建", "python3 pricing/scripts/build_outward_quote_standard.py"),
    ]
    ws0["A1"] = "Trinity · 对外标准档报价说明"
    ws0["A1"].font = Font(name="PingFang SC", size=16, bold=True)
    for i, (k, v) in enumerate(meta, start=3):
        ws0.cell(i, 1, k).font = Font(name="PingFang SC", bold=True)
        ws0.cell(i, 2, v).font = Font(name="PingFang SC", size=11)
        ws0.cell(i, 2).alignment = Alignment(wrap_text=True)
    ws0.column_dimensions["A"].width = 18
    ws0.column_dimensions["B"].width = 92

    # ---- 01_标准档目录价 ----
    ws = wb.create_sheet("01_标准档报价", 1)
    # columns: A厂商 B模型ID C显示名 D目录入 E目录出 | F-G Plus | H-I Mid | J-K Growth | L-M Scale | N-O Enterprise
    n_cols = 5 + 2 * len(TIERS)

    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=n_cols)
    ws["A1"] = "Trinity · Token 服务标准档报价单"
    ws["A1"].font = Font(name="PingFang SC", size=18, bold=True, color="1D2939")
    ws.row_dimensions[1].height = 28

    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=n_cols)
    ws["A2"] = (
        f"单位：USD / 百万 tokens　|　有效期：{valid_until}，过期作废，请联系商务获取最新报价。"
        "　阶梯达档：企业户单月累计消耗（按目录价计）；更大用量或合同价请联系商务。"
    )
    ws["A2"].font = Font(name="PingFang SC", size=10, color="475467")
    ws["A2"].alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[2].height = 36

    # header row 4 (tier groups) + row 5 (in/out)
    base_headers = ["厂商", "模型 ID", "显示名", "目录价·输入", "目录价·输出"]
    for i, h in enumerate(base_headers, 1):
        cell = ws.cell(4, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
        ws.merge_cells(start_row=4, start_column=i, end_row=5, end_column=i)

    col = 6
    for key, label, _ in TIERS:
        ws.merge_cells(start_row=4, start_column=col, end_row=4, end_column=col + 1)
        cell = ws.cell(4, col, label)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
        style_cell(
            ws.cell(4, col + 1),
            fill=header_fill,
            font=white_bold,
            align=center,
            border=thin,
        )
        for j, sub in enumerate(["输入", "输出"]):
            c = ws.cell(5, col + j, sub)
            style_cell(c, fill=sub_fill, font=white_bold, align=center, border=thin)
        col += 2

    ws.row_dimensions[4].height = 22
    ws.row_dimensions[5].height = 18

    prev_vendor = None
    for idx, m in enumerate(models):
        r = 6 + idx
        show_vendor = m["vendor"] if m["vendor"] != prev_vendor else ""
        prev_vendor = m["vendor"]
        fam = resolve_family(m["model_id"], model_families, recommended)
        zhes = family_tiers.get(fam) if fam is not None else None

        vals = [
            show_vendor,
            m["model_id"],
            m["display"],
            fmt_num(m["inp"]),
            fmt_num(m["out"]),
        ]
        for ti, (_, _, _) in enumerate(TIERS):
            if not zhes or zhes[ti] is None:
                vals.append("—")
                vals.append("—")
            else:
                vals.append(fmt_tier_cell(m["inp"], zhes[ti]))
                vals.append(fmt_tier_cell(m["out"], zhes[ti]))

        for c, v in enumerate(vals, 1):
            cell = ws.cell(r, c, v)
            style_cell(
                cell,
                font=num_font if c >= 4 else body_font,
                align=center if c == 1 or c >= 4 else left,
                border=thin,
                fill=alt if idx % 2 else None,
            )

    last = 5 + len(models)
    foot = last + 2
    ws.merge_cells(start_row=foot, start_column=1, end_row=foot, end_column=n_cols)
    ws.cell(
        foot,
        1,
        "说明：① 目录价 = 平台标准档刊例；阶梯格 = 目录价 × 对客折（括号内为折数，原价=不打折）。"
        "② 达档按商务表：企业户月消耗目录价金额；开通与合同以商务确认为准。"
        "③ 交叉模型按「02 推荐成本折」取阶梯；未进商务清单的模型阶梯为「—」，请询价。"
        "④ 不含缓存价、成本折、线路与二转；生图/视频另表。"
        "⑤ 正式外发前请运营/商务复核。",
    )
    ws.cell(foot, 1).font = Font(name="PingFang SC", size=9, color="475467")
    ws.cell(foot, 1).alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[foot].height = 72

    widths = [12, 26, 26, 12, 12] + [14, 14] * len(TIERS)
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "F6"

    # ---- 99 ----
    ws99 = wb.create_sheet("99_对内索引_勿外发", 2)
    ws99["A1"] = "勿随客户邮件发送本 Sheet"
    ws99["A1"].font = Font(name="PingFang SC", size=12, bold=True, color="B42318")
    headers99 = ["模型 ID", "厂商", "显示名", "映射成本折", "阶梯来源"]
    for i, h in enumerate(headers99, 1):
        ws99.cell(3, i, h).font = Font(bold=True)
    for i, m in enumerate(models, 4):
        fam = resolve_family(m["model_id"], model_families, recommended)
        src = ""
        if m["model_id"] in recommended:
            src = "02 推荐"
        elif fam is not None:
            src = "01 归属"
        else:
            src = "未映射"
        ws99.cell(i, 1, m["model_id"])
        ws99.cell(i, 2, m["vendor"])
        ws99.cell(i, 3, m["display"])
        ws99.cell(i, 4, fam if fam is not None else "—")
        ws99.cell(i, 5, src)
    for col, w in zip("ABCDE", [28, 14, 28, 12, 12]):
        ws99.column_dimensions[col].width = w

    wb.save(OUT)
    mapped = sum(
        1
        for m in models
        if resolve_family(m["model_id"], model_families, recommended) is not None
    )
    print(f"wrote {OUT} models={len(models)} mapped_family={mapped}")


if __name__ == "__main__":
    build()

"""定制折扣报价表 · 共用 UI（与 hehe / 海外三家同版式）。

列：模态 | 厂商 | 模型 ID | 显示名 | 刊例三列 | 折扣 | 线路（可选）
"""
from __future__ import annotations

import re
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment, Border, Font, Side
from openpyxl.utils import get_column_letter

from build_outward_quote_standard import (
    DISCOUNT_TITLE,
    solid_fill,
    style_cell,
    _write_discount_title_row,
    fmt_tier_zhe,
    ladder_source_label,
    load_commercial,
    public_tiers_for,
    resolve_family,
    SRC_COMMERCIAL,
)
from xlsx_wechat_compat import patch_xlsx_for_wechat

ROOT = Path(__file__).resolve().parents[1]
INTERNAL = ROOT / "output/Trinity模型报价表（内部）.xlsx"
DISCOUNT_MATRIX = ROOT / "output/Trinity折扣矩阵.xlsx"
CLOUD_MAAS = ROOT / "output/云MaaS-上游折扣.xlsx"
COMMERCIAL = SRC_COMMERCIAL

# 临时/客户/场景定制报价 Excel（与 L3a 主表分开存放）
CUSTOM_QUOTES_DIR = ROOT / "output/custom-quotes"

COMMERCIAL_MAIN_SHEETS = (
    "10_商务总表-生文",
    "20_商务总表-生图",
    "30_商务总表-生视频",
)
COMMERCIAL_CROSS_SHEETS = (
    "11_交叉模型-生文",
    "21_交叉模型-生图",
    "31_交叉模型-生视频",
)
# 10_商务总表 五档：$1k/$5k/$10k/$30k/$50k
COMMERCIAL_TIER_50K_IDX = 4
COMMERCIAL_TIER_50K_LABEL = "≥$50k"
PUBLIC_ENTERPRISE_TIER_IDX = 2  # 对外三档末档 ≈ ≥$50k

_commercial_cache: tuple | None = None

# Trinity ID → 折扣矩阵「模型名称」别名（族级行、无字面 slug 时）
MATRIX_MODEL_ALIASES: dict[str, list[str]] = {
    "gpt-5.6-sol": ["GPT全量"],
    "claude-opus-5": ["Claude Opus", "Claude"],
    "seedance-2.0-overseas-hc-os": ["Seedance 2.0", "Seedance 2.1"],
    "deepseek-v4-pro": ["Deepseek-v4", "Deepseek 新版", "Deepseek 旧版"],
}

HEADERS = [
    "模态",
    "厂商",
    "模型 ID",
    "显示名",
    "刊例价·输入",
    "刊例价·输出",
    "刊例价·缓存",
    "折扣",
    "线路",
]
N_COLS = len(HEADERS)

DEFAULT_VENDOR_FILLS = {
    "OpenAI": solid_fill("E8F4FC"),
    "Anthropic": solid_fill("F3E8FF"),
    "Google": solid_fill("E8F8F0"),
    "DeepSeek": solid_fill("E0F2FE"),
    "月之暗面": solid_fill("EDE9FE"),
    "智谱": solid_fill("FCE7F3"),
    "阿里云·通义": solid_fill("D1FAE5"),
    "字节·即梦": solid_fill("FEF3C7"),
}
DEFAULT_ROW_FILL = solid_fill("F8FAFC")


def sheet_styles():
    thin = Border(
        left=Side(style="thin", color="E4E7EC"),
        right=Side(style="thin", color="E4E7EC"),
        top=Side(style="thin", color="E4E7EC"),
        bottom=Side(style="thin", color="E4E7EC"),
    )
    return {
        "thin": thin,
        "header_fill": solid_fill("1B4F72"),
        "body_font": Font(name="PingFang SC", size=10),
        "num_font": Font(name="Menlo", size=9),
        "white_bold": Font(name="PingFang SC", size=10, bold=True, color="FFFFFF"),
        "center": Alignment(horizontal="center", vertical="center", wrap_text=True),
        "left": Alignment(horizontal="left", vertical="center"),
    }


def merge_runs(ws, col: int, keys: list, data_start: int) -> None:
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


def fill_quote_table(
    ws,
    rows: list[dict],
    styles: dict,
    *,
    header_row: int = 2,
    data_start: int = 3,
    include_route: bool = True,
    vendor_fills: dict | None = None,
) -> None:
    thin = styles["thin"]
    header_fill = styles["header_fill"]
    body_font = styles["body_font"]
    num_font = styles["num_font"]
    white_bold = styles["white_bold"]
    center = styles["center"]
    left = styles["left"]
    fills = vendor_fills or DEFAULT_VENDOR_FILLS

    headers = HEADERS if include_route else HEADERS[:-1]
    n_cols = len(headers)

    for i, h in enumerate(headers, 1):
        cell = ws.cell(header_row, i, h)
        style_cell(cell, fill=header_fill, font=white_bold, align=center, border=thin)
    ws.row_dimensions[header_row].height = 24

    for idx, row in enumerate(rows):
        r = data_start + idx
        row_fill = fills.get(row.get("vendor"), DEFAULT_ROW_FILL)
        vals = [
            row["modality"],
            row["vendor"],
            row["model_id"],
            row["display"],
            row["inp"],
            row["out"],
            row["cache"],
            row["zhe"],
        ]
        if include_route:
            vals.append(row.get("route", "—"))
        for c, v in enumerate(vals, 1):
            cell = ws.cell(r, c, v)
            style_cell(
                cell,
                font=num_font if 5 <= c <= 8 else body_font,
                align=center if c == 1 or c >= 5 else left,
                border=thin,
                fill=row_fill,
            )

    merge_runs(ws, 1, [r["modality"] for r in rows], data_start)
    merge_runs(ws, 2, [(r["modality"], r["vendor"]) for r in rows], data_start)
    if include_route:
        merge_runs(ws, 9, [(r["modality"], r["vendor"]) for r in rows], data_start)

    widths = [8, 12, 26, 22, 14, 13, 12, 10, 14]
    if not include_route:
        widths = widths[:-1]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = f"{get_column_letter(n_cols + 1)}{data_start}"


def write_custom_quote_workbook(
    path: Path,
    rows: list[dict],
    *,
    title: str = DISCOUNT_TITLE,
    sheet_name: str = "仅有折扣",
    include_route: bool = True,
    vendor_fills: dict | None = None,
) -> None:
    styles = sheet_styles()
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet_name
    n_cols = N_COLS if include_route else N_COLS - 1
    if title != DISCOUNT_TITLE:
        ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=n_cols)
        ws["A1"] = title
        ws["A1"].font = Font(name="PingFang SC", size=16, bold=True, color="1D2939")
        ws.row_dimensions[1].height = 26
    else:
        _write_discount_title_row(ws, row=1, n_cols=n_cols)
    fill_quote_table(
        ws,
        rows,
        styles,
        include_route=include_route,
        vendor_fills=vendor_fills,
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)
    patch_xlsx_for_wechat(path)


def parse_cost_zhe_number(raw) -> float | None:
    if raw is None:
        return None
    s = str(raw).strip()
    if not s or s in ("—", "原价"):
        return None
    s = s.replace("折", "")
    try:
        return float(s)
    except ValueError:
        return None


def _normalize_slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", str(text).lower())


def matrix_model_match_score(model_id: str, matrix_model: str) -> int:
    """Trinity ID 与折扣矩阵模型名匹配分；越高越「同模型」。"""
    mm = str(matrix_model).strip()
    if not mm:
        return 0
    aliases = MATRIX_MODEL_ALIASES.get(model_id, [])
    if mm in aliases:
        return 100
    mid = _normalize_slug(model_id)
    mn = _normalize_slug(mm)
    if not mid or not mn:
        return 0
    if mid == mn:
        return 100
    if mid in mn or mn in mid:
        return 85
    mid_tokens = {t for t in re.split(r"[-_]+", model_id.lower()) if t}
    mm_tokens = {t for t in re.split(r"[\s\-_]+", mm.lower()) if t}
    overlap = mid_tokens & mm_tokens
    if not overlap:
        return 0
    # 族级名（仅单 token 重合，如 Qwen）弱于专名
    if len(overlap) == 1 and len(mid_tokens) > 1 and len(mm_tokens) == 1:
        return 45
    return 50 + len(overlap) * 10


def iter_discount_matrix_rows() -> list[tuple[str, str, object]]:
    if not DISCOUNT_MATRIX.exists():
        raise FileNotFoundError(DISCOUNT_MATRIX)
    wb = openpyxl.load_workbook(DISCOUNT_MATRIX, read_only=True)
    ws = wb["折扣矩阵"]
    rows: list[tuple[str, str, object]] = []
    current_upstream = ""
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0]:
            current_upstream = str(row[0]).strip()
        model = str(row[1] or "").strip()
        if not model:
            continue
        rows.append((current_upstream, model, row[2]))
    return rows


def resolve_discount_matrix_best_cost(
    model_id: str,
    *,
    matrix_model_hint: str | None = None,
) -> tuple[str, object, str]:
    """
    折扣矩阵：同模型专行优先；多条候选取成本折最低（厚利）。
    返回 (上游名, 成本折原值, 矩阵模型名)。
    """
    scored: list[tuple[int, float, str, str, object]] = []
    for upstream, matrix_model, cost_raw in iter_discount_matrix_rows():
        score = matrix_model_match_score(model_id, matrix_model)
        if matrix_model_hint and matrix_model == matrix_model_hint:
            score = max(score, 100)
        cost_num = parse_cost_zhe_number(cost_raw)
        if score <= 0 or cost_num is None:
            continue
        scored.append((score, cost_num, upstream, matrix_model, cost_raw))

    if not scored:
        raise KeyError(f"discount matrix: no row for {model_id!r}")

    best_score = max(s for s, *_ in scored)
    # 有专名/别名命中时只在最高档内取最低价；否则全体候选取最低价
    pool = [x for x in scored if x[0] == best_score]
    pick = min(pool, key=lambda x: (x[1], x[2]))
    _, _, upstream, matrix_model, cost_raw = pick
    return upstream, cost_raw, matrix_model


def _commercial_bundle() -> tuple[
    dict[float, list[float | None]],
    dict[str, list[float]],
    dict[str, float],
]:
    global _commercial_cache
    if _commercial_cache is None:
        _commercial_cache = load_commercial()
    return _commercial_cache


def _parse_model_route_line(part: str) -> tuple[str, str] | None:
    part = part.strip()
    if not part:
        return None
    for sep in ("：", ":"):
        if sep in part:
            mid, route = part.split(sep, 1)
            mid = mid.strip().rstrip("※").strip()
            route = route.strip()
            if mid and route:
                return mid, route
    return None


def _route_from_commercial_main(model_id: str) -> str | None:
    """10/20/30 商务总表 · 模型（ID※：主线路）。"""
    if not COMMERCIAL.exists():
        return None
    wb = openpyxl.load_workbook(COMMERCIAL, read_only=True)
    for sheet_name in COMMERCIAL_MAIN_SHEETS:
        if sheet_name not in wb.sheetnames:
            continue
        ws = wb[sheet_name]
        for row in ws.iter_rows(min_row=2, values_only=True):
            models_cell = row[8]
            if not models_cell:
                continue
            for part in re.split(r"[；;\n]+", str(models_cell)):
                parsed = _parse_model_route_line(part)
                if parsed and parsed[0] == model_id:
                    return parsed[1]
    return None


def _cross_headers(ws) -> list[str] | None:
    for row in ws.iter_rows(min_row=1, max_row=12, values_only=True):
        if row and str(row[0] or "").strip() == "Trinity ID":
            return [str(c or "").strip() for c in row]
    return None


def _route_from_commercial_cross(model_id: str, fam: float) -> str | None:
    """11/21/31 交叉表 · 线路@{成本族}。"""
    if not COMMERCIAL.exists():
        return None
    wb = openpyxl.load_workbook(COMMERCIAL, read_only=True)
    fam_key = f"线路@{fam}"
    for sheet_name in COMMERCIAL_CROSS_SHEETS:
        if sheet_name not in wb.sheetnames:
            continue
        ws = wb[sheet_name]
        headers = _cross_headers(ws)
        if not headers or fam_key not in headers:
            continue
        fam_col = headers.index(fam_key)
        for row in ws.iter_rows(values_only=True):
            if not row or str(row[0] or "").strip() != model_id:
                continue
            cell = row[fam_col] if fam_col < len(row) else None
            if cell:
                return str(cell).strip()
    return None


def _infer_upstream_from_route_label(route: str) -> str:
    """商务总表线路名 → 折扣矩阵同源上游名（供云 MaaS 线路映射）。"""
    s = str(route).strip()
    if not s or s in ("—", "-"):
        return "—"
    head = s.split("·")[0].strip()
    hl = head.lower()
    if head.startswith("百炼-") or (head.startswith("阿里云百炼") and "新加坡" not in head):
        return "阿里云百炼-国内"
    if "新加坡" in head or "国际" in head and "百炼" in head:
        return "阿里云百炼-国际"
    if hl.startswith("opensand"):
        return "Opensand-国际" if "overseas" in hl or "国际" in head else "Opensand-国内"
    if head.startswith("Wawa-") or head == "Wawa":
        return "Wawa"
    if "深圳晶算" in head or head.startswith("AWS"):
        return "深圳晶算"
    if "网聚" in head or head.startswith("Azure"):
        return "网聚云联"
    if "deepseek官方" in head:
        return "deepseek官方"
    if "TokenHub" in head:
        return "腾讯云Tokenhub"
    return head.split("-")[0] if "-" in head else head


def _commercial_tier_zhe_number(
    model_id: str,
    fam: float | None,
    family_tiers: dict[float, list[float | None]],
    model_families: dict[str, list[float]],
    recommended: dict[str, float],
) -> float | None:
    """先读 10/20/30 族阶梯 ≥$50k；族阶梯待定时回退公开三档末档。"""
    if fam is not None:
        tiers = family_tiers.get(fam)
        if tiers and len(tiers) > COMMERCIAL_TIER_50K_IDX:
            sheet_zhe = tiers[COMMERCIAL_TIER_50K_IDX]
            if sheet_zhe is not None:
                return sheet_zhe
    pub = public_tiers_for(model_id, fam)
    if pub and len(pub) > PUBLIC_ENTERPRISE_TIER_IDX:
        return pub[PUBLIC_ENTERPRISE_TIER_IDX]
    return None


def resolve_commercial_quote(
    model_id: str,
    *,
    uplift: float = 0,
) -> tuple[str, str, str]:
    """
    商务洽谈折扣总表真源：11/21/31 推荐成本折 → 10/20/30 读 ≥$50k 阶梯折。
    uplift：在阶梯折数字上 +0.5（例 5折基准 → 5.5折对客）。
    返回 (对客折扣, 依据说明, 线路用上游名)。
    """
    family_tiers, model_families, recommended = _commercial_bundle()
    fam = resolve_family(model_id, model_families, recommended)
    zhe_num = _commercial_tier_zhe_number(
        model_id, fam, family_tiers, model_families, recommended
    )
    zhe = fmt_tier_zhe(zhe_num)
    if uplift > 0:
        zhe = zhe_from_cost_plus(uplift, zhe_num)

    if fam is None:
        note = "商务总表·未映射"
    else:
        src = ladder_source_label(model_id, fam, recommended)
        base = fmt_tier_zhe(zhe_num)
        note = f"商务总表·族{fam}·{COMMERCIAL_TIER_50K_LABEL}={base}（{src}）"
        if uplift > 0:
            note += f"·+{uplift}"

    route_raw = (
        (_route_from_commercial_cross(model_id, fam) if fam is not None else None)
        or _route_from_commercial_main(model_id)
        or "—"
    )
    upstream = _infer_upstream_from_route_label(route_raw)
    return zhe, note, upstream


def load_cross_recommended_family(model_id: str) -> float | None:
    """11_交叉模型-生文 · 推荐成本折（厚利优先，交叉真源）。"""
    commercial = ROOT / "output/商务洽谈折扣总表.xlsx"
    if not commercial.exists():
        return None
    wb = openpyxl.load_workbook(commercial, read_only=True)
    if "11_交叉模型-生文" not in wb.sheetnames:
        return None
    ws = wb["11_交叉模型-生文"]
    headers = None
    for row in ws.iter_rows(values_only=True):
        if row and row[0] == "Trinity ID":
            headers = list(row)
            continue
        if headers and row[0] == model_id:
            key = "推荐成本折"
            if key not in headers:
                return None
            val = row[headers.index(key)]
            if val is None or str(val).strip() in ("", "—"):
                return None
            try:
                return float(str(val).strip())
            except ValueError:
                return None
    return None


def family_ratio_to_zhe_basis(fam: float) -> float:
    """成本族 0.60 → 折尺度 6；0.65 → 6.5。"""
    return round(float(fam) * 10, 1)


def resolve_customer_zhe_cost_plus05(
    model_id: str,
    *,
    uplift: float = 0.5,
    matrix_model: str | None = None,
    matrix_upstream: str | None = None,
    prefer_cross: bool = True,
) -> tuple[str, str, str]:
    """定制报价：商务总表阶梯折 + uplift（默认 +0.5，5折→5.5折）。"""
    return resolve_commercial_quote(model_id, uplift=uplift)


def zhe_from_cost_plus(delta: float, cost_raw) -> str:
    """成本折 + delta → 对客折数字符串。例：5 + 0.5 → 5.5折。"""
    if isinstance(cost_raw, (int, float)):
        base = float(cost_raw)
    else:
        base = parse_cost_zhe_number(cost_raw)
    if base is None:
        return "原价"
    val = round(base + delta, 1)
    if val >= 10:
        return "原价"
    if abs(val - round(val)) < 1e-9:
        return f"{int(round(val))}折"
    return f"{val}折"


def load_discount_matrix_cost(
    matrix_model: str,
    matrix_upstream: str | None = None,
) -> tuple[str, str]:
    """返回 (上游名, 成本折单元格原值)。"""
    if not DISCOUNT_MATRIX.exists():
        raise FileNotFoundError(DISCOUNT_MATRIX)
    wb = openpyxl.load_workbook(DISCOUNT_MATRIX, read_only=True)
    ws = wb["折扣矩阵"]
    current_upstream = None
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0]:
            current_upstream = str(row[0]).strip()
        model = str(row[1] or "").strip()
        if model != matrix_model:
            continue
        if matrix_upstream and current_upstream != matrix_upstream:
            continue
        cost = row[2]
        return current_upstream or "—", str(cost).strip() if cost else "—"
    raise KeyError(f"matrix row not found: {matrix_model!r} @ {matrix_upstream!r}")


def load_cloud_maas_routes() -> dict[str, str]:
    if not CLOUD_MAAS.exists():
        return {}
    wb = openpyxl.load_workbook(CLOUD_MAAS, read_only=True)
    ws = wb["云MaaS"]
    out: dict[str, str] = {}
    current = None
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0]:
            current = str(row[0]).strip()
        if current:
            out[current] = current
    return out


def maas_route_for_matrix_upstream(upstream: str, maas: dict[str, str]) -> str:
    """折扣矩阵上游名 → 云 MaaS 线路名（给客户看）。"""
    mapping = {
        "网聚云联": "Azure",
        "深圳晶算": "AWS",
        "亿点天下": "AWS",
        "阿里云百炼-国内": "阿里云百炼",
        "阿里云百炼-国际": "阿里云百炼",
        "Opensand-国内": "Opensand",
        "Opensand-国际": "Opensand",
        "Wawa": "Wawa",
        "OpenSand": "Opensand",
        "字节·即梦": "字节·即梦",
    }
    key = mapping.get(upstream, upstream)
    return maas.get(key, upstream)


def load_text_listing(model_id: str) -> dict | None:
    wb = openpyxl.load_workbook(INTERNAL, read_only=True)
    ws = wb["01_生文"]
    vendor = None
    for row in ws.iter_rows(min_row=4, values_only=True):
        if row[0]:
            vendor = row[0]
        if row[1] and str(row[1]).strip() == model_id:
            return {
                "modality": "生文",
                "vendor": vendor,
                "model_id": model_id,
                "display": row[2],
                "inp": row[3],
                "out": row[4],
                "cache": row[5],
            }
    return None


def load_video_listing(model_id: str, prefer_spec: str = "720p") -> dict | None:
    wb = openpyxl.load_workbook(INTERNAL, read_only=True)
    if "03_生视频" not in wb.sheetnames:
        return None
    ws = wb["03_生视频"]
    vendor = None
    candidates = []
    for row in ws.iter_rows(min_row=4, values_only=True):
        if row[0]:
            vendor = row[0]
        if row[1] and str(row[1]).strip() == model_id:
            candidates.append((vendor, row))
    if not candidates:
        return None
    pick = candidates[0]
    for ven, row in candidates:
        if prefer_spec in str(row[3] or ""):
            pick = (ven, row)
            break
    vendor, row = pick
    price = row[5]
    spec = row[3]
    inp = f"{price}（{spec}）" if price and spec else price or "—"
    return {
        "modality": "生视频",
        "vendor": vendor,
        "model_id": model_id,
        "display": row[2],
        "inp": inp,
        "out": "—",
        "cache": "—",
    }

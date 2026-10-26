"""Scan pricing/账单对账/上游对账 for dialogue-produced recon conclusions."""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Any


OVERVIEW_CSV_NAMES = (
    "数据宝vs平台_模型总览_金额+日期",
    "模型总览_金额+日期",
    "模型总览",
)


def _rel(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def _pick_overview_csv(case_dir: Path) -> Path | None:
    csvs = sorted(case_dir.glob("*.csv"))
    for needle in OVERVIEW_CSV_NAMES:
        for p in csvs:
            if needle in p.name and "日模型" not in p.name:
                return p
    # fallback: any *总览*.csv
    for p in csvs:
        if "总览" in p.name:
            return p
    return None


def _pick_overview_md(case_dir: Path) -> Path | None:
    for p in sorted(case_dir.glob("*.md")):
        if "总览" in p.name or "结论" in p.name:
            return p
    mds = sorted(case_dir.glob("*.md"))
    return mds[0] if mds else None


def _pick_daily_csv(case_dir: Path) -> Path | None:
    for p in sorted(case_dir.glob("*.csv")):
        if "日模型" in p.name or "日明细" in p.name:
            return p
    return None


def _read_csv_dicts(path: Path) -> list[dict[str, str]]:
    text = path.read_text(encoding="utf-8-sig")
    return list(csv.DictReader(text.splitlines()))


def _num(v: Any) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(str(v).replace(",", "").replace("+", ""))
    except ValueError:
        return None


def _summarize_from_rows(rows: list[dict[str, Any]]) -> dict[str, Any]:
    up = sum(r.get("upstream_usd") or 0 for r in rows)
    plat = sum(r.get("platform_usd") or 0 for r in rows)
    gap = up - plat
    top = sorted(rows, key=lambda r: abs(r.get("diff_usd") or 0), reverse=True)[:3]
    return {
        "upstream_usd": round(up, 3),
        "platform_usd": round(plat, 3),
        "diff_usd": round(gap, 3),
        "diff_pct_of_platform": round(gap / plat * 100, 2) if plat else None,
        "top_models": [
            {
                "model": t.get("model"),
                "diff_usd": t.get("diff_usd"),
                "share_pct": t.get("share_pct"),
            }
            for t in top
        ],
    }


def _normalize_overview_row(raw: dict[str, str]) -> dict[str, Any]:
    # support both Chinese headers from our export and English aliases
    def g(*keys: str) -> str:
        for k in keys:
            if k in raw and raw[k] is not None:
                return str(raw[k]).strip()
        return ""

    model = g("模型", "model")
    return {
        "model": model,
        "upstream_names": g("上游原名", "upstream_names"),
        "side": g("两侧", "side"),
        "upstream_usd": _num(g("上游USD", "upstream_usd")),
        "platform_usd": _num(g("平台成本USD", "platform_usd")),
        "diff_usd": _num(g("差额USD", "diff_usd")),
        "share_pct": _num(g("占月缺口%", "share_pct")),
        "align_dates": g("对齐日期", "align_dates"),
        "small_gap_dates": g("小差日期", "small_gap_dates"),
        "big_gap_dates": g("大差日期", "big_gap_dates"),
        "calendar": g("日历9/7-30", "日历", "calendar"),
        "conclusion": g("结论", "conclusion"),
    }


def _normalize_daily_row(raw: dict[str, str]) -> dict[str, Any] | None:
    def g(*keys: str) -> str:
        for k in keys:
            if k in raw and raw[k] is not None:
                return str(raw[k]).strip()
        return ""

    date = g("日期", "date")
    model = g("模型映射", "模型", "model")
    if not date or not model:
        return None
    up = _num(g("上游USD", "upstream_usd")) or 0.0
    plat = _num(g("平台成本USD", "platform_usd")) or 0.0
    diff = _num(g("差额USD", "diff_usd"))
    if diff is None:
        diff = up - plat
    return {
        "date": date,
        "model": model,
        "upstream_usd": round(up, 6),
        "platform_usd": round(plat, 6),
        "diff_usd": round(diff, 6),
    }


def build_daily_series(daily_path: Path | None) -> dict[str, Any]:
    """Aggregate *日模型差额* CSV into chart-ready series (totals + per model)."""
    empty = {
        "dates": [],
        "totals": [],
        "models": [],
        "by_model": {},
        "upstream_usage": {},
        "platform_has_tokens": False,
        "usage_note": "",
    }
    if daily_path is None or not daily_path.is_file():
        return empty

    rows: list[dict[str, Any]] = []
    for raw in _read_csv_dicts(daily_path):
        item = _normalize_daily_row(raw)
        if item:
            rows.append(item)
    if not rows:
        return empty

    dates = sorted({r["date"] for r in rows})
    model_names = sorted({r["model"] for r in rows})

    # date -> sums
    totals_map: dict[str, dict[str, float]] = {
        d: {"upstream_usd": 0.0, "platform_usd": 0.0, "diff_usd": 0.0} for d in dates
    }
    by_model: dict[str, dict[str, dict[str, float]]] = {
        m: {d: {"upstream_usd": 0.0, "platform_usd": 0.0, "diff_usd": 0.0} for d in dates}
        for m in model_names
    }
    for r in rows:
        d, m = r["date"], r["model"]
        for key in ("upstream_usd", "platform_usd", "diff_usd"):
            totals_map[d][key] += r[key]
            by_model[m][d][key] += r[key]

    totals = [
        {
            "date": d,
            "upstream_usd": round(totals_map[d]["upstream_usd"], 4),
            "platform_usd": round(totals_map[d]["platform_usd"], 4),
            "diff_usd": round(totals_map[d]["diff_usd"], 4),
        }
        for d in dates
    ]
    by_model_out: dict[str, list[dict[str, Any]]] = {}
    for m in model_names:
        by_model_out[m] = [
            {
                "date": d,
                "upstream_usd": round(by_model[m][d]["upstream_usd"], 4),
                "platform_usd": round(by_model[m][d]["platform_usd"], 4),
                "diff_usd": round(by_model[m][d]["diff_usd"], 4),
            }
            for d in dates
        ]

    return {
        "dates": dates,
        "totals": totals,
        "models": model_names,
        "by_model": by_model_out,
        "upstream_usage": {},
        "platform_has_tokens": False,
        "usage_note": "",
    }


def _pick_upstream_xlsx(case_dir: Path) -> Path | None:
    xlsxs = sorted(
        p
        for p in case_dir.glob("*.xlsx")
        if not p.name.startswith("~") and not p.name.startswith(".")
    )
    for p in xlsxs:
        if "账单" in p.name or "数据宝" in p.name:
            return p
    return xlsxs[0] if xlsxs else None


def _platform_csv_has_tokens(case_dir: Path) -> bool:
    for p in sorted(case_dir.glob("*.csv")):
        if "平台" not in p.name and "platform" not in p.name.lower() and "billing-reconciliation" not in p.name:
            continue
        try:
            rows = _read_csv_dicts(p)
        except Exception:
            continue
        if not rows:
            continue
        keys = set(rows[0].keys())
        if {"输入Token", "输出Token"} & keys or {"prompt_tokens", "completion_tokens"} & keys:
            return True
    return False


def build_upstream_usage(case_dir: Path) -> dict[str, list[dict[str, Any]]]:
    """Parse 数据宝式日账单 xlsx → model → daily calls/tokens/CNY (+ effective ¥/M)."""
    path = _pick_upstream_xlsx(case_dir)
    if path is None:
        return {}
    try:
        from openpyxl import load_workbook
    except ImportError:
        return {}

    wb = load_workbook(path, read_only=True, data_only=True)
    ws = wb[wb.sheetnames[0]]
    rows_iter = ws.iter_rows(values_only=True)
    header = next(rows_iter, None)
    if not header:
        return {}
    # map Chinese headers
    col = {str(h).strip(): i for i, h in enumerate(header) if h is not None}

    def idx(*names: str) -> int | None:
        for n in names:
            if n in col:
                return col[n]
        return None

    i_date = idx("账单日期", "日期")
    i_model = idx("模型")
    i_calls = idx("调用", "请求数")
    i_in = idx("输入 Token", "输入Token")
    i_out = idx("输出 Token", "输出Token")
    i_cache = idx("缓存 Token", "缓存Token")
    i_amt = idx("折扣消耗金额", "消耗金额", "金额")
    if i_date is None or i_model is None:
        return {}

    # model -> date -> agg
    agg: dict[str, dict[str, dict[str, float]]] = {}
    for row in rows_iter:
        if not row or i_model >= len(row):
            continue
        model = str(row[i_model] or "").strip()
        if not model:
            continue
        raw_d = row[i_date]
        if hasattr(raw_d, "strftime"):
            date = raw_d.strftime("%Y-%m-%d")
        else:
            date = str(raw_d or "")[:10]
        if not date:
            continue
        bucket = agg.setdefault(model, {}).setdefault(
            date, {"calls": 0.0, "input_tokens": 0.0, "output_tokens": 0.0, "cache_tokens": 0.0, "cny": 0.0}
        )

        def f(i: int | None) -> float:
            if i is None or i >= len(row) or row[i] is None or row[i] == "":
                return 0.0
            try:
                return float(row[i])
            except (TypeError, ValueError):
                return 0.0

        bucket["calls"] += f(i_calls)
        bucket["input_tokens"] += f(i_in)
        bucket["output_tokens"] += f(i_out)
        bucket["cache_tokens"] += f(i_cache)
        bucket["cny"] += f(i_amt)

    out: dict[str, list[dict[str, Any]]] = {}
    for model, by_date in agg.items():
        points: list[dict[str, Any]] = []
        for date in sorted(by_date):
            b = by_date[date]
            tok = b["input_tokens"] + b["output_tokens"] + b["cache_tokens"]
            tok_m = tok / 1e6
            points.append(
                {
                    "date": date,
                    "calls": int(b["calls"]),
                    "input_tokens": int(b["input_tokens"]),
                    "output_tokens": int(b["output_tokens"]),
                    "cache_tokens": int(b["cache_tokens"]),
                    "tokens_total": int(tok),
                    "tokens_m": round(tok_m, 4),
                    "cny": round(b["cny"], 4),
                    "eff_cny_per_m": round(b["cny"] / tok_m, 4) if tok_m else None,
                }
            )
        out[model] = points
    return out


def attach_usage_to_series(case_dir: Path, series: dict[str, Any]) -> dict[str, Any]:
    usage = build_upstream_usage(case_dir)
    has_plat_tok = _platform_csv_has_tokens(case_dir)
    series = dict(series)
    series["upstream_usage"] = usage
    series["platform_has_tokens"] = has_plat_tok
    if usage and not has_plat_tok:
        series["usage_note"] = (
            "上游账单已解析调用/Token；当前平台导出无 Token/请求列，"
            "只能看金额差，无法判定是量差还是单价差。请重新导出含「输入Token/输出Token」的对账表后再比。"
        )
    elif usage and has_plat_tok:
        series["usage_note"] = "两侧均有 Token，可按量差/价差拆解（后续版本）。"
    elif not usage:
        series["usage_note"] = "目录内无上游日账单 xlsx，暂无调用/Token 明细。"
    return series


def list_upstream_reports(recon_dir: Path, repo_root: Path) -> list[dict[str, Any]]:
    upstream = recon_dir / "上游对账"
    if not upstream.is_dir():
        return []

    reports: list[dict[str, Any]] = []
    for supplier_dir in sorted(upstream.iterdir()):
        if not supplier_dir.is_dir() or supplier_dir.name.startswith("."):
            continue
        for period_dir in sorted(supplier_dir.iterdir(), reverse=True):
            if not period_dir.is_dir() or period_dir.name.startswith("."):
                continue
            overview = _pick_overview_csv(period_dir)
            if overview is None:
                # still list if md exists
                md = _pick_overview_md(period_dir)
                if md is None:
                    continue
            else:
                md = _pick_overview_md(period_dir)
            daily = _pick_daily_csv(period_dir)
            rows: list[dict[str, Any]] = []
            if overview is not None:
                rows = [_normalize_overview_row(r) for r in _read_csv_dicts(overview)]
            summary = _summarize_from_rows(rows) if rows else {}
            # headline from md first line after title if present
            headline = ""
            if md is not None:
                for line in md.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if line.startswith("合计") or "差额" in line and "$" in line:
                        headline = line.replace("**", "")
                        break
            if not headline and summary:
                headline = (
                    f"上游 ${summary.get('upstream_usd')} · 平台 ${summary.get('platform_usd')} · "
                    f"差额 ${summary.get('diff_usd')}"
                )
            report_id = f"{supplier_dir.name}/{period_dir.name}"
            if overview is not None:
                status, status_label = "concluded", "已出结论"
            elif md is not None:
                status, status_label = "legacy", "历史文档"
                if not headline:
                    headline = "（旧版 md，无模型总览表）"
            else:
                status, status_label = "draft", "草稿"
            reports.append(
                {
                    "id": report_id,
                    "supplier": supplier_dir.name,
                    "period": period_dir.name,
                    "path": _rel(period_dir, repo_root),
                    "headline": headline,
                    "has_overview": overview is not None,
                    "has_daily": daily is not None,
                    "has_md": md is not None,
                    "overview_file": overview.name if overview else None,
                    "daily_file": daily.name if daily else None,
                    "md_file": md.name if md else None,
                    "summary": summary,
                    "status": status,
                    "status_label": status_label,
                }
            )
    # overview-first, then period desc
    reports.sort(
        key=lambda r: (
            0 if r["has_overview"] else 1,
            r["supplier"],
            r["period"],
        )
    )
    return reports


def get_upstream_report(
    recon_dir: Path, repo_root: Path, supplier: str, period: str
) -> dict[str, Any] | None:
    case_dir = recon_dir / "上游对账" / supplier / period
    if not case_dir.is_dir():
        return None
    overview = _pick_overview_csv(case_dir)
    md = _pick_overview_md(case_dir)
    daily = _pick_daily_csv(case_dir)
    rows: list[dict[str, Any]] = []
    if overview is not None:
        rows = [_normalize_overview_row(r) for r in _read_csv_dicts(overview)]
    summary = _summarize_from_rows(rows) if rows else {}
    md_text = md.read_text(encoding="utf-8") if md else ""
    # strip first heading for cleaner UI if needed
    md_body = md_text
    files = sorted(
        p.name
        for p in case_dir.iterdir()
        if p.is_file() and not p.name.startswith(".") and p.name != ".DS_Store"
    )
    daily_series = attach_usage_to_series(case_dir, build_daily_series(daily))
    return {
        "id": f"{supplier}/{period}",
        "supplier": supplier,
        "period": period,
        "path": _rel(case_dir, repo_root),
        "status": "concluded",
        "status_label": "已出结论",
        "summary": summary,
        "models": rows,
        "md_text": md_body,
        "files": files,
        "overview_file": overview.name if overview else None,
        "daily_file": daily.name if daily else None,
        "md_file": md.name if md else None,
        "daily_series": daily_series,
        "calendar_legend": "每位对应账期内一天：✓对齐 · ~小差 · ✗大差 · ·无量",
        "note": "分析在对话中完成；本页只展示已落盘结论。",
    }

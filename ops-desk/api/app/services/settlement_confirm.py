"""云服务确认单 PDF（按公司 × 月份；明细表头对齐客户结算原表）。"""

from __future__ import annotations

import calendar
import io
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import List, Optional, Sequence, Tuple

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.db import connect
from app.schemas import CloudLedgerRow
from app.services.customers import settlement_customer_to_id

PROVIDER_NAME = "陕西星瀚算力信息科技有限公司"

_FONT_REGISTERED = False
_FONT_NAME = "Helvetica"
_MARK_FONT_REGISTERED = False
_MARK_FONT_NAME = "Helvetica"


def _register_font() -> str:
    global _FONT_REGISTERED, _FONT_NAME
    if _FONT_REGISTERED:
        return _FONT_NAME
    candidates = [
        ("/System/Library/Fonts/Supplemental/Songti.ttc", 0),
        ("/System/Library/Fonts/PingFang.ttc", 0),
        ("/Library/Fonts/Arial Unicode.ttf", None),
    ]
    for path, sub in candidates:
        p = Path(path)
        if not p.is_file():
            continue
        try:
            if sub is None:
                pdfmetrics.registerFont(TTFont("SettleCN", str(p)))
            else:
                pdfmetrics.registerFont(TTFont("SettleCN", str(p), subfontIndex=sub))
            _FONT_NAME = "SettleCN"
            _FONT_REGISTERED = True
            return _FONT_NAME
        except Exception:
            continue
    _FONT_REGISTERED = True
    return _FONT_NAME


def _register_mark_font() -> str:
    """勾选符号用 Arial Unicode（宋体无 ☑/✓ 字形；彩色 emoji ✅ 也不适合打印 PDF）。"""
    global _MARK_FONT_REGISTERED, _MARK_FONT_NAME
    if _MARK_FONT_REGISTERED:
        return _MARK_FONT_NAME
    for path in (
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ):
        p = Path(path)
        if not p.is_file():
            continue
        try:
            pdfmetrics.registerFont(TTFont("SettleMark", str(p)))
            _MARK_FONT_NAME = "SettleMark"
            _MARK_FONT_REGISTERED = True
            return _MARK_FONT_NAME
        except Exception:
            continue
    _MARK_FONT_REGISTERED = True
    return _MARK_FONT_NAME


def billing_mode_markup(*, both_checked: bool = True, pay_as_you_go: bool = True) -> str:
    """方框勾选：默认两项均 ☑；也可只勾其一。"""
    mark = _register_mark_font()
    checked = f'<font name="{mark}">☑</font>'
    empty = f'<font name="{mark}">□</font>'
    if both_checked:
        return f"{checked} 按量计费　　{checked} 包周期计费"
    if pay_as_you_go:
        return f"{checked} 按量计费　　{empty} 包周期计费"
    return f"{empty} 按量计费　　{checked} 包周期计费"


def period_to_range(period: str) -> Tuple[str, str, str, str]:
    """YYYYMM → (展示起, 展示止, period, 账单日起 YYYYMMDD)."""
    p = period.strip()
    if not re.fullmatch(r"\d{6}", p):
        raise ValueError("period 须为 YYYYMM")
    y, m = int(p[:4]), int(p[4:6])
    if m < 1 or m > 12:
        raise ValueError("非法月份")
    last = calendar.monthrange(y, m)[1]
    start = f"{y}年{m:02d}月01日"
    end = f"{y}年{m:02d}月{last:02d}日"
    start_ymd = f"{y}{m:02d}01"
    return start, end, p, start_ymd


def resolve_buyer_name(customer_label: str) -> str:
    """结算表客户标签 → 乙方全称（优先 customers 表）。"""
    cid = settlement_customer_to_id(customer_label)
    if cid:
        with connect() as conn:
            row = conn.execute("SELECT name FROM customers WHERE id = ?", (cid,)).fetchone()
            if row and row["name"]:
                name = str(row["name"]).strip()
                if cid == "hehe" and ("远景" in name or name.lower() == "hehe"):
                    return "西安远景网络科技有限公司（hehe）"
                return name
    label = (customer_label or "").strip()
    aliases = {
        "亿点": "亿点宇宙（陕西）信息科技有限公司",
        "山河（BID）": "北京山河聚量科技有限公司",
        "山河": "北京山河聚量科技有限公司",
        "星瀚": "星瀚",
        "hehe": "西安远景网络科技有限公司（hehe）",
    }
    return aliases.get(label, label)


def _money(n: Optional[float]) -> str:
    if n is None:
        return "—"
    return f"{n:,.2f}"


@dataclass
class ConfirmLine:
    period: str
    cloud: str
    account: str
    consume: Optional[float]
    fee_ratio: str
    fee_amount: Optional[float]
    settle_total: Optional[float]
    remark: str
    currency: str = "CNY"


@dataclass
class SettlementConfirmData:
    customer_label: str
    buyer_name: str
    period: str
    period_start: str
    period_end: str
    period_start_ymd: str
    issue_date: str
    billing_mode: str
    lines: List[ConfirmLine]
    subtotal_consume: float
    subtotal_fee: float
    subtotal_settle: float
    usd_notes: List[str]


def build_confirm_data(
    rows: Sequence[CloudLedgerRow],
    *,
    customer: str,
    period: str,
    issue: Optional[date] = None,
) -> SettlementConfirmData:
    start, end, period_norm, start_ymd = period_to_range(period)
    filtered = [
        r
        for r in rows
        if r.customer == customer and r.period == period_norm and (r.settle_total or 0) != 0
    ]
    if not filtered:
        raise ValueError(f"无数据：{customer} / {period_norm}")

    # 一行一账号：云厂商 / 账号信息分列（对齐客户结算「明细」）
    # 境外 USD（Akamai 等）不进本确认单——内部票夹路径/发票号仅台账用，不对客展示
    lines: List[ConfirmLine] = []
    usd_skipped = 0
    for r in sorted(filtered, key=lambda x: (x.cloud, x.account or "")):
        cur = (r.currency or ("USD" if r.cloud == "Akamai" else "CNY")).upper()
        cloud = (r.cloud or "").strip() or "—"
        account = (r.account or "").strip() or "—"
        if cur == "USD":
            usd_skipped += 1
            continue
        fee_ratio = (r.fee_ratio or "无").strip() or "无"
        if fee_ratio in ("-", "—"):
            fee_ratio = "无"
        fee_amt = r.fee_amount
        if fee_ratio == "无" and not fee_amt:
            fee_amt = None
        # 对客备注：去掉内部路径类文案
        remark = (r.remark or "").strip() or "真实消耗已预充值"
        if "票见" in remark or "AI云业务/" in remark or "未换汇" in remark:
            remark = "真实消耗已预充值"
        lines.append(
            ConfirmLine(
                period=period_norm,
                cloud=cloud,
                account=account,
                consume=r.consume,
                fee_ratio=fee_ratio,
                fee_amount=fee_amt,
                settle_total=r.settle_total,
                remark=remark,
                currency="CNY",
            )
        )

    if not lines:
        raise ValueError(
            f"无人民币结算行可出具确认单：{customer} / {period_norm}"
            + (f"（已跳过 {usd_skipped} 条境外 USD）" if usd_skipped else "")
        )

    sub_c = round(sum(l.consume or 0 for l in lines), 2)
    sub_f = round(sum(l.fee_amount or 0 for l in lines), 2)
    sub_s = round(sum(l.settle_total or 0 for l in lines), 2)
    # 出具日期：账期次月 8 日（可被显式 issue 覆盖）
    if issue is None:
        y, m = int(period_norm[:4]), int(period_norm[4:6])
        if m == 12:
            issue_d = date(y + 1, 1, 8)
        else:
            issue_d = date(y, m + 1, 8)
    else:
        issue_d = issue
    return SettlementConfirmData(
        customer_label=customer,
        buyer_name=resolve_buyer_name(customer),
        period=period_norm,
        period_start=start,
        period_end=end,
        period_start_ymd=start_ymd,
        issue_date=f"{issue_d.year}年{issue_d.month:02d}月{issue_d.day:02d}日",
        billing_mode=billing_mode_markup(both_checked=True),
        lines=lines,
        subtotal_consume=sub_c,
        subtotal_fee=sub_f,
        subtotal_settle=sub_s,
        usd_notes=[],
    )


def render_settlement_confirm_pdf(data: SettlementConfirmData) -> bytes:
    font = _register_font()
    _register_mark_font()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title=f"云服务确认单-{data.buyer_name}-{data.period_start_ymd}",
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "title_cn",
        parent=styles["Title"],
        fontName=font,
        fontSize=16,
        leading=22,
        alignment=TA_CENTER,
        spaceAfter=10,
    )
    body = ParagraphStyle(
        "body_cn",
        parent=styles["Normal"],
        fontName=font,
        fontSize=10.5,
        leading=16,
        alignment=TA_LEFT,
    )
    small = ParagraphStyle(
        "small_cn",
        parent=body,
        fontSize=9.5,
        leading=14,
    )
    right = ParagraphStyle(
        "right_cn",
        parent=body,
        alignment=TA_RIGHT,
    )
    cell = ParagraphStyle(
        "cell_cn",
        parent=body,
        fontSize=8.5,
        leading=11,
    )
    head_cell = ParagraphStyle(
        "head_cn",
        parent=cell,
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
    )

    story: list = []
    story.append(Paragraph("云服务确认单", title_style))
    story.append(Spacer(1, 3 * mm))

    meta = [
        [Paragraph("<b>项目</b>", cell), Paragraph("<b>单位信息</b>", cell)],
        ["服务提供方（甲方）", PROVIDER_NAME],
        ["客户单位（乙方）", data.buyer_name],
        ["结算周期", f"{data.period_start} 至 {data.period_end}"],
        ["计费模式", Paragraph(data.billing_mode, body)],
        ["出具日期", data.issue_date],
    ]
    meta_t = Table(meta, colWidths=[40 * mm, 136 * mm])
    meta_t.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), font),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#333333")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F2F4F7")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(meta_t)
    story.append(Spacer(1, 5 * mm))

    # 表头对齐客户结算「明细」；金额列货币单位整块换行，避免「（￥）」被拆开
    def _h(text: str) -> Paragraph:
        return Paragraph(f"<b>{text}</b>", head_cell)

    header = [
        _h("业务所属期"),
        _h("云厂商"),
        _h("账号信息"),
        _h("实际消耗<br/>（￥）"),
        _h("服务费<br/>比例"),
        _h("服务费金额<br/>（￥）"),
        _h("结算总金额<br/>（￥）"),
        _h("备注"),
    ]
    table_data = [header]
    for line in data.lines:
        fee_disp = "—" if line.fee_amount is None and line.fee_ratio == "无" else _money(line.fee_amount)
        if line.fee_ratio == "无" and line.fee_amount is None:
            fee_disp = "—"
        table_data.append(
            [
                line.period,
                Paragraph(line.cloud or "—", cell),
                Paragraph(line.account or "—", cell),
                _money(line.consume),
                line.fee_ratio,
                fee_disp,
                _money(line.settle_total),
                Paragraph(line.remark or "", cell),
            ]
        )
    while len(table_data) < 4:
        table_data.append(["", "", "", "", "", "", "", ""])
    table_data.append(
        [
            Paragraph("<b>合计</b>", cell),
            "",
            "",
            Paragraph(f"<b>{_money(data.subtotal_consume)}</b>", cell),
            "",
            Paragraph(f"<b>{_money(data.subtotal_fee) if data.subtotal_fee else '—'}</b>", cell),
            Paragraph(f"<b>{_money(data.subtotal_settle)}</b>", cell),
            "",
        ]
    )

    detail = Table(
        table_data,
        colWidths=[18 * mm, 14 * mm, 30 * mm, 26 * mm, 16 * mm, 26 * mm, 26 * mm, 20 * mm],
    )
    detail.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), font),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#333333")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F2F4F7")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("ALIGN", (0, 1), (1, -1), "CENTER"),
                ("ALIGN", (3, 1), (6, -1), "RIGHT"),
                ("ALIGN", (4, 1), (4, -1), "CENTER"),
                ("SPAN", (0, -1), (2, -1)),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(detail)
    story.append(Spacer(1, 5 * mm))

    notes = [
        "说明：",
        "1、本单据为我司出具的本期云资源消耗结算单，供贵司核对；",
        "2、请贵司在收到本单 3 个工作日内核对，如有异议请书面反馈；逾期未提出异议，视为认可本结算单数据；",
        "3、核对无误后，我司将按本结算金额开具 6% 增值税发票。",
    ]
    for n in notes:
        story.append(Paragraph(n, small))

    story.append(Spacer(1, 12 * mm))
    story.append(Paragraph(PROVIDER_NAME, right))

    doc.build(story)
    return buf.getvalue()


def export_filename(data: SettlementConfirmData) -> str:
    """云服务确认单_{公司}_{账单日起}.pdf"""
    safe_buyer = re.sub(r'[\\/:*?"<>|]+', "_", data.buyer_name)
    return f"云服务确认单_{safe_buyer}_{data.period_start_ymd}.pdf"


def save_pdf(data: SettlementConfirmData, pdf_bytes: bytes, export_dir: Path) -> Path:
    out_dir = export_dir / data.customer_label / data.period
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / export_filename(data)
    path.write_bytes(pdf_bytes)
    # 清理旧命名
    for old in out_dir.glob("结算确认单_*.pdf"):
        if old != path:
            try:
                old.unlink()
            except OSError:
                pass
    return path

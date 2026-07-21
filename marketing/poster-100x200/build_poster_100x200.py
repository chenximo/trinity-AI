#!/usr/bin/env python3
"""Build Trinity 100×200 cm promotional poster PDF."""
from __future__ import annotations

from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output" / "Trinity-100x200推广素材-V1.2.pdf"
WORDMARK = ROOT / "assets" / "trinity-wordmark.png"
QR = ROOT / "assets" / "poster-qr.png"

W = 1000 / 25.4 * 72
H = 2000 / 25.4 * 72

CYAN = (0 / 255, 194 / 255, 247 / 255)
INK = (11 / 255, 42 / 255, 58 / 255)
INK2 = (26 / 255, 74 / 255, 92 / 255)
MUTED = (74 / 255, 107 / 255, 120 / 255)
CARD = (232 / 255, 249 / 255, 254 / 255)
LINE = (180 / 255, 230 / 255, 242 / 255)
MINT = (216 / 255, 243 / 255, 239 / 255)
WHITE = (1, 1, 1)
BG = (247 / 255, 252 / 255, 251 / 255)

# Built-in CJK fonts (Unicode-mapped)
FN = "china-s"
FN_B = "china-ss"


def mm(v: float) -> float:
    return v / 25.4 * 72


def tw(text: str, size: float, bold: bool = False) -> float:
    return fitz.get_text_length(text, fontname=FN_B if bold else FN, fontsize=size)


def rrect(page: fitz.Page, rect: fitz.Rect, fill=None, stroke=None, width: float = 1.2, radius: float = 0.15) -> None:
    page.draw_rect(rect, color=stroke, fill=fill, width=width, radius=min(radius, 0.5))


def txt(
    page: fitz.Page,
    x: float,
    y: float,
    text: str,
    size: float,
    color=INK,
    align: int = 0,
    bold: bool = False,
) -> None:
    fn = FN_B if bold else FN
    x0 = x
    if align == 1:
        x0 = x - tw(text, size, bold) / 2
    elif align == 2:
        x0 = x - tw(text, size, bold)
    page.insert_text(fitz.Point(x0, y), text, fontname=fn, fontsize=size, color=color)


def wrap_txt(
    page: fitz.Page,
    x: float,
    y: float,
    text: str,
    size: float,
    max_w: float,
    color=MUTED,
    leading: float = 1.4,
    bold: bool = False,
) -> float:
    fn = FN_B if bold else FN
    line = ""
    yy = y
    for ch in text:
        trial = line + ch
        if fitz.get_text_length(trial, fontname=fn, fontsize=size) <= max_w:
            line = trial
        else:
            if line:
                page.insert_text(fitz.Point(x, yy), line, fontname=fn, fontsize=size, color=color)
                yy += size * leading
            line = ch
    if line:
        page.insert_text(fitz.Point(x, yy), line, fontname=fn, fontsize=size, color=color)
        yy += size * leading
    return yy


def draw_grid(page: fitz.Page) -> None:
    page.draw_rect(page.rect, color=None, fill=BG, overlay=False)
    step = mm(16)
    for x in range(0, int(W) + 1, int(step)):
        page.draw_line(fitz.Point(x, 0), fitz.Point(x, H), color=CYAN, width=0.35, stroke_opacity=0.07)
    for y in range(0, int(H) + 1, int(step)):
        page.draw_line(fitz.Point(0, y), fitz.Point(W, y), color=CYAN, width=0.35, stroke_opacity=0.07)


def pill(page: fitz.Page, cx: float, baseline_y: float, text: str, size: float) -> None:
    pad_x, pad_y = size * 1.15, size * 0.55
    w = tw(text, size, True)
    r = fitz.Rect(cx - w / 2 - pad_x, baseline_y - size - pad_y * 0.15, cx + w / 2 + pad_x, baseline_y + pad_y * 0.85)
    rrect(page, r, fill=WHITE, stroke=CYAN, width=2.0, radius=0.5)
    txt(page, cx, baseline_y, text, size, CYAN, align=1, bold=True)


def metric(page: fitz.Page, rect: fitz.Rect, value: str, label: str) -> None:
    rrect(page, rect, fill=WHITE, stroke=LINE, width=1.0, radius=0.18)
    txt(page, rect.x0 + rect.width / 2, rect.y0 + rect.height * 0.48, value, mm(15.5), CYAN, 1, True)
    txt(page, rect.x0 + rect.width / 2, rect.y0 + rect.height * 0.78, label, mm(8), MUTED, 1)


def chip(page: fitz.Page, x: float, y: float, text: str, accent: bool = False) -> float:
    size = mm(7.2)
    h = mm(11.5)
    w = tw(text, size, True) + mm(13)
    r = fitz.Rect(x, y, x + w, y + h)
    stroke = CYAN if accent else (0.55, 0.62, 0.66)
    color = CYAN if accent else INK2
    rrect(page, r, fill=WHITE, stroke=stroke, width=1.4, radius=0.5)
    txt(page, r.x0 + r.width / 2, r.y0 + h * 0.72, text, size, color, 1, True)
    return r.x1 + mm(3.5)


def chips_row(page: fitz.Page, items: list[str], y: float, accent: bool, margin_x: float, content_w: float) -> float:
    size = mm(7.2)
    widths = [tw(t, size, True) + mm(13) for t in items]
    total = sum(widths) + mm(3.5) * (len(items) - 1)
    x = margin_x + (content_w - total) / 2
    for t in items:
        x = chip(page, x, y, t, accent=accent)
    return y + mm(11.5)


def build() -> None:
    doc = fitz.open()
    page = doc.new_page(width=W, height=H)
    draw_grid(page)

    mx = mm(48)
    cw = W - mx * 2
    y = mm(38)

    # Wordmark top-left
    wm_h = mm(40)
    wm_w = wm_h * (3164 / 606)
    page.insert_image(fitz.Rect(mx, y, mx + wm_w, y + wm_h), filename=str(WORDMARK), keep_proportion=True)
    y += wm_h + mm(28)

    # Hero
    pill(page, W / 2, y + mm(8), "企业级算力服务", mm(11))
    y += mm(32)

    title = mm(30)
    parts = [("云资源集采 ", INK), ("×", CYAN), (" AI算力聚合", INK)]
    total = sum(tw(t, title, True) for t, _ in parts)
    cx = W / 2 - total / 2
    for t, c in parts:
        page.insert_text(fitz.Point(cx, y), t, fontname=FN_B, fontsize=title, color=c)
        cx += tw(t, title, True)
    y += title * 1.28

    parts = [("双引擎", CYAN), ("赋能企业", INK)]
    total = sum(tw(t, title, True) for t, _ in parts)
    cx = W / 2 - total / 2
    for t, c in parts:
        page.insert_text(fitz.Point(cx, y), t, fontname=FN_B, fontsize=title, color=c)
        cx += tw(t, title, True)
    y += title * 1.35

    sub = mm(12)
    for s in ["以集团采购体量撬动云厂商顶级折扣", "以统一API接入全球顶尖AI模型"]:
        txt(page, W / 2, y, s, sub, MUTED, 1)
        y += sub * 1.5
    y += mm(20)

    # Footer reserved at bottom; AI card expands into remaining space
    footer_block = mm(145)
    cards_bottom = H - mm(36) - footer_block
    cards_top = y
    gap_cards = mm(16)

    pad = mm(16)
    gap = mm(8)
    mh = mm(46)
    mw = (cw - pad * 2 - gap * 2) / 3
    bsize = mm(10.5)
    # Cloud card: height from content (avoid large empty bottom)
    c1_h = mm(14) + mm(24) + mh + mm(12) + bsize * 1.58 * 4 + mm(8) + mm(12) + mm(18)
    c2_h = cards_bottom - cards_top - c1_h - gap_cards
    if c2_h < mm(400):
        # if too tight, shrink cloud slightly
        c1_h = max(mm(260), c1_h - (mm(400) - c2_h))
        c2_h = cards_bottom - cards_top - c1_h - gap_cards


    def card_header(top: float, title_zh: str, title_en: str, ico: str) -> float:
        ico_r = fitz.Rect(mx + pad, top, mx + pad + mm(17), top + mm(17))
        rrect(page, ico_r, fill=CYAN, stroke=None, radius=0.22)
        txt(page, ico_r.x0 + ico_r.width / 2, ico_r.y0 + mm(12), ico, mm(8), WHITE, 1, True)
        txt(page, ico_r.x1 + mm(7), top + mm(8.5), title_zh, mm(15), INK, bold=True)
        txt(page, ico_r.x1 + mm(7), top + mm(16), title_en, mm(7), CYAN, bold=True)
        return top + mm(24)

    def bullets(cy: float, items: list[tuple[str, str]]) -> float:
        for bold, rest in items:
            bx = mx + pad
            page.insert_text(fitz.Point(bx, cy), "▸", fontname=FN_B, fontsize=bsize, color=CYAN)
            bx += mm(9)
            page.insert_text(fitz.Point(bx, cy), bold, fontname=FN_B, fontsize=bsize, color=INK)
            bx += tw(bold, bsize, True)
            page.insert_text(fitz.Point(bx, cy), rest, fontname=FN, fontsize=bsize, color=INK2)
            cy += bsize * 1.58
        return cy

    # Card 1 — Cloud
    c1_top = cards_top
    rrect(page, fitz.Rect(mx, c1_top, mx + cw, c1_top + c1_h), fill=CARD, stroke=LINE, width=1.4, radius=0.035)
    cy = card_header(c1_top + mm(14), "云资源集采整合", "CLOUD PROCUREMENT", "云")
    for i, (v, l) in enumerate([("20-40%", "云成本直降"), ("专属折扣", "详询报价"), ("1-3天", "快速开通")]):
        r = fitz.Rect(mx + pad + i * (mw + gap), cy, mx + pad + i * (mw + gap) + mw, cy + mh)
        metric(page, r, v, l)
    cy += mh + mm(12)
    cy = bullets(
        cy,
        [
            ("零门槛 · 零保底 · 零承诺", "，无年框无锁定，按需使用"),
            ("透明计费", "，按实际消耗计费+固定服务费，不赚差价"),
            ("VIP 7×24", " 专属技术保障，问题优先处理通道"),
            ("免费增值", "：上云咨询 · 架构设计 · 成本优化全托管"),
        ],
    )
    cy += mm(8)
    chips_row(page, ["阿里云", "腾讯云", "华为云", "AWS", "Azure", "Google Cloud"], cy, False, mx, cw)

    # Card 2 — AI
    c2_top = c1_top + c1_h + gap_cards
    rrect(page, fitz.Rect(mx, c2_top, mx + cw, c2_top + c2_h), fill=CARD, stroke=LINE, width=1.4, radius=0.03)
    cy = card_header(c2_top + mm(14), "Trinity AI · AI API聚合", "AI API AGGREGATION PLATFORM", "AI")
    for i, (v, l) in enumerate([("1个API", "接入全球模型"), ("显著", "缩短开发周期"), ("99.9%", "可用性 SLA")]):
        r = fitz.Rect(mx + pad + i * (mw + gap), cy, mx + pad + i * (mw + gap) + mw, cy + mh)
        metric(page, r, v, l)
    cy += mh + mm(12)
    cy = bullets(
        cy,
        [
            ("统一API入口", "，兼容OpenAI格式，零迁移成本"),
            ("全模态覆盖", "：大语言模型 + 文生图 + 文生视频"),
            ("纯转发 · 零存储 · 保隐私", "，不存储任何请求响应数据"),
            ("全球加速网络", "，低延迟高稳定，SLA保障"),
        ],
    )
    cy += mm(10)

    values = [
        ("一个 API，覆盖多类模型能力", "文本对话、AI Coding、图文与视频等多模态统一调用；按场景给出推荐，选型更直接。"),
        ("开发成本可控：auto 智能路由 + Trinity Memory", "auto 按题路由到更合适、更省的模型（预计约省 50% 开发成本）；Memory 本地建图谱，索引 Token 预计约省 70%。"),
        ("企业级团队管控：分区、成员与 API Key", "业务分区、成员权限、批量创建并一键下发 API Key，适配团队规模化使用。"),
        ("AI Coding 一键接入：常用 IDE 快速配置", "安装 Node 与 IDE 后一键写入配置，覆盖 Claude Code / Codex / OpenCode 等。"),
    ]
    # value box fills remaining card space above chips
    chips_h = mm(36)
    box_bottom = c2_top + c2_h - chips_h - mm(14)
    box = fitz.Rect(mx + pad, cy, mx + cw - pad, box_bottom)
    rrect(page, box, fill=MINT, stroke=(0.78, 0.90, 0.87), width=1.0, radius=0.05)
    txt(page, box.x0 + mm(10), box.y0 + mm(15), "增值服务", mm(12.5), INK, bold=True)

    cg = mm(7)
    cell_w = (box.width - mm(20) - cg) / 2
    cell_h = (box.height - mm(30) - cg) / 2
    grid_y = box.y0 + mm(24)
    for i, (title_v, desc) in enumerate(values):
        col, row = i % 2, i // 2
        x0 = box.x0 + mm(10) + col * (cell_w + cg)
        y0 = grid_y + row * (cell_h + cg)
        cell = fitz.Rect(x0, y0, x0 + cell_w, y0 + cell_h)
        rrect(page, cell, fill=WHITE, stroke=None, radius=0.08)
        tsize = mm(10.5)
        dsize = mm(8.5)
        # vertically center block of text in cell
        approx_lines = 2 + max(2, int(len(desc) / ((cell_w - mm(12)) / dsize * 0.9)))
        block_h = tsize * 1.3 * 2 + mm(4) + dsize * 1.42 * min(approx_lines, 5)
        ty = cell.y0 + max(mm(12), (cell_h - block_h) / 2 + tsize)
        if tw(title_v, tsize, True) > cell_w - mm(14):
            end_y = wrap_txt(page, cell.x0 + mm(7), ty, title_v, tsize, cell_w - mm(14), INK, 1.28, True)
            dy = end_y + mm(4)
        else:
            txt(page, cell.x0 + mm(7), ty, title_v, tsize, INK, bold=True)
            dy = ty + tsize * 1.45
        wrap_txt(page, cell.x0 + mm(7), dy, desc, dsize, cell_w - mm(14), MUTED, 1.42)

    cy = box.y1 + mm(8)
    row1 = ["Claude", "GPT", "Gemini", "GLM", "DeepSeek", "Qwen", "Hailuo", "Kling"]
    row2 = ["MiniMax", "Seedance", "100+ 款模型"]
    cy = chips_row(page, row1, cy, True, mx, cw) + mm(4)
    chips_row(page, row2, cy, True, mx, cw)

    # Footer block anchored to bottom
    y = cards_bottom + mm(18)
    th = mm(24)
    trust = fitz.Rect(mx + mm(30), y, mx + cw - mm(30), y + th)
    rrect(page, trust, fill=CYAN, stroke=None, radius=0.5)
    txt(page, W / 2, trust.y0 + th * 0.68, "无隐性消费    |    无产品捆绑    |    数据自主可控", mm(11), WHITE, 1, True)
    y = trust.y1 + mm(16)

    cta = mm(15)
    parts = [("立即开启 ", INK), ("降本增效", CYAN), (" 之旅", INK)]
    total = sum(tw(t, cta, True) for t, _ in parts)
    cx = W / 2 - total / 2
    for t, c in parts:
        page.insert_text(fitz.Point(cx, y), t, fontname=FN_B, fontsize=cta, color=c)
        cx += tw(t, cta, True)
    y += mm(28)

    contact = [
        ("联系人", "任晓雷"),
        ("电话", "173 1698 2366"),
        ("邮箱", "starsea@trinitydesk.com"),
        ("网站", "www.trinitydesk.ai"),
    ]
    csize = mm(11)
    cy = y
    for lab, val in contact:
        page.insert_text(fitz.Point(mx + mm(4), cy), "●", fontname=FN_B, fontsize=mm(7), color=CYAN)
        page.insert_text(fitz.Point(mx + mm(16), cy), f"{lab}  {val}", fontname=FN_B, fontsize=csize, color=INK)
        cy += csize * 1.7

    qr = mm(72)
    qr_rect = fitz.Rect(W - mx - qr, y - mm(4), W - mx, y - mm(4) + qr)
    if QR.exists():
        page.insert_image(qr_rect, filename=str(QR), keep_proportion=True)

    doc.save(OUT, garbage=4, deflate=True)
    doc.close()
    print(f"saved {OUT} ({OUT.stat().st_size} bytes)")
    print(f"size {W/72*2.54:.1f}×{H/72*2.54:.1f} cm")


if __name__ == "__main__":
    build()

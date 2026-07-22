#!/usr/bin/env bash
# 导出 A4 双面宣传单 PDF（Playwright：正面 AI API · 背面 AI 云）
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="$DIR/trinity-promo-flyer-zh.html"
OUT="${1:-$DIR/output/Trinity-A4宣传单-AI-API-AI云.pdf}"

mkdir -p "$(dirname "$OUT")"

python3 << PY
from pathlib import Path
from playwright.sync_api import sync_playwright

html = Path("$HTML").resolve()
out = Path("$OUT").resolve()

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(html.as_uri(), wait_until="networkidle")
    page.emulate_media(media="print")
    # A4 210×297mm，两页（正/背），零边距与 @page 一致
    page.pdf(
        path=str(out),
        format="A4",
        print_background=True,
        prefer_css_page_size=True,
        margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
    )
    browser.close()

print(f"wrote {out} ({out.stat().st_size} bytes)")
PY

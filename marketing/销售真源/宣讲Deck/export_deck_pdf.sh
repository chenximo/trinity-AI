#!/usr/bin/env bash
# 导出 Trinity 品牌产品介绍 PDF（16:9 · Playwright）
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="$DIR/index.html"
OUT="${1:-$DIR/output/Trinity-品牌产品介绍.pdf}"

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
    page.pdf(
        path=str(out),
        width="13.333in",
        height="7.5in",
        print_background=True,
        prefer_css_page_size=True,
        margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
    )
    browser.close()

print(f"wrote {out} ({out.stat().st_size} bytes)")
PY

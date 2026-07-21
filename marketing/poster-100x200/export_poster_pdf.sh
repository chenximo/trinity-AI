#!/usr/bin/env bash
# 导出 100×200 站台海报 PDF（Playwright，纸张尺寸准确）
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="$DIR/trinity-poster-100x200-zh.html"
OUT="${1:-$DIR/output/Trinity-100x200推广素材-V1.3.pdf}"

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
        width="1000mm",
        height="2000mm",
        print_background=True,
        margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
    )
    browser.close()

print(f"wrote {out} ({out.stat().st_size} bytes)")
PY

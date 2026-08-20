#!/usr/bin/env bash
# 导出转正述职答辩 PPT 为 .pptx（16:9 · Playwright 截图铺满幻灯片）
# 说明：页为位图，投屏版式与 HTML 一致；正文不可在 PPT 里直接改字。
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="$DIR/index.html"
OUT="${1:-$DIR/output/Trinity-转正述职答辩.pptx}"
SHOT_DIR="$DIR/output/_pptx-slides"
PY="$DIR/.venv/bin/python"

if [[ ! -x "$PY" ]]; then
  python3 -m venv "$DIR/.venv"
  "$DIR/.venv/bin/pip" install -q python-pptx playwright
  "$DIR/.venv/bin/playwright" install chromium
  PY="$DIR/.venv/bin/python"
fi

mkdir -p "$(dirname "$OUT")" "$SHOT_DIR"
rm -f "$SHOT_DIR"/p*.png

"$PY" << PY
from pathlib import Path
from playwright.sync_api import sync_playwright
from pptx import Presentation
from pptx.util import Inches, Emu

html = Path("$HTML").resolve()
out = Path("$OUT").resolve()
shot_dir = Path("$SHOT_DIR").resolve()
shot_dir.mkdir(parents=True, exist_ok=True)

# 16:9 widescreen
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)
# Capture at 2x for sharpness on projector
CSS_W, CSS_H = 1280, 720
SCALE = 2

paths = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(
        viewport={"width": CSS_W + 80, "height": CSS_H + 200},
        device_scale_factor=SCALE,
    )
    page.goto(html.as_uri(), wait_until="networkidle")
    page.add_style_tag(content="""
      .toolbar { display: none !important; }
      html, body { background: #fff !important; }
      .stage { padding: 0 !important; gap: 0 !important; }
      .slide {
        box-shadow: none !important;
        margin: 0 !important;
        width: 1280px !important;
        height: 720px !important;
      }
    """)
    slides = page.query_selector_all("section.slide")
    if len(slides) != 12:
        raise SystemExit(f"expected 12 slides, got {len(slides)}")
    for i, el in enumerate(slides, 1):
        path = shot_dir / f"p{i:02d}.png"
        el.scroll_into_view_if_needed()
        page.wait_for_timeout(80)
        el.screenshot(path=str(path), type="png")
        paths.append(path)
        print(f"shot {path.name}")
    browser.close()

prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H
blank = prs.slide_layouts[6]  # blank

for path in paths:
    slide = prs.slides.add_slide(blank)
    slide.shapes.add_picture(str(path), Emu(0), Emu(0), width=SLIDE_W, height=SLIDE_H)

prs.save(str(out))
print(f"wrote {out} ({out.stat().st_size} bytes, {len(paths)} slides)")
PY

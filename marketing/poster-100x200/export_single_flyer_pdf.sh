#!/usr/bin/env bash
# 导出 A4 单页宣传单 PDF（Playwright）
# 用法：
#   ./export_single_flyer_pdf.sh api
#   ./export_single_flyer_pdf.sh cloud
#   ./export_single_flyer_pdf.sh all
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
WHICH="${1:-all}"

export_one() {
  local kind="$1"
  local html out
  case "$kind" in
    api)
      html="$DIR/trinity-flyer-api-zh.html"
      out="$DIR/output/Trinity-A4单页-AI-API.pdf"
      ;;
    cloud)
      html="$DIR/trinity-flyer-cloud-zh.html"
      out="$DIR/output/Trinity-A4单页-AI云.pdf"
      ;;
    *)
      echo "unknown kind: $kind (api|cloud|all)" >&2
      exit 1
      ;;
  esac

  mkdir -p "$(dirname "$out")"
  python3 << PY
from pathlib import Path
import os
from playwright.sync_api import sync_playwright

html = Path("$html").resolve()
out = Path("$out").resolve()

def find_chromium():
    homes = []
    env = os.environ.get("PLAYWRIGHT_BROWSERS_PATH")
    if env:
        homes.append(Path(env))
    homes.append(Path.home() / "Library/Caches/ms-playwright")
    seen = set()
    for cache in homes:
        key = str(cache.resolve()) if cache.exists() else str(cache)
        if key in seen:
            continue
        seen.add(key)
        for ver in ("1243", "1234", "1228", "1223"):
            for arch in ("mac-arm64", "mac-x64"):
                p = cache / f"chromium_headless_shell-{ver}" / f"chrome-headless-shell-{arch}" / "chrome-headless-shell"
                if p.exists():
                    return str(p)
                p2 = cache / f"chromium-{ver}" / f"chrome-{arch}" / "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
                if p2.exists():
                    return str(p2)
    chrome = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    if chrome.exists():
        return str(chrome)
    return None

exe = find_chromium()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    page = browser.new_page()
    page.goto(html.as_uri(), wait_until="networkidle")
    page.emulate_media(media="print")
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
}

case "$WHICH" in
  all)
    export_one api
    export_one cloud
    ;;
  api|cloud)
    export_one "$WHICH"
    ;;
  *)
    echo "usage: $0 [api|cloud|all]" >&2
    exit 1
    ;;
esac

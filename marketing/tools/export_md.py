#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown → Word (.docx) / PDF 导出工具

依赖：
  pip3 install --user -r requirements-md-export.txt
  # PDF 还需本机可用的 Playwright Chromium（仓库海报导出同款）

用法：
  python3 marketing/tools/export_md.py path/to/file.md
  python3 marketing/tools/export_md.py path/to/file.md --docx
  python3 marketing/tools/export_md.py path/to/file.md --pdf
  python3 marketing/tools/export_md.py path/to/file.md -o marketing/output/
"""

from __future__ import annotations

import argparse
import re
import sys
import tempfile
from pathlib import Path

try:
    import markdown as md_lib
except ImportError:
    print("缺少 markdown：pip3 install --user markdown", file=sys.stderr)
    sys.exit(1)


CSS = """
@page {
  size: A4;
  margin: 18mm 16mm;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
    "Noto Sans CJK SC", sans-serif;
  font-size: 11pt;
  line-height: 1.7;
  color: #1a1a1a;
}
body { max-width: 720px; margin: 0 auto; }
h1 { font-size: 20pt; line-height: 1.35; margin: 0 0 16pt; font-weight: 700; }
h2 { font-size: 15pt; margin: 22pt 0 10pt; font-weight: 700; border-bottom: 1px solid #e5e5e5; padding-bottom: 6pt; }
h3 { font-size: 12.5pt; margin: 16pt 0 8pt; font-weight: 650; }
p { margin: 0 0 10pt; }
ul, ol { margin: 0 0 12pt; padding-left: 1.4em; }
li { margin: 0 0 4pt; }
blockquote {
  margin: 10pt 0 14pt;
  padding: 8pt 14pt;
  border-left: 3px solid #2563eb;
  background: #f8fafc;
  color: #334155;
}
blockquote p { margin: 0 0 6pt; }
blockquote p:last-child { margin: 0; }
strong { font-weight: 650; }
a { color: #2563eb; text-decoration: none; }
hr { border: none; border-top: 1px solid #e5e5e5; margin: 18pt 0; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 14pt;
  font-size: 10pt;
}
th, td {
  border: 1px solid #d4d4d8;
  padding: 7pt 8pt;
  text-align: left;
  vertical-align: top;
}
th { background: #f4f4f5; font-weight: 650; }
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.92em;
  background: #f4f4f5;
  padding: 0 4px;
  border-radius: 3px;
}
"""


def md_to_html_body(text: str) -> str:
    return md_lib.markdown(
        text,
        extensions=[
            "tables",
            "fenced_code",
            "sane_lists",
            "nl2br",
            "smarty",
        ],
        output_format="html5",
    )


def wrap_html(title: str, body: str) -> str:
    safe_title = (
        title.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<title>{safe_title}</title>
<style>{CSS}</style>
</head>
<body>
{body}
</body>
</html>
"""


def first_h1(text: str, fallback: str) -> str:
    m = re.search(r"^#\s+(.+)$", text, re.M)
    return m.group(1).strip() if m else fallback


def export_docx(md_text: str, out: Path, title: str) -> None:
    try:
        from docx import Document
        from htmldocx import HtmlToDocx
    except ImportError:
        print(
            "缺少 Word 依赖：pip3 install --user python-docx htmldocx",
            file=sys.stderr,
        )
        sys.exit(1)

    body = md_to_html_body(md_text)
    # htmldocx 对完整 HTML 文档偶发丢样式，喂 body 片段更稳
    doc = Document()
    # 默认中文字体
    style = doc.styles["Normal"]
    style.font.name = "PingFang SC"
    try:
        style.element.rPr.rFonts.set(
            "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}eastAsia",
            "PingFang SC",
        )
    except Exception:
        pass

    parser = HtmlToDocx()
    parser.add_html_to_document(body, doc)
    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(out))
    print(f"wrote {out} ({out.stat().st_size} bytes)  [{title}]")


def _launch_browser(p):
    """优先 Playwright Chromium；否则尝试本机 Chrome / Edge。"""
    try:
        return p.chromium.launch()
    except Exception as first_err:
        for channel in ("chrome", "msedge", "chrome-beta"):
            try:
                return p.chromium.launch(channel=channel)
            except Exception:
                continue
        print(
            "无法启动浏览器导出 PDF。请执行：\n"
            "  python3 -m playwright install chromium\n"
            f"原始错误：{first_err}",
            file=sys.stderr,
        )
        sys.exit(1)


def export_pdf(md_text: str, out: Path, title: str) -> None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "缺少 Playwright：pip3 install --user playwright && python3 -m playwright install chromium",
            file=sys.stderr,
        )
        sys.exit(1)

    html = wrap_html(title, md_to_html_body(md_text))
    out.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="md-export-") as tmp:
        html_path = Path(tmp) / "article.html"
        html_path.write_text(html, encoding="utf-8")
        with sync_playwright() as p:
            browser = _launch_browser(p)
            page = browser.new_page()
            page.goto(html_path.as_uri(), wait_until="networkidle")
            page.emulate_media(media="print")
            page.pdf(
                path=str(out),
                format="A4",
                print_background=True,
                prefer_css_page_size=True,
                margin={
                    "top": "18mm",
                    "right": "16mm",
                    "bottom": "18mm",
                    "left": "16mm",
                },
            )
            browser.close()

    print(f"wrote {out} ({out.stat().st_size} bytes)  [{title}]")

def main() -> None:
    ap = argparse.ArgumentParser(
        description="Export Markdown to Word (.docx) and/or PDF"
    )
    ap.add_argument("input", type=Path, help="输入 .md 文件")
    ap.add_argument(
        "-o",
        "--outdir",
        type=Path,
        default=None,
        help="输出目录（默认：与 md 同目录下的 export/）",
    )
    ap.add_argument("--docx", action="store_true", help="只导出 Word")
    ap.add_argument("--pdf", action="store_true", help="只导出 PDF")
    ap.add_argument(
        "--both",
        action="store_true",
        help="同时导出 Word 与 PDF（默认行为）",
    )
    args = ap.parse_args()

    src: Path = args.input.expanduser().resolve()
    if not src.is_file():
        print(f"找不到文件：{src}", file=sys.stderr)
        sys.exit(1)

    do_docx = True
    do_pdf = True
    if args.docx and not args.pdf and not args.both:
        do_pdf = False
    elif args.pdf and not args.docx and not args.both:
        do_docx = False
    # --both 或未指定：两者都出

    outdir = (args.outdir or (src.parent / "export")).expanduser().resolve()
    md_text = src.read_text(encoding="utf-8")
    title = first_h1(md_text, src.stem)
    stem = src.stem

    if do_docx:
        export_docx(md_text, outdir / f"{stem}.docx", title)
    if do_pdf:
        export_pdf(md_text, outdir / f"{stem}.pdf", title)


if __name__ == "__main__":
    main()

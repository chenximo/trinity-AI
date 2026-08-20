#!/usr/bin/env python3
"""Export 转正述职逐字稿 Markdown → DOCX + PDF (via HTML + textutil on macOS)."""

from __future__ import annotations

import html
import re
import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_LINE_SPACING
from docx.shared import Inches, Pt, RGBColor
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parent
DEFAULT_MD = ROOT / "转正述职-逐字稿-18分钟-2026.md"
OUT_DIR = ROOT / "转正述职-答辩PPT" / "output"


def inline_md_to_docx_runs(paragraph, text: str, *, hint=False) -> None:
    text = text.replace("  \n", "\n")
    pattern = re.compile(r"(\*\*[^*]+\*\*|`[^`]+`)")
    pos = 0
    for m in pattern.finditer(text):
        if m.start() > pos:
            run = paragraph.add_run(text[pos : m.start()])
            if hint:
                run.italic = True
                run.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
        chunk = m.group(0)
        if chunk.startswith("**"):
            run = paragraph.add_run(chunk[2:-2])
            run.bold = True
        else:
            run = paragraph.add_run(chunk[1:-1])
            run.font.name = "Menlo"
            run._element.rPr.rFonts.set(qn("w:eastAsia"), "PingFang SC")
        pos = m.end()
    if pos < len(text):
        run = paragraph.add_run(text[pos:])
        if hint:
            run.italic = True
            run.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)


def inline_md_to_html(text: str, *, hint=False) -> str:
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = text.replace("  \n", "<br/>")
    if hint:
        return f'<p class="hint">{text}</p>'
    return f"<p>{text}</p>"


def parse_table(lines: list[str]) -> tuple[list[str], list[list[str]], int]:
    rows: list[list[str]] = []
    i = 0
    while i < len(lines) and "|" in lines[i]:
        row = [c.strip() for c in lines[i].strip().strip("|").split("|")]
        rows.append(row)
        i += 1
    if len(rows) >= 2 and all(re.match(r"^:?-+:?$", c.replace(" ", "")) or set(c) <= {"-", ":"} for c in rows[1]):
        header, body = rows[0], rows[2:]
    else:
        header, body = [], rows
    return header, body, i


def export_docx(md_path: Path, out_path: Path) -> None:
    lines = md_path.read_text(encoding="utf-8").splitlines()
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.9)
    section.bottom_margin = Inches(0.9)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

    style = doc.styles["Normal"]
    style.font.name = "PingFang SC"
    style._element.rPr.rFonts.set(qn("w:eastAsia"), "PingFang SC")
    style.font.size = Pt(11)

    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if line.strip() == "---":
            doc.add_page_break()
            i += 1
            continue
        if line.startswith("# "):
            h = doc.add_heading(line[2:].strip(), level=0)
            h.runs[0].font.name = "PingFang SC"
            i += 1
            continue
        if line.startswith("## "):
            h = doc.add_heading(line[3:].strip(), level=1)
            h.runs[0].font.name = "PingFang SC"
            i += 1
            continue
        if line.startswith("> "):
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            run = p.add_run(line[2:].strip())
            run.italic = True
            run.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
            i += 1
            continue
        if line.startswith("|"):
            header, body, ni = parse_table(lines[i:])
            if header:
                table = doc.add_table(rows=1 + len(body), cols=len(header))
                table.style = "Table Grid"
                for ci, val in enumerate(header):
                    table.rows[0].cells[ci].text = val
                for ri, row in enumerate(body, start=1):
                    for ci, val in enumerate(row):
                        table.rows[ri].cells[ci].text = val
            i += ni
            continue
        if re.match(r"^\d+\.\s", line):
            p = doc.add_paragraph(style="List Number")
            inline_md_to_docx_runs(p, re.sub(r"^\d+\.\s", "", line))
            i += 1
            continue

        hint = line.strip().startswith("（") or line.strip().startswith("`【")
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
        p.paragraph_format.line_spacing = 1.35
        inline_md_to_docx_runs(p, line, hint=hint)
        i += 1

    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(out_path)


def export_html(md_path: Path, out_path: Path) -> str:
    lines = md_path.read_text(encoding="utf-8").splitlines()
    parts = [
        """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<title>Trinity 转正述职 · 18 分钟逐字稿</title>
<style>
  @page { size: A4; margin: 22mm 20mm; }
  body { font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
         font-size: 11pt; line-height: 1.55; color: #1e293b; max-width: 720px; margin: 0 auto; }
  h1 { font-size: 20pt; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
  h2 { font-size: 14pt; color: #1e40af; margin-top: 28px; page-break-after: avoid; }
  blockquote { margin: 12px 0; padding: 8px 14px; background: #f8fafc; border-left: 4px solid #94a3b8; color: #475569; }
  p { margin: 8px 0; }
  .hint { color: #64748b; font-style: italic; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10pt; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
  th { background: #eff6ff; }
  code { font-family: Menlo, monospace; font-size: 10pt; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
  hr { border: none; border-top: 1px dashed #cbd5e1; margin: 24px 0; }
</style>
</head>
<body>
"""
    ]

    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if line.strip() == "---":
            parts.append("<hr/>")
            i += 1
            continue
        if line.startswith("# "):
            parts.append(f"<h1>{html.escape(line[2:].strip())}</h1>")
            i += 1
            continue
        if line.startswith("## "):
            parts.append(f"<h2>{html.escape(line[3:].strip())}</h2>")
            i += 1
            continue
        if line.startswith("> "):
            parts.append(f"<blockquote>{html.escape(line[2:].strip())}</blockquote>")
            i += 1
            continue
        if line.startswith("|"):
            header, body, ni = parse_table(lines[i:])
            parts.append("<table><thead><tr>")
            for h in header:
                parts.append(f"<th>{html.escape(h)}</th>")
            parts.append("</tr></thead><tbody>")
            for row in body:
                parts.append("<tr>")
                for cell in row:
                    parts.append(f"<td>{html.escape(cell)}</td>")
                parts.append("</tr>")
            parts.append("</tbody></table>")
            i += ni
            continue
        if re.match(r"^\d+\.\s", line):
            content = re.sub(r"^\d+\.\s", "", line)
            parts.append(inline_md_to_html(content))
            i += 1
            continue
        hint = line.strip().startswith("（") or line.strip().startswith("`【")
        parts.append(inline_md_to_html(line, hint=hint))
        i += 1

    parts.append("</body></html>")
    html_text = "\n".join(parts)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html_text, encoding="utf-8")
    return html_text


def export_pdf_via_textutil(html_path: Path, pdf_path: Path) -> bool:
    try:
        subprocess.run(
            ["textutil", "-convert", "pdf", "-output", str(pdf_path), str(html_path)],
            check=True,
            capture_output=True,
        )
        return pdf_path.exists() and pdf_path.stat().st_size > 0
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def export_pdf_via_playwright(html_path: Path, pdf_path: Path) -> bool:
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(html_path.resolve().as_uri(), wait_until="networkidle")
            page.pdf(
                path=str(pdf_path),
                format="A4",
                print_background=True,
                margin={"top": "20mm", "right": "18mm", "bottom": "20mm", "left": "18mm"},
            )
            browser.close()
        return pdf_path.exists() and pdf_path.stat().st_size > 0
    except Exception as exc:
        print(f"playwright PDF failed: {exc}", file=sys.stderr)
        return False


def main() -> None:
    md_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_MD
    if not md_path.exists():
        print(f"not found: {md_path}", file=sys.stderr)
        sys.exit(1)

    stem = md_path.stem
    docx_path = OUT_DIR / f"{stem}.docx"
    html_path = OUT_DIR / f"{stem}.html"
    pdf_path = OUT_DIR / f"{stem}.pdf"

    export_docx(md_path, docx_path)
    print(f"DOCX → {docx_path} ({docx_path.stat().st_size} bytes)")

    export_html(md_path, html_path)
    print(f"HTML → {html_path}")

    if export_pdf_via_textutil(html_path, pdf_path):
        print(f"PDF  → {pdf_path} ({pdf_path.stat().st_size} bytes) [textutil]")
    elif export_pdf_via_playwright(html_path, pdf_path):
        print(f"PDF  → {pdf_path} ({pdf_path.stat().st_size} bytes) [playwright]")
    else:
        print("PDF  export failed; open HTML in browser and Print → Save as PDF", file=sys.stderr)


if __name__ == "__main__":
    main()

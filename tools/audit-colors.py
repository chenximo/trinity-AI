#!/usr/bin/env python3
"""
Scan CSS/HTML under Trinity for #hex uses.
- ALLOW: all 6-digit (and expanded 3-digit) hex found in assets/trinity-base.css (design system file).
- Rows: every unique (file, line, raw_hex) with flag 套件内已登记色 vs 待核对.
Output: docs/color-audit.md (markdown table)
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets" / "trinity-base.css"
OUT = ROOT / "docs" / "color-audit.md"
OUT_PENDING = ROOT / "docs" / "color-audit-pending.md"

HEX_RE = re.compile(r"#([0-9a-fA-F]{3})\b|#([0-9a-fA-F]{6})\b|#([0-9a-fA-F]{8})\b")


def expand_hex(h: str) -> str:
    h = h.lower()
    if len(h) == 3:
        return "".join(c * 2 for c in h)
    if len(h) == 8:
        return h[:6]
    return h


def extract_hexes(text: str) -> set[str]:
    s: set[str] = set()
    for m in HEX_RE.finditer(text):
        g = m.group(1) or m.group(2) or m.group(3)
        s.add(expand_hex(g))
    return s


def scan_file(path: Path) -> list[tuple[int, str, str]]:
    out: list[tuple[int, str, str]] = []
    text = path.read_text(encoding="utf-8", errors="replace")
    for i, line in enumerate(text.splitlines(), 1):
        for m in HEX_RE.finditer(line):
            raw = m.group(0)
            g = m.group(1) or m.group(2) or m.group(3)
            out.append((i, raw, expand_hex(g)))
    return out


def main() -> int:
    skip_parts = {"node_modules", ".git", "dist", "build", ".cursor"}

    allow = extract_hexes(BASE.read_text(encoding="utf-8", errors="replace"))
    # 纯白/纯黑短写常见于图标，仍算常见 UI
    allow.update(["ffffff", "000000"])

    files: list[Path] = []
    for pattern in ("**/*.css", "**/*.html"):
        for path in ROOT.glob(pattern):
            if not path.is_file():
                continue
            rel = path.relative_to(ROOT)
            if any(p in skip_parts for p in rel.parts):
                continue
            if rel.as_posix() == "tools/audit-colors.py":
                continue
            files.append(path)

    rows: list[tuple[str, int, str, str, str]] = []
    for path in sorted(files, key=lambda p: str(p)):
        rel = path.relative_to(ROOT).as_posix()
        for line_no, raw, hx in scan_file(path):
            if hx in allow:
                flag = "已在 trinity-base.css 出现（套件登记色）"
            else:
                flag = "**待核对**：色板 :root 未收录且未在 base 中出现"
            rows.append((rel, line_no, raw, "#" + hx, flag))

    # dedupe same file+line+raw
    seen: set[tuple[str, int, str]] = set()
    uniq: list[tuple[str, int, str, str, str]] = []
    for r in rows:
        k = (r[0], r[1], r[2])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(r)

    uniq.sort(key=lambda x: (0 if "待核对" in x[4] else 1, x[0], x[1]))

    pending = sum(1 for u in uniq if "待核对" in u[4])
    lines_out = [
        "# 颜色硬编码审计（相对设计色板 / trinity-base）",
        "",
        "生成方式：脚本扫描仓库内 `.css` / `.html` 中的 `#hex`；**允许集**为 `assets/trinity-base.css` 内出现的全部 hex（外加 `#fff`/`#000` 归一化）。",
        "不在允许集中的硬编码标为 **待核对**（可能是对话页/云落地独立色、第三方品牌色、或应改为 `var(--token)`）。",
        "",
        f"- 扫描条目（去重后）：**{len(uniq)}**",
        f"- **待核对**条数：**{pending}**（仅待核对子表见 [`color-audit-pending.md`](./color-audit-pending.md)）",
        "",
        "## 全表（待核对在前）",
        "",
        "| 文件 | 行 | 原始值 | 归一化 | 与套件色板对照 |",
        "| --- | ---: | --- | --- | --- |",
    ]
    for rel, line_no, raw, hx6, flag in uniq:
        lines_out.append(f"| `{rel}` | {line_no} | `{raw}` | `{hx6}` | {flag} |")

    lines_out.extend(
        [
            "",
            "## 说明",
            "",
            "- 本表**不**解析 `rgba()` / `hsl()` / `var(--x)`；仅针对十六进制字面量。",
            "- `design-tokens.html` 中出现的 hex 多为文档说明字符串，可与产品代码区分阅读。",
            "- 若某色为刻意设计（如图表、OAuth 品牌），请在设计文档中登记后把 hex 写入 `trinity-base.css` 任意注释或变量，再重跑脚本以纳入允许集。",
            "",
            "---",
            "",
            f"*由 `tools/audit-colors.py` 生成。*",
        ]
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines_out) + "\n", encoding="utf-8")

    pend_lines = [
        "# 颜色硬编码 · 仅「待核对」子表",
        "",
        f"从 `{OUT.relative_to(ROOT)}` 筛出，共 **{pending}** 条。",
        "",
        "| 文件 | 行 | 原始值 | 归一化 | 与套件色板对照 |",
        "| --- | ---: | --- | --- | --- |",
    ]
    for rel, line_no, raw, hx6, flag in uniq:
        if "待核对" not in flag:
            continue
        pend_lines.append(f"| `{rel}` | {line_no} | `{raw}` | `{hx6}` | {flag} |")
    pend_lines.extend(["", f"*由 `tools/audit-colors.py` 生成。*"])
    OUT_PENDING.write_text("\n".join(pend_lines) + "\n", encoding="utf-8")

    print(f"Wrote {OUT} ({len(uniq)} rows, {pending} pending)")
    print(f"Wrote {OUT_PENDING} ({pending} rows)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Replace #hex with trinity-base :root vars across key HTML files."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PAIRS: list[tuple[str, str]] = [
    ("#111827", "var(--text)"),
    ("#0f172a", "var(--text)"),
    ("#1e293b", "var(--text)"),
    ("#334155", "var(--text)"),
    ("#2a1810", "var(--text)"),
    ("#111111", "var(--text)"),
    ("#374151", "var(--muted)"),
    ("#475569", "var(--muted)"),
    ("#52525b", "var(--muted)"),
    ("#64748b", "var(--muted)"),
    ("#6b7c93", "var(--muted)"),
    ("#94a3b8", "var(--muted-2)"),
    ("#93c5fd", "var(--blue-ring)"),
    ("#cbd5e1", "var(--border-strong)"),
    ("#e2e8f0", "var(--border)"),
    ("#f1f5f9", "var(--surface)"),
    ("#f8fafc", "var(--bg)"),
    ("#f5f5f5", "var(--surface-2)"),
    ("#f3f4f6", "var(--surface-2)"),
    ("#f9fafb", "var(--surface)"),
    ("#e5e7eb", "var(--border)"),
    ("#d1d5db", "var(--border-strong)"),
    ("#991b1b", "var(--danger-dark)"),
    ("#dc2626", "var(--danger)"),
    ("#ef4444", "var(--danger-hot)"),
    ("#c2410c", "var(--orange-deep)"),
    ("#c084fc", "var(--violet-400)"),
    ("#8b5a3c", "var(--warning-ink)"),
    ("#e8c4a8", "var(--border-strong)"),
    ("#10a37f", "var(--brand-chatgpt)"),
    ("#10b981", "var(--green-bright)"),
    ("#4285f4", "var(--oauth-google)"),
    ("#1a73e8", "var(--oauth-google-hover)"),
    ("#ea4335", "var(--oauth-google-red)"),
    ("#fbbc04", "var(--oauth-google-yellow)"),
    ("#fbbc05", "var(--oauth-google-yellow)"),
    ("#34a853", "var(--oauth-google-green)"),
    ("#2563eb", "var(--blue)"),
    ("#4f46e5", "var(--indigo-500)"),
    ("#6366f1", "var(--indigo-400)"),
    ("#7c3aed", "var(--purple)"),
    ("#6d28d9", "var(--purple-deep)"),
    ("#b91c1c", "var(--danger-ink)"),
    ("#fecaca", "var(--danger-border)"),
    ("#fef2f2", "var(--danger-soft)"),
    ("#22c55e", "var(--success-bright)"),
    ("#059669", "var(--success)"),
    ("#15803d", "var(--success-strong)"),
    ("#ecfdf5", "var(--success-soft)"),
    ("#e11d48", "var(--rose-600)"),
    ("#fff1f2", "var(--danger-soft)"),
    ("#f5f3ff", "var(--purple-soft)"),
    ("#eff6ff", "var(--blue-soft)"),
    ("#bfdbfe", "var(--blue-ring)"),
    ("#dbeafe", "var(--blue-soft)"),
    ("#e9d5ff", "var(--purple-soft)"),
    ("#fce7f3", "var(--surface)"),
    ("#cffafe", "var(--blue-soft)"),
    ("#e0e7ff", "var(--blue-soft)"),
    ("#fae8ff", "var(--purple-soft)"),
    ("#fef3c7", "var(--warning-soft)"),
    ("#fcd34d", "var(--warning-ring)"),
    ("#b45309", "var(--warning-ink)"),
    ("#f97316", "var(--orange)"),
    ("#ea580c", "var(--orange-deep)"),
    ("#f59e0b", "var(--warning)"),
    ("#d97706", "var(--warning)"),
    ("#f87171", "var(--viz-coral)"),
    ("#facc15", "var(--viz-yellow)"),
    ("#4ade80", "var(--viz-mint)"),
    ("#a855f7", "var(--viz-violet-400)"),
    ("#d946ef", "var(--viz-fuchsia-500)"),
    ("#e879f9", "var(--pink-400)"),
    ("#f0abfc", "var(--pink-400)"),
    ("#f9a8d4", "var(--pink-400)"),
    ("#fb7185", "var(--danger-hot)"),
    ("#f43f5e", "var(--rose-600)"),
    ("#be123c", "var(--danger-ink)"),
    ("#9f1239", "var(--danger-dark)"),
    ("#818cf8", "var(--indigo-400)"),
    ("#a5b4fc", "var(--blue-ring)"),
    ("#c7d2fe", "var(--blue-ring)"),
    ("#e0e7ff", "var(--blue-soft)"),
    ("#ddd6fe", "var(--violet-200)"),
    ("#f5d0fe", "var(--purple-soft)"),
    ("#fbcfe8", "var(--surface)"),
    ("#fecdd3", "var(--danger-border)"),
    ("#fee2e2", "var(--danger-soft)"),
    ("#0ea5e9", "var(--sky-500)"),
    ("#38bdf8", "var(--sky-400)"),
    ("#7dd3fc", "var(--blue-ring)"),
    ("#bae6fd", "var(--blue-ring)"),
    ("#e0f2fe", "var(--blue-soft)"),
    ("#86efac", "var(--success-bright)"),
    ("#fca5a5", "var(--danger-hot)"),
    ("#ffffff", "var(--bg)"),
]

PAIRS.sort(key=lambda x: len(x[0]), reverse=True)

FILES = [
    ROOT / "TrinityAI/index.html",
    ROOT / "TrinityAI/account/console.html",
    ROOT / "TrinityAI/app/chat/index.html",
]


def align_text(text: str) -> str:
    for old, new in PAIRS:
        text = text.replace(old, new)
    text = text.replace("solid #111", "solid var(--text)")
    text = text.replace("color: #111", "color: var(--text)")
    text = text.replace("color:#111", "color:var(--text)")
    text = text.replace('fill="#fff"', 'fill="var(--bg)"')
    text = text.replace("fill='#fff'", "fill='var(--bg)'")
    text = text.replace('stroke="#fff"', 'stroke="var(--bg)"')
    text = text.replace('fill="#fff"', 'fill="var(--bg)"')
    text = text.replace("stop-color=\"#fff\"", 'stop-color="var(--bg)"')
    text = text.replace("color: #fff !important", "color: var(--on-primary) !important")
    text = text.replace("color: #fff", "color: var(--on-primary)")
    text = text.replace("color:#fff", "color:var(--on-primary)")
    text = text.replace("background: #fff", "background: var(--bg)")
    text = text.replace("background:#fff", "background:var(--bg)")
    return text


def main() -> int:
    for path in FILES:
        raw = path.read_text(encoding="utf-8")
        path.write_text(align_text(raw), encoding="utf-8")
        print("aligned", path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

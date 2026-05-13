#!/usr/bin/env python3
"""Align TrinityAI/app/chat/chat-openrouter.css hex to trinity-base :root tokens."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "TrinityAI/app/chat/chat-openrouter.css"
text = path.read_text(encoding="utf-8")

# 顺序：长 hex 优先
hex_pairs: list[tuple[str, str]] = [
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
]

hex_pairs.sort(key=lambda x: len(x[0]), reverse=True)
for old, new in hex_pairs:
    text = text.replace(old, new)

# #111 独立（勿放在 #111111 之前）
text = text.replace("solid #111", "solid var(--text)")
text = text.replace("color: #111", "color: var(--text)")
text = text.replace("color:#111", "color:var(--text)")

text = text.replace("color: #fafafa", "color: var(--text)")
text = text.replace("color:#fafafa", "color:var(--text)")
text = text.replace("background: #fafafa", "background: var(--surface)")
text = text.replace("background:#fafafa", "background:var(--surface)")

text = text.replace("color: #a3a3a3", "color: var(--muted)")
text = text.replace("color:#a3a3a3", "color:var(--muted)")

text = text.replace("color: #93c5fd", "color: var(--pill-text)")
text = text.replace("color:#93c5fd", "color:var(--pill-text)")
text = text.replace("color: #bfdbfe", "color: var(--blue-ring)")
text = text.replace("color:#bfdbfe", "color:var(--blue-ring)")

text = text.replace("color: #fff", "color: var(--on-primary)")
text = text.replace("color:#fff", "color:var(--on-primary)")
text = text.replace("background: #fff", "background: var(--bg)")
text = text.replace("background:#fff", "background:var(--bg)")
text = text.replace(", #fff", ", var(--bg)")
text = text.replace(",#fff", ",var(--bg)")
text = text.replace("0%, #fff", "0%, var(--bg)")
text = text.replace("100%, #fff", "100%, var(--bg)")
text = text.replace("38%, #fff", "38%, var(--bg)")
text = text.replace("42%, #fff", "42%, var(--bg)")
text = text.replace("40%, #fff", "40%, var(--bg)")
text = text.replace("52%, #fff", "52%, var(--bg)")
text = text.replace("28%, #fff", "28%, var(--bg)")
text = text.replace("inset 0 0 0 2px #fff", "inset 0 0 0 2px var(--bg)")

path.write_text(text, encoding="utf-8")
print("OK", path)

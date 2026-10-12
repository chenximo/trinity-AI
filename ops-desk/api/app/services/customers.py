from __future__ import annotations

from typing import Optional

# 客户结算文件名解析出的客户标签 → Ops Desk customers.id
_SETTLEMENT_CUSTOMER_MAP = {
    "hehe": "hehe",
    "亿点": "yidian",
    "山河（BID）": "shanhe",
    "山河": "shanhe",
    "星瀚": "xinghan",
}


def settlement_customer_to_id(label: str) -> Optional[str]:
    s = (label or "").strip()
    if not s:
        return None
    if s in _SETTLEMENT_CUSTOMER_MAP:
        return _SETTLEMENT_CUSTOMER_MAP[s]
    for key, cid in _SETTLEMENT_CUSTOMER_MAP.items():
        if key in s or s in key:
            return cid
    return None

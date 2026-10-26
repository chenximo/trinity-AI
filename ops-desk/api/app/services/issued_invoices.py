from __future__ import annotations

"""税控已开出的历史发票（导入种子）。金额口径：价税合计 → amount，金额 → amount_ex_tax。"""

from typing import Any, Dict, List

# 来源：数电发票列表截图 2026-07 ~ 2026-09
ISSUED_INVOICES: List[Dict[str, Any]] = [
    {
        "invoice_no": "26612000001904545681",
        "customer_id": "yidian",
        "buyer_name": "亿点宇宙（陕西）信息科技有限公司",
        "tax_no": "91610131MAD9M6DM83",
        "invoice_type": "电子发票（普通发票）",
        "amount": 248_276.00,
        "amount_ex_tax": 234_222.64,
        "tax_amount": 14_053.36,
        "apply_date": "2026-09-22",
        # 金额与现有台账行无精确对齐，暂不挂 row_key
    },
    {
        "invoice_no": "26612000001839149296",
        "customer_id": "yidian",
        "buyer_name": "亿点宇宙（陕西）信息科技有限公司",
        "tax_no": "91610131MAD9M6DM83",
        "invoice_type": "电子发票（普通发票）",
        "amount": 261_594.76,
        "amount_ex_tax": 246_787.51,
        "tax_amount": 14_807.25,
        "apply_date": "2026-09-15",
        # 亿点 202607 腾讯云 · 实际消耗
        "hint_row_keys": ["亿点|202607|腾讯云|亿点宇宙（陕西）信息科技有限公司"],
    },
    {
        "invoice_no": "26612000001839291346",
        "customer_id": "yidian",
        "buyer_name": "亿点宇宙（陕西）信息科技有限公司",
        "tax_no": "91610131MAD9M6DM83",
        "invoice_type": "电子发票（普通发票）",
        "amount": 5_231.90,
        "amount_ex_tax": 4_935.75,
        "tax_amount": 296.15,
        "apply_date": "2026-09-15",
        # 亿点 202607 腾讯云 · 服务费
        "hint_row_keys": ["亿点|202607|腾讯云|亿点宇宙（陕西）信息科技有限公司"],
    },
    {
        "invoice_no": "26612000001629050596",
        "customer_id": "yidian",
        "buyer_name": "亿点宇宙（陕西）信息科技有限公司",
        "tax_no": "91610131MAD9M6DM83",
        "invoice_type": "电子发票（普通发票）",
        "amount": 191_079.62,
        "amount_ex_tax": 180_263.79,
        "tax_amount": 10_815.83,
        "apply_date": "2026-08-14",
    },
    {
        "invoice_no": "26612000001916729281",
        "customer_id": "shanhe",
        "buyer_name": "北京山河聚量科技有限公司",
        "tax_no": "91110105MA04E4YK89",
        "invoice_type": "电子发票（普通发票）",
        "amount": 2_648.23,
        "amount_ex_tax": 2_498.33,
        "tax_amount": 149.90,
        "apply_date": "2026-09-23",
        # 山河 202607 腾讯云 · 服务费
        "hint_row_keys": ["山河（BID）|202607|腾讯云|北京山河聚量科技有限公司"],
    },
    {
        "invoice_no": "26612000001916430841",
        "customer_id": "shanhe",
        "buyer_name": "北京山河聚量科技有限公司",
        "tax_no": "91110105MA04E4YK89",
        "invoice_type": "电子发票（普通发票）",
        "amount": 3_800.41,
        "amount_ex_tax": 3_585.29,
        "tax_amount": 215.12,
        "apply_date": "2026-09-23",
        # 山河 202608 腾讯云 · 服务费
        "hint_row_keys": ["山河（BID）|202608|腾讯云|北京山河聚量科技有限公司"],
    },
    {
        "invoice_no": "26612000001447052851",
        "customer_id": "shanhe",
        "buyer_name": "北京山河聚量科技有限公司",
        "tax_no": "91110105MA04E4YK89",
        "invoice_type": "电子发票（普通发票）",
        "amount": 91_963.01,
        "amount_ex_tax": 86_757.56,
        "tax_amount": 5_205.45,
        "apply_date": "2026-07-21",
    },
    {
        "invoice_no": "26612000001446163096",
        "customer_id": "shanhe",
        "buyer_name": "北京山河聚量科技有限公司",
        "tax_no": "91110105MA04E4YK89",
        "invoice_type": "电子发票（普通发票）",
        "amount": 1_839.26,
        "amount_ex_tax": 1_735.15,
        "tax_amount": 104.11,
        "apply_date": "2026-07-21",
    },
    {
        "invoice_no": "26612000001363820671",
        "customer_id": "yidian",
        "buyer_name": "亿点宇宙（陕西）信息科技有限公司",
        "tax_no": "91610131MAD9M6DM83",
        "invoice_type": "电子发票（普通发票）",
        "amount": 3_821.59,
        "amount_ex_tax": 3_605.27,
        "tax_amount": 216.32,
        "apply_date": "2026-07-09",
    },
    # 钉钉申请（APP-*）不入库：开票记录页只展示税控已确认开出的数电票
]

PROFILE_SEEDS = [
    {
        "customer_id": "yidian",
        "title": "亿点宇宙（陕西）信息科技有限公司",
        "tax_no": "91610131MAD9M6DM83",
        "default_invoice_type": "电子发票（普通发票）",
    },
    {
        "customer_id": "shanhe",
        "title": "北京山河聚量科技有限公司",
        "tax_no": "91110105MA04E4YK89",
        "default_invoice_type": "电子发票（普通发票）",
    },
]

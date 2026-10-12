from __future__ import annotations


def build_invoice_copy_text(
    *,
    buyer_name: str,
    tax_no: str,
    address_phone: str,
    bank_account: str,
    amount: float,
    invoice_type: str,
    payment_received: str,
    remark: str = "",
) -> str:
    lines = [
        f"购方名称：{buyer_name}",
        f"纳税人识别号：{tax_no}",
        f"地址、电话：{address_phone}",
        f"开户行及账号：{bank_account}",
        f"开票金额：{amount:,.2f}",
        f"票种：{invoice_type}",
        f"是否已完成收款：{payment_received}",
    ]
    if remark.strip():
        lines.append(f"备注：{remark.strip()}")
    return "\n".join(lines)

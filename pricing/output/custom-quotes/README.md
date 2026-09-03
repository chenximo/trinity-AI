# 定制报价 Excel（临时 / 客户 / 场景）

与 **正式 L3a**（`output/Trinity模型报价表.xlsx`）分开存放，避免和目录价、Admin 上传产物混在一起。

| 文件 | 脚本 | 说明 |
|------|------|------|
| `Trinity模型报价表_hehe.xlsx` | `scripts/sync_hehe_discount_models.py` | hehe 客户定制折扣 |
| `Trinity模型报价表_主力模型定制.xlsx` | `scripts/build_flagship_cost_plus05_quote.py` | 主力模型 · 商务总表 ≥$50k +0.5 |
| `Trinity模型报价表_海外三家定制.xlsx` | `scripts/build_overseas_three_vendor_quote.py` | Claude / GPT / Gemini 海外询价 |

共用 UI 与写入逻辑：`scripts/custom_quote_workbook.py`。

**真源**：刊例读 `Trinity模型报价表（内部）.xlsx`；折扣读 `商务洽谈折扣总表.xlsx`。不反向写回主流程。

一次性生成全部定制表：

```bash
cd trinity-AI/pricing
python3 scripts/sync_hehe_discount_models.py
python3 scripts/build_overseas_three_vendor_quote.py
python3 scripts/build_flagship_cost_plus05_quote.py
```

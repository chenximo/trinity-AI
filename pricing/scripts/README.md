# `pricing/scripts/` — Python 脚本索引

价目 **主流程** 与 **定制报价** 分开；定制 Excel 统一落在 `output/custom-quotes/`。

## 主流程（L3b → L3a）

| 脚本 | 产出（`pricing/output/`） |
|------|---------------------------|
| `rebuild_workbook_from_live_api.py` | `商务洽谈折扣总表.xlsx`（L3b） |
| `build_outward_quote_standard.py` | `Trinity模型报价表.xlsx`、`Trinity模型报价表（内部）.xlsx` |

典型顺序：

```bash
cd trinity-AI/pricing
python3 scripts/rebuild_workbook_from_live_api.py
python3 scripts/build_outward_quote_standard.py
```

## 定制报价（临时，不进主流程上传）

| 脚本 | 产出 |
|------|------|
| `sync_hehe_discount_models.py` | `custom-quotes/Trinity模型报价表_hehe.xlsx` |
| `build_overseas_three_vendor_quote.py` | `custom-quotes/Trinity模型报价表_海外三家定制.xlsx` |
| `build_flagship_cost_plus05_quote.py` | `custom-quotes/Trinity模型报价表_主力模型定制.xlsx` |
| `build_openai_custom_quote.py` | `custom-quotes/Trinity模型报价表_OpenAI定制.xlsx`（客户指定模型，列同对外报价表） |

共用：`custom_quote_workbook.py`（表头/UI）、`xlsx_wechat_compat.py`（微信发文件兼容）。

## 对照 / 工具

| 脚本 | 说明 |
|------|------|
| `media_hub_trinity_crosswalk.py` | Media-Hub ↔ Trinity 折扣对照 |
| `fetch_live_supply_routes.py` | 拉现网线路（供 L3b 重建） |

## `output/` 怎么找

| 目录 / 文件 | 用途 |
|-------------|------|
| `Trinity模型报价表.xlsx` | L3a 外发·仅折扣 |
| `Trinity模型报价表（内部）.xlsx` | L3a 对内完整 |
| `商务洽谈折扣总表.xlsx` | L3b 定价真源 |
| **`custom-quotes/`** | **本目录脚本出的定制报价** |
| `trinity-pricing-*.xlsx` | 刊例对比大册（生文/图/视频） |
| `online/`、`upstream/`、`validate/` | JSON / 校验中间产物 |

详见 [`output/README.md`](../output/README.md)。

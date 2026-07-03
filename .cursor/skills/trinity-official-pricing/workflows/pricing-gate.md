# Workflow · 价目门禁（L1 → L3 → 告警）

> 治理真源：`pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md`  
> 能力清单：[`../tools.yaml`](../tools.yaml) · 确认：[`../confirmation.md`](../confirmation.md)

## 能力引用

| 步骤 | tool id | 说明 |
|------|---------|------|
| 0（按需） | `pricing.supplier.official.text` | 刷新官方价 |
| 0（按需） | `pricing.supplier.aigc` | 刷新 AIGC 价目 |
| 0（按需） | `pricing.supplier.tokenhub.console` | TokenHub CNY 交叉 |
| 0（按需） | `pricing.supplier.bailian.doc` | L3 百炼交叉 |
| **0.5（必跑）** | **`pricing.refresh`** | 官方 + 衍生供应商 + **Excel** |
| **1** | `pricing.gate` | 一条龙门禁 |
| 分项 | `pricing.validate.official-aigc` | 仅 L1 |
| 分项 | `pricing.validate.official-suppliers` | 仅 L3 |
| 推送 | `pricing.alert` | **须确认**（见 confirmation） |

## 何时跑

- 改 `official/seeds`、`trinity-map`、`tier-key`、AIGC `pricing-sheet` 后
- 发刊例 / 商务调价前
- 定期巡检（建议每周）

## 执行

1. 改价/新增后先跑 **`pricing.refresh`**（保证 `trinity-pricing-text.xlsx` 最新）  
2. 再跑 **`pricing.gate`**（official:text → aigc-excel → L1 → L3 → alert dry-run）

也可只跑 gate（内含 official 重拉，但**不含** Excel 重算）。

## 产出

| 文件 | 说明 |
|------|------|
| `output/trinity-pricing-text.xlsx` | **`pricing.refresh` 写入** |
| `output/validate/official-aigc-cross.{json,md}` | L1 交叉报告 |
| `output/validate/official-vs-suppliers.{json,md}` | L3 交叉报告 |
| `output/validate/official-vs-suppliers-alerts.json` | L3 结构化告警 |
| `output/validate/pricing-alerts.json` | 合并告警（L1+L3） |

## 通过 / 失败语义

| 结果 | 含义 | 动作 |
|------|------|------|
| L1 fail | 官方与 AIGC/TokenHub 不一致，或同族档位不足 | **先修种子 / tierKey / 映射**；确认无误再 `pricing.alert` |
| L3 fail | 官方与百炼等转售档位数或价格不一致 | **先查 scrape**；抓取无误再告警厂商商务 |
| `tokenhubNoCoverage` | TokenHub 未上架该模型 | **不 fail**，仅记录 |
| `aigcIntlSkipped` | AIGC 无国际价（如 hy3） | **不 fail**，刊例对比显示 `—` |

## 与对比命令关系

| | `pricing.gate` | `pricing.compare.official` |
|--|----------------|---------------------------|
| 目的 | 阻断错误种子进入下游 | 人读对照表 |
| 含 L4 线上刊例 | ❌ | ✅ |
| 自动刷新线上价 | ❌ | ✅ |

刊例对比见 [`compare-pricing.md`](./compare-pricing.md)。

# Workflow · 价目门禁（L1 → L3 → 告警）

> 治理真源：`pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md`  
> 能力清单：[`../tools.yaml`](../tools.yaml) · 确认：[`../confirmation.md`](../confirmation.md)

**各模态同一套门禁拓扑**；`pricing.gate` 已串联生文 + 生图（生视频 L2/L3 待补）。

## 能力引用

| 步骤 | tool id | 说明 |
|------|---------|------|
| 0（按需） | `pricing.supplier.official.{text,image}` | 刷新官方价 |
| 0（按需） | `pricing.supplier.aigc` / `pricing.supplier.aigc.image` | 刷新 AIGC |
| 0（按需） | `pricing.supplier.tokenhub.console` | TokenHub 交叉 |
| 0（按需） | `pricing.supplier.bailian.doc` / `volcengine:all` | L3 转售 |
| **0.5** | **`pricing.refresh`** | 官方 + 衍生供应商 + **生文与生图 Excel** |
| **0.5（仅生图）** | **`pricing.upstream.image`** | 仅刷新生图 Excel |
| **1** | `pricing.gate` | 一条龙门禁（text + image） |
| 分项 L1 | `pricing.validate.official-aigc` / `.image` | 仅 L2 交叉 |
| 分项 L3 | `pricing.validate.official-suppliers` / `.image` | 仅渠道交叉 |
| 推送 | `pricing.alert` | **须确认**（见 confirmation） |

## `pricing.gate` 步骤（与代码一致）

```text
1. pricing:supplier:official:text
2. pricing:supplier:official:image
3. validate-aigc-excel          （生文+生图商务表 ↔ sheet）
4. validate-official-aigc       （生文 L1↔L2）
5. validate-official-aigc-image （生图 L1↔L2）
6. validate-official-suppliers  （生文 L1↔L3）
7. validate-official-suppliers-image （生图 L1↔L3）
8. emit-pricing-alerts --dry-run
```

任一步 fail → 门禁中断，不得视为真源锁定。

## 何时跑

- 改 `official/seeds`、`trinity-map`、`tier-key`、AIGC `pricing-sheet{,-image}` 后
- 发刊例 / 商务调价前
- 定期巡检（建议每周）

## 执行

**生文**

1. 改价后 `pricing.refresh`（`trinity-pricing-text.xlsx`）
2. `pricing.gate`

**生图**

1. `pricing.supplier.official.image`
2. `pricing.validate.official-aigc.image`（可先单独看 L2 报告）
3. L1 锁定后 `pricing.upstream.image`（`trinity-pricing-image.xlsx`）
4. `pricing.gate`（含 image 步骤；可与生文一并跑）

也可只跑 gate（会重拉 official，但**不含** Excel 重算）。

## 产出

| 文件 | 模态 | 说明 |
|------|------|------|
| `output/trinity-pricing-text.xlsx` | 生文 | `pricing.refresh` 写入 |
| `output/trinity-pricing-image.xlsx` | 生图 | `pricing.upstream.image` 写入 |
| `output/validate/official-aigc-cross.{json,md}` | 生文 | L1 交叉 |
| `output/validate/official-aigc-cross-image.{json,md}` | 生图 | L1 交叉 |
| `output/validate/official-vs-suppliers.{json,md}` | 生文 | L3 交叉 |
| `output/validate/official-vs-suppliers-image.{json,md}` | 生图 | L3 交叉 |
| `output/validate/pricing-alerts.json` | 全模态 | 合并告警 |

## 通过 / 失败语义

| 结果 | 含义 | 动作 |
|------|------|------|
| L1 fail | 官方与 AIGC/TokenHub 不一致，或同族档位不足 | **先修种子 / tierKey / 映射**；确认无误再登记 `pricing-annotations` 或 `pricing.alert` |
| L3 fail | 官方与百炼/火山等档位数或价格不一致 | **先查 scrape**；抓取无误再告警商务 |
| `tokenhubNoCoverage` | TokenHub 未上架 | **不 fail** |
| `aigcIntlSkipped` | 国际站模型跳过国内对比 / AIGC 无国际价 | **不 fail** |
| 生图 `aigc_only` 种子 | 可灵/MJ 等无公开 API 价 | 预期与 AIGC 不一致；登记例外，勿改官方种子 |

## 与刊例对比关系

| | `pricing.gate` | `pricing.upstream.image` |
|--|----------------|--------------------------|
| 目的 | 阻断错误种子进入下游 | L4 人读表 + Excel |
| 含 L4 线上刊例 | ❌ | ✅ |
| 前置 | — | **建议 L1 锁定后** |

刊例对比 workflow：[`compare-pricing.md`](./compare-pricing.md)

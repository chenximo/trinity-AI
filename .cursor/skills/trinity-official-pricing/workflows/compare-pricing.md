# Workflow · 三方价对比（官方 vs 上游 vs 线上）

> 能力清单：[`../tools.yaml`](../tools.yaml)

## 能力引用

| 阶段 | tool id | 必填 |
|------|---------|------|
| 前置 | `pricing.supplier.official.text` | 生文对比时 |
| 前置 | `pricing.supplier.official.image` | 生图对比时 |
| 前置 | `pricing.supplier.official.video` | 生视频对比时 |
| 前置 | `pricing.supplier.tokenhub.console` | 需 TH 列时 |
| 前置 | `pricing.supplier.bailian.doc` | 需百炼列时 |
| 前置 | `pricing.supplier.aigc` | 需 AIGC 列时 |
| **主步骤** | `pricing.compare.official` | ✅ |

`pricing.compare.official` 会自动 `GET /v1/prices` 刷新线上刊例；本地可设 `PRICING_SKIP_ONLINE_FETCH=1`。  
单独拉刊例可用 `pricing.fetch`。

### 对比参数（写在命令后，见 workflow 叙事）

- 单模型：`… -- <vendorModelId>`
- 整模态：`… -- --modality=text|image|video|all`

## 产出

| 文件 | 说明 |
|------|------|
| `pricing/output/official/text.md` | 生文对照表 |
| `pricing/output/official/image.md` | 生图对照表 |
| `pricing/output/official/video.md` | 生视频对照表 |
| `pricing/output/official/{modality}.json` / `.xlsx` / `.csv` | 机器可读与 Excel |

## 表头含义

| 列 | 来源 |
|----|------|
| 官方价 | `official/output/{modality}/vendor-pricing.json` |
| TokenHub | `tokenhub/output/pricing-console-api.json` |
| 百炼 | `bailian/output/pricing-api.json` |
| AIGC国内/国际 | `aigc/output/pricing-api.json` |
| 线上刊例 | `output/online/prices-api.json` |

join 键：`official/trinity-map.json` 的 Trinity `modelId`。

## 汇报要点

- 官方价与上游价差（注意 CNY vs USD 单位）
- 线上刊例相对上游是否已加价
- `officialStatus` 为 `未收录` 时提示补 catalog/map

## 与 validate / gate 区别

| | `pricing.compare.official` | `pricing.validate.official-aigc` | `pricing.gate` |
|--|---------------------------|----------------------------------|----------------|
| 含官方价 | ✅ | ✅（种子） | ✅ |
| 含 L4 线上刊例 | ✅ | ❌ | ❌ |
| 含 L1 AIGC/TokenHub 交叉 | 人读表 | ✅ 阻断 | ✅ |
| 含 L3 百炼交叉 | 人读表 | ❌ | ✅ |
| 自动刷新线上价 | ✅ | ❌ | ❌ |

门禁详情：[`pricing-gate.md`](./pricing-gate.md) · 治理文档：`pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md`

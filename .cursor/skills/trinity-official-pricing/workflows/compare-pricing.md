# Workflow · 三方价对比（官方 vs 上游 vs 线上）

## 前置

```bash
cd trinity-AI

# 1. 官方价（按模态）
npm run pricing:supplier:official:text
npm run pricing:supplier:official:image   # 按需
npm run pricing:supplier:official:video   # 按需

# 2. 线上刊例
npm run pricing:fetch   # 对比命令也会自动 GET /v1/prices

# 3. 上游（对比 TokenHub/百炼/AIGC 时需要）
npm run pricing:supplier:tokenhub:console  # 按需
npm run pricing:supplier:bailian:doc       # 按需
npm run pricing:supplier:aigc              # 按需
```

## 对比命令

```bash
# 单模型
npm run pricing:compare:official -- gpt-5.5

# 整模态（trinity-map 内该模态全部）
npm run pricing:compare:official -- --modality=text
npm run pricing:compare:official -- --modality=image
npm run pricing:compare:official -- --modality=video

# 全模态
npm run pricing:compare:official -- --modality=all
```

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

| | `pricing:compare:official` | `pricing:validate:official-aigc` | `pricing:gate` |
|--|---------------------------|----------------------------------|----------------|
| 含官方价 | ✅ | ✅（种子） | ✅ |
| 含 L4 线上刊例 | ✅ | ❌ | ❌ |
| 含 L1 AIGC/TokenHub 交叉 | 人读表 | ✅ 阻断 | ✅ |
| 含 L3 百炼交叉 | 人读表 | ❌ | ✅ |
| 自动刷新线上价 | ✅ | ❌ | ❌ |

门禁详情：[`pricing-gate.md`](./pricing-gate.md) · 治理文档：`pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md`

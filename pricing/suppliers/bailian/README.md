# 阿里云百炼价目抓取

[百炼模型价格文档](https://help.aliyun.com/zh/model-studio/model-pricing) → 归一化价目，结构与 TokenHub `pricing-api.json` 对齐。

## 目录

| 路径 | 说明 |
|------|------|
| `scrape-pricing.mjs` | 抓取官方文档 + 自动归一化 |
| `normalize-pricing.mjs` | 仅从 `bailian-pricing.json` 重新归一化 |
| `lib/pricing-api.mjs` | 解析、阶梯续行修复、隐式缓存计算 |
| `output/bailian-pricing.json` | 原始表格（247 表） |
| `output/pricing-api.json` | **主数据**（models + tiers） |
| `output/pricing-sample-10.md` | 示例 Markdown 表格 |

## 命令

```bash
cd trinity-AI

# 抓取 + 归一化（推荐）
npm run bailian:pricing:doc

# 仅重新解析已有 raw JSON
npm run bailian:pricing:normalize

# 生成 10 条示例 Markdown 表
npm run bailian:pricing:sample
```

## 计费规则（当前实现）

| 项目 | 规则 |
|------|------|
| 输入/输出 | 来自官网价目表，单位 **元/百万 tokens** |
| 隐式缓存命中 | 按模型比例（默认 input×**20%**；Kimi/万擎/GLM/MiniMax 等见 `lib/cache-policy.mjs`） |
| 支持缓存 | 价目表标注「上下文缓存享有折扣」的模型 |
| Batch 半价 | 仅标记 `supportsBatch`，价目用标准推理价（与缓存互斥） |
| 多阶梯 | 自动修复 HTML 表格续行错位 |

## 输出字段（与 TokenHub 对齐）

- `models[].modelId` / `tiers[].input` / `output` / `cache`
- `supportsCache` / `cachePolicy: "implicit"`
- `region` / `mode` / `section`（百炼特有，便于筛选）

## 说明

- 暂未做「同模型取高价」合并；同一 `modelId` 的不同 snapshot、地域、模式仍分行保留
- `limits`（TPM/上下文）待补抓限流文档或控制台

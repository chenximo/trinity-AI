# 阿里云百炼国际站价目抓取

双真源（**仅本渠道**）：

| 源 | URL / 方式 |
|----|-----|
| 帮助中心 EN | https://www.alibabacloud.com/help/en/model-studio/model-pricing （DOM 表） |
| 控制台价目 | https://modelstudio.console.alibabacloud.com/ap-southeast-1?tab=doc#/doc/?type=model&url=prices → 同页 **`listModelPrices` API**（匿名可拉，含 Implicit Cache 明文） |

规则：入/出**一致**才写入 `pricing-api.json`；不一致或单侧独有 → `output/dual-source-diff.*` 待人工确认。缓：仅表/API 明文（控制台有则合并进一致档）；**禁止比例推算**。

## 目录

| 路径 | 说明 |
|------|------|
| `scrape-pricing.mjs` | Playwright 双源抓取 + 对账 + 归一化 |
| `normalize-pricing.mjs` | 仅从 raw JSON 重新归一化（不重新对账） |
| `lib/pricing-api.mjs` | 美元解析、List price、双源 diff |
| `output/bailian-intl-pricing-help.json` | 帮助中心原始表 |
| `output/bailian-intl-pricing-console.json` | 控制台原始表（若可解析） |
| `output/dual-source-diff.json` / `.md` | 不一致 / 单侧 / 控制台失败说明 |
| `output/pricing-api.json` | **主数据**（双源一致档，USD） |

## 命令

```bash
cd trinity-AI

npm run pricing:supplier:bailian-intl:doc
npm run pricing:supplier:bailian-intl:normalize

# 接入 Excel（含「百炼国际」Sheet）
npm run pricing:upstream
```

## 计费规则（当前实现）

| 项目 | 规则 |
|------|------|
| 输入/输出 | 双源明文一致才入真源；单位 **美元/百万 tokens** |
| List vs 促销 | 有 `List price $x` 时取牌价；忽略 Limited-time 折扣数字 |
| 缓存 | **不推算**；表上无则 ⚠ |
| Excel 分表范围 | **Deployment scope = International** 且生文 TOKEN |

## 与国内百炼的关系

| | `bailian`（百炼北京） | `bailian-intl`（百炼国际） |
|--|----------------------|---------------------------|
| 文档 | help.aliyun.com 中文 | 帮助中心 EN + 控制台双源 |
| 币种 | 元 | 美元 |
| Excel | 百炼北京 | 百炼国际 |
| 双真源核对 | 否 | **是** |
| 筛选 | 中国内地 | International |

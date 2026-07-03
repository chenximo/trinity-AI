# Workflow · 新增进货/直连渠道

用户示例：「加网聚云联-云门户，对齐 official GPT/Gemini」。

> 能力清单：[`../tools.yaml`](../tools.yaml)

## 渠道类型

| 类型 | 维护方式 | 示例 |
|------|----------|------|
| **official 筛选** | `config.mjs` 指定 vendor，build 从 official 复制 | 网聚云联·云门户 |
| **手工 sheet** | `data/pricing-sheet.mjs` | 火山方舟、AIGC |
| **爬虫** | scrape + normalize | TokenHub、百炼 |

## Checklist

```
- [ ] Step 1: 定渠道类型与 trinity-map 规则
- [ ] Step 2: 实现 build-pricing + 接入 gen-upstream SUPPLIERS（首次）
- [ ] Step 3: package.json 加 pricing:supplier:xxx
- [ ] Step 4: tools.yaml 登记 tool id
- [ ] Step 5: pricing.refresh（必跑）→ Excel 含新 Sheet
- [ ] Step 6: （可选）pricing.gate
```

## Step 5 — 必跑

```bash
npm run pricing:refresh
```

产出 **`pricing/output/trinity-pricing-text.xlsx`** 及 `output/upstream/` 下对应 md/csv。

**未完成 Step 5 不算交付。**

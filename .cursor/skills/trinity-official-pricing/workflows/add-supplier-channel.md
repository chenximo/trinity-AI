# Workflow · 新增进货/直连渠道

用户示例：「加网聚云联-云门户，对齐 official GPT/Gemini」。

> 能力清单：[`../tools.yaml`](../tools.yaml)

## 渠道类型

| 类型 | 维护方式 | 示例 |
|------|----------|------|
| **official 直连** | `official-direct/channels/*.mjs` + 登记 `index.mjs` | 网聚云联·云门户、中转站-cust |
| **爬虫** | scrape + normalize → `output/*/pricing-api.json` | TokenHub、百炼、**火山方舟** |
| **手工 sheet** | `data/pricing-sheet.mjs` | **仅 AIGC**（商家给表，无公开定价页） |

### official 直连（价 = official，不用每个写脚本）

共享构建器：`pricing/suppliers/official-direct/`  
说明：[`pricing/suppliers/official-direct/README.md`](../../../../pricing/suppliers/official-direct/README.md)

```
新增渠道只需：
1. channels/<supplier-id>.mjs     ← 配置 vendors / brand / portalUrl
2. channels/index.mjs              ← push 到 OFFICIAL_DIRECT_CHANNELS
3. gen-upstream SUPPLIERS 一行     ← Excel Sheet（一次性接线）
4. npm run pricing:refresh
```

```bash
npm run pricing:supplier:official-direct:all   # 构建全部直连渠道
npm run pricing:supplier:relay-cust            # 单个渠道别名
```

## Checklist

```
- [ ] Step 1: 定渠道类型（上表）
- [ ] Step 2: official 直连 → channels/*.mjs；爬虫/手工 → 各目录实现
- [ ] Step 3: 接入 gen-upstream SUPPLIERS（首次）
- [ ] Step 4: package.json / tools.yaml（可选别名）
- [ ] Step 5: pricing.refresh（必跑）→ Excel 含新 Sheet
- [ ] Step 6: （可选）pricing.gate
```

## Step 5 — 必跑

```bash
npm run pricing:refresh
```

产出 **`pricing/output/trinity-pricing-text.xlsx`** 及 `output/upstream/` 下对应 md/csv。

**未完成 Step 5 不算交付。**

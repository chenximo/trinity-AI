---
title: 生视频刊例发布 SOP
---

# 生视频刊例发布 SOP

> **适用**：新增 video 模型、官方/AIGC 价变更、拟更新对客户刊例。  
> **Skill**：`trinity-official-pricing` · **对照**：[三模态索引](./modality-index)

---

## 前置

- 模型已在 Trinity 线上或计划上架（`GET /v1/prices` 有 slug，或 registry 已登记）
- 明确刊例策略：**官方优先 cascade**（见 [价目全流程](./workflow) P8）

---

## Checklist

```
- [ ] 1. 录入官方价（catalog + seeds + map + registry）
- [ ] 2. AIGC 进货价（pricing-sheet-video + trinity-map-video）
- [ ] 3. 拉取 / 构建真源 JSON
- [ ] 4. L2/L3 校验
- [ ] 5. 刊例对比 Excel（upstream:video）
- [ ] 6. 生成草案 + diff
- [ ] 7. 人工确认 diff
- [ ] 8. publish 本地 L4 缓存
- [ ] 9. 生产部署（见 listing-deploy）
```

---

## Step 1 — 录入映射（新模型）

| 文件 | 内容 |
|------|------|
| `pricing/suppliers/official/data/catalog/video.mjs` | vendor · docUrl |
| `pricing/suppliers/official/data/seeds/video.mjs` | 官方价档位 |
| `pricing/suppliers/official/trinity-map.json` | trinityId → vendorModelId |
| `pricing/config/video-model-registry.mjs` | **onlineSlug · trinityId · listingAttribute** |
| `pricing/suppliers/aigc/data/pricing-sheet-video.mjs` | AIGC 进货价 |
| `pricing/suppliers/aigc/trinity-map-video.json` | Trinity → AIGC SKU |

**生视频专有**：

- 可灵 **积分/秒** → 与 AIGC 国内 **直接比**
- 混元/Vidu **积分/次** → 参考 `video-reference-conversion.mjs`
- Seedance **token 价** → 刊例为 $/百万 tokens，与 AIGC 元/秒标 `ℹ口径不同`

快捷脚手架：`node pricing/suppliers/official/scaffold-official-model.mjs --modality=video …`

---

## Step 2–3 — 构建真源

```bash
npm run pricing:supplier:official:video
npm run pricing:supplier:aigc:video
```

产出：

- `suppliers/official/output/video/vendor-pricing.json`
- `suppliers/aigc/output/pricing-api-video.json`

---

## Step 4 — 校验

```bash
npm run pricing:validate:official-aigc-video
npm run pricing:validate:official-suppliers-video
```

| 报告 | 路径 |
|------|------|
| L1↔L2 | `output/validate/official-aigc-video.json` |
| L1↔L3 | `output/validate/official-suppliers-video.json` |

发刊例前建议全模态门禁：`npm run pricing:gate`

---

## Step 5 — 刊例对比 Excel

```bash
PRICING_SKIP_ONLINE_FETCH=1 npm run pricing:upstream:video   # 用本地 prices-api
# 或
npm run pricing:upstream:video   # 自动拉最新线上价对比
```

产出：`trinity-pricing-video.xlsx` · Sheet「刊例对比校验-生视频」  
主表进货列与生文/生图一致：**AIGC国内 · AIGC国际 · TokenHub · OpenRouter**（火山方舟仅 L3 分表）  
覆盖检查：`output/upstream/coverage-video.md`（P6 线上 slug 不可少）

---

## Step 6–7 — 草案与 diff

```bash
npm run pricing:gen-official:video
npm run pricing:diff:official-video
```

| 产出 | 说明 |
|------|------|
| `draft/official-prices-api-video.json` | **上架源 JSON**（25 模型） |
| `draft/official-prices-api-video.meta.json` | cascade 统计 |
| `draft/official-prices-api-video-diff.*` | vs 当前 `online/prices-api.json` |

**看 diff 时**：

- ≤0.5% → 可视为一致
- `ℹ口径不同` → 跳过 % 比较
- 官方锚定 vs AIGC 差很多 → **预期**（非 bug），需产品确认毛利策略

---

## Step 8 — 发布本地 L4 缓存

```bash
npm run pricing:publish-official:video
```

- 备份：`online/prices-api.old.json`（gitignore）
- 写入：`online/prices-api-video.json` + flat/index/csv

> **模态隔离（P1-1）**：各模态独立文件 `prices-api-{text,image,video}.json`；legacy `prices-api.json` 仅作回退。

---

## Step 9 — 生产上线

见 [刊例上线部署](./listing-deploy)。

---

## 仅改价（已有模型）

省略 Step 1，从 Step 2 或 Step 6 开始：

```bash
# 只改了 official seed
npm run pricing:supplier:official:video
npm run pricing:gen-official:video && npm run pricing:diff:official-video

# 只改了 AIGC sheet
npm run pricing:supplier:aigc:video
npm run pricing:validate:official-aigc-video
npm run pricing:gen-official:video && npm run pricing:diff:official-video
```

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | 初版 · 对齐 gen/diff/publish-official:video |

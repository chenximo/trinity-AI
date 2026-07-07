---
title: 新增模型 SOP
---

# 新增模型 SOP

> **前提**：对应模态的生产线已建好（生文 / 生图 / 生视频）。  
> **本质**：往已有 pipeline **填真源 + 重跑命令**，不是重新设计系统。  
> **Skill**：`trinity-official-pricing` · [三模态索引](./modality-index)

---

## 一、先选模态

| 模态 | 映射中心 | 典型耗时 |
|------|----------|----------|
| **生文** | `official/trinity-map.json` + `aigc/trinity-map.json` | 半天 |
| **生图** | 同上 + image catalog | 半天 |
| **生视频** | **`video-model-registry.mjs`** + `listingAttribute` | 半天～1 天 |

不能一条流程通吃 → 见 [三模态索引](./modality-index)。

---

## 二、通用步骤（三模态共用骨架）

```mermaid
flowchart LR
  A[1. 查重] --> B[2. 官方 catalog+seed+map]
  B --> C[3. AIGC/进货 map]
  C --> D[4. supplier:official + aigc]
  D --> E[5. validate L2]
  E --> F[6. upstream Excel]
  F --> G[7. 可选 gen→diff→publish]
```

| 步 | 做什么 | 命令 |
|----|--------|------|
| 1 | 确认未重复登记 | `rg` catalog / map / registry |
| 2 | 录入官方价 L1 | 改 seeds + catalog + map |
| 3 | 录入进货价 L2 | AIGC sheet / 爬虫渠道 |
| 4 | 生成 JSON 真源 | `pricing:supplier:official:{modality}` · `aigc:*` |
| 5 | 交叉校验 | `pricing:validate:official-aigc-*` |
| 6 | 刊例对比表 | `pricing:upstream` / `:image` / `:video` |
| 7 | 更新对客户刊例 | `gen-official:*` → `diff` → `publish` |

**改价后必跑 upstream**，Excel 才算最新。

---

## 三、按模态快捷路径

### 生文

```bash
# 改 seeds/text.mjs + trinity-map + aigc pricing-sheet.mjs
npm run pricing:supplier:official:text
npm run pricing:supplier:aigc
npm run pricing:refresh          # 含生文 Excel
npm run pricing:gate
```

刊例草案（legacy）：`pricing:gen-65` → `draft/0.65_prices-api.json`

Skill：`.cursor/skills/trinity-official-pricing/workflows/add-official-model.md`

### 生图

```bash
npm run pricing:supplier:official:image
npm run pricing:supplier:aigc:image
npm run pricing:upstream:image
npm run pricing:gen-official:image
npm run pricing:diff:official-image
npm run pricing:publish-official:image   # → prices-api-image.json
```

### 生视频

```bash
npm run pricing:supplier:official:video
npm run pricing:supplier:aigc:video
npm run pricing:upstream:video
npm run pricing:rollout:video            # gen + diff
npm run pricing:rollout:video -- --publish --skip-gen
```

详细 → [生视频刊例发布 SOP](./video-rollout)

Skill：`.cursor/skills/trinity-official-pricing/workflows/add-official-model-video.md`

---

## 四、生视频额外字段（易漏）

| 字段 | 文件 | 作用 |
|------|------|------|
| `onlineSlug` | `video-model-registry.mjs` | 对齐 `GET /v1/prices` |
| `listingAttribute` | 同上 | cascade 时选 AIGC 哪一列（如 GV=`无声`） |
| 积分/次折算 | `video-reference-conversion.mjs` | 混元/Vidu 等 |

---

## 五、运营侧（模型上架）

工程价目更新 ≠ 用户可见刊例。还需：

1. 运营后台模型上架（[models-routes](../operations/models-routes)）
2. 生产 `GET /v1/prices` 部署（[listing-deploy](./listing-deploy)）

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | 初版 |

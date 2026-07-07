---
title: 三模态价目索引
---

# 三模态价目索引

> **一页对照**：生文 / 生图 / 生视频在价目体系里的差异。  
> **共用治理**：[价目全流程](./workflow) · **工程细则**：`pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md`

同一套 L0–L4 分层与 P6–P8 铁律；**操作命令与对比逻辑按模态分开**，不能一条 SOP 通吃。

---

## 对照表

| 维度 | 生文 | 生图 | 生视频 |
|------|------|------|--------|
| **计价单位** | 元/百万 tokens（入/出/缓） | 元/张 | 元/秒 · 积分/次 · $/百万 video tokens |
| **档位维度** | 上下文长度 · 输出档 | 1K/2K/4K 分辨率 | 分辨率 + 有声/无声 |
| **L1 真源** | `official/output/text/` | `official/output/image/` | `official/output/video/` |
| **映射中心** | `official/trinity-map.json` | trinity-map + image catalog | **`video-model-registry.mjs`** + `listingAttribute` |
| **对比表行主键** | 官方 catalog 驱动 | 官方 × **档位并集**（P7） | **线上 slug 全量** ∪ 官方补行（P6） |
| **Excel** | `trinity-pricing-text.xlsx` | `trinity-pricing-image.xlsx` | `trinity-pricing-video.xlsx` |
| **刊例对比 Sheet** | 刊例对比校验-生文 | 刊例对比校验-生图 | 刊例对比校验-生视频 |
| **L4 草案路径** | `draft/0.65_prices-api.json`（legacy） | `draft/official-prices-api-image.json` | `draft/official-prices-api-video.json` |
| **L4 生成命令** | `pricing:gen-65` / `gen-65-official` | `pricing:gen-official:image` | `pricing:gen-official:video` |
| **L4 发布** | 人工 / 运营后台 | `publish-official:image` ✅ | `publish-official:video` ✅ |
| **FX 刊例换算** | 6.5（0.65 草案）/ 7.25 | **7.25** | **7.25** |

---

## 按场景选命令

### 维护官方价（L1）

```bash
npm run pricing:supplier:official:text    # 生文
npm run pricing:supplier:official:image   # 生图
npm run pricing:supplier:official:video   # 生视频
```

### 交叉校验（L1↔L2 / L1↔L3）

```bash
npm run pricing:validate:official-aigc          # 生文
npm run pricing:validate:official-aigc-image    # 生图
npm run pricing:validate:official-aigc-video    # 生视频

npm run pricing:validate:official-suppliers       # 生文 L3
npm run pricing:validate:official-suppliers-image # 生图 L3
npm run pricing:validate:official-suppliers-video # 生视频 L3
```

### 刊例对比 Excel（L4 决策面）

```bash
npm run pricing:upstream          # 生文
npm run pricing:upstream:image    # 生图
npm run pricing:upstream:video    # 生视频（P6 硬校验线上全覆盖）
```

### 生成可上线刊例 JSON（官方 cascade）

```bash
npm run pricing:gen-official:image
npm run pricing:gen-official:video

npm run pricing:diff:official-image
npm run pricing:diff:official-video

npm run pricing:rollout:video -- --publish --skip-gen
```

Cascade 优先级：**官方 → AIGC 国际 → AIGC 国内 ÷7.25 → TokenHub → 火山**。

---

## 生视频额外注意

| 项 | 说明 |
|----|------|
| `listingAttribute` | 如 GV = `"无声"`，决定 AIGC 哪一列 |
| 积分/次 | 混元/Vidu 需 `video-reference-conversion.mjs` 折算 |
| `ℹ口径不同` | token 计价 vs 元/秒，不可比百分比 |
| 映射真源 | `pricing/config/video-model-registry.mjs` |

详细 SOP → [生视频刊例发布](./video-rollout)。

---

## 关联

| 页 | 用途 |
|----|------|
| [价目全流程](./workflow) | L0–L4 主流程 |
| [日常操作](./operations) | refresh / gate |
| [生视频刊例发布](./video-rollout) | 加模型 · 改价 · publish |
| [刊例上线部署](./listing-deploy) | draft → 生产 API |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | 初版 |

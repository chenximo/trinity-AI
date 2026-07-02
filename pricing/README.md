# Trinity 价目体系

与 `apps/`、`packages/` 同级的**价目域**：上游真源、模型原厂价、线上刊例、换算草案与校验。

```
trinity-AI/pricing/
├── README.md              # 本文件：流程与命令
├── STRUCTURE.md           # 完整目录树与各路径职责（详细）
├── pipeline/              # fetch / upstream / validate / gen-65 / diff
├── suppliers/
│   ├── SOURCES.md         # 各上游 JSON 真源索引
│   ├── tokenhub/          # TokenHub 控制台价
│   ├── bailian/           # 百炼文档价
│   ├── aigc/              # AIGC 内部价目表
│   └── official/          # 模型原厂官网价（按模态拆分）
│       ├── data/
│       │   ├── catalog/   # text.mjs / image.mjs / video.mjs
│       │   ├── seeds/
│       │   └── pricing-urls.mjs
│       ├── lib/
│       ├── fetch-pricing.mjs
│       ├── gen-table.mjs
│       ├── trinity-map.json
│       └── output/
│           ├── text/      # vendor-pricing.json（生文）
│           ├── image/     # vendor-pricing.json（生图）
│           └── video/     # vendor-pricing.json（生视频）
├── config/                # supplier-discounts.json
└── output/                # 流水线产出（刊例、汇总、校验、草案）
```

> 各子目录文件说明见 **[STRUCTURE.md](./STRUCTURE.md)**。

---

## 三类数据（不要混用）

| 层级 | 是什么 | 真源文件 | 谁产生 |
|------|--------|----------|--------|
| **线上刊例** | 平台已发布、对用户扣费价 | `output/online/prices-api.json` | `GET /v1/prices` · `npm run pricing:fetch` |
| **转售上游** | TokenHub / 百炼 / AIGC 挂牌价 | `suppliers/{tokenhub,bailian,aigc}/…`（见 [SOURCES.md](./suppliers/SOURCES.md)） | 爬虫或人工价目表 |
| **模型原厂** | 各厂商官网文档/API 权威价 | `suppliers/official/output/{text,image,video}/vendor-pricing.json` | `npm run pricing:supplier:official:*` |
| **建议刊例草案** | 按上游换算后的拟上线价（同构 API） | `output/draft/0.65_prices-api.json` 等 | `npm run pricing:gen-65` |

**原则**：用**上游真源**校验**线上刊例**是否合理；线上是结果，上游是依据。

---

## 完整流程（推荐按序执行）

调价、上新、或定期对账时，按下面 **6 步**跑一遍。

```
  ┌──────────────┐
  │ 0. 上游真源   │  suppliers/*  （爬虫 / 改 AIGC 价目表）
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ 1. 拉线上刊例 │  pricing:fetch  →  prices-api.json
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ 2. 汇总对照   │  pricing:upstream  →  summary / Excel / upstream-pricing.json
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ 3. 校验 ★    │  pricing:validate  →  线上 vs 各上游（抽样或指定模型）
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ 4. 生成草案   │  pricing:gen-65  →  0.65_prices-api.json
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ 5. 全量 diff  │  pricing:diff:065  →  线上 vs 草案（全模型）
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ 6. 人工决策   │  看报告 → 是否改平台刊例 / 改换算规则 / 补映射
  └──────────────┘
```

### 步骤 0 — 更新上游真源

| 供应商 | 命令 | 真源 |
|--------|------|------|
| **原厂·生文** | `npm run pricing:supplier:official:text` | `suppliers/official/output/text/vendor-pricing.json` |
| **原厂·生图** | `npm run pricing:supplier:official:image` | `suppliers/official/output/image/vendor-pricing.json` |
| **原厂·生视频** | `npm run pricing:supplier:official:video` | `suppliers/official/output/video/vendor-pricing.json` |
| TokenHub | `npm run pricing:supplier:tokenhub:console` | `suppliers/tokenhub/output/pricing-console-api.json` |
| 百炼 | `npm run pricing:supplier:bailian:doc` | `suppliers/bailian/output/pricing-api.json` |
| AIGC | 编辑 `suppliers/aigc/data/pricing-sheet.mjs`（及 `trinity-map.json`）后 `npm run pricing:supplier:aigc` | `pricing-sheet.mjs` |

可选：各供应商 `npm run pricing:supplier:*:sample` 生成人读 Markdown（TokenHub 默认全量 `pricing-table.md`）。

### 步骤 1 — 拉线上刊例

```bash
npm run pricing:fetch
```

- 写入 `output/online/prices-api.json`（旧版自动备份为 `online/prices-api.old.json`）
- 这是**平台当前刊例**，后续所有校验都拿它对齐

### 步骤 2 — 汇总对照（上游 + 线上）

```bash
npm run pricing:upstream
```

依赖：步骤 0 真源 + 步骤 1 的 `prices-api.json`（或缓存）。

主要产出：

| 文件 | 用途 |
|------|------|
| `upstream/summary.md` / `summary.csv` | Trinity 全模型 · 三上游 + 刊例 USD |
| **`trinity-pricing.xlsx`** | 对外唯一 Excel 总册（多 Sheet 增量更新） |
| `upstream/upstream-pricing.json` | 机器可读全量（**校验脚本依赖**） |
| `upstream/{tokenhub,bailian,aigc-*}/` | 分供应商 md / csv |

折扣：改 `config/supplier-discounts.json` 后重跑本步。

### 步骤 3 — 校验（线上 vs 上游真源）★

```bash
# 默认 3 个代表模型（deepseek-v3.2 · qwen3.5-plus · gpt-4o），现场拉 API 对比各上游
npm run pricing:validate

# 指定模型
npm run pricing:validate -- glm-4-7-251222 gpt-5.5 claude-sonnet-4-6

# 换汇率粗算 CNY→USD（默认 7.25）
FX_CNY_PER_USD=6.5 npm run pricing:validate
```

**必须先完成步骤 2**（生成 `upstream-pricing.json`）。

产出：

| 文件 | 说明 |
|------|------|
| `output/validate/sample.md` | 线上价 vs TokenHub / 百炼 / AIGC 国内/国际（主档） |
| `output/validate/sample.json` | 同上，机器可读 |

本步回答：「**线上刊例和各上游官网价是否对得上**」（按汇率换算后的粗算）。

> 全量 58/59 模型请看步骤 5 的 `pricing:diff:065`；步骤 3 适合发版前抽代表模型或排查单模型。

### 步骤 4 — 生成建议刊例草案（0.65）

```bash
npm run pricing:gen-65
```

- 以 `prices-api.json` 为**结构模板**，填入上游换算价（`optimized_0.65` 规则）
- 产出 `output/draft/0.65_prices-api.json` + `0.65_prices-api.meta.json`
- 格式与线上一致，可用于「拟替换刊例」预览

7.25 版：`npm run pricing:gen-725`

### 步骤 5 — 全量 diff（线上 vs 草案）

```bash
npm run pricing:diff:065
```

产出 `output/draft/0.65_prices-api-diff.md` / `.json` / `.csv`：每个 Trinity 模型主档入/出/缓偏差。

7.25 对照：`npm run pricing:diff`

### 步骤 6 — 人工决策

根据校验与 diff 报告判断：

- 线上已与上游策略一致 → 归档即可
- 某模型缺上游 / 映射错 → 补爬虫、`trinity-map.json` 或价目表
- 拟调整平台刊例 → 用 `0.65_prices-api.json` 作草案参考（非自动上线）

---

## 一条龙命令（复制执行）

```bash
cd trinity-AI

# 0. 上游（按需执行，不必每次全爬）
npm run pricing:supplier:tokenhub:console
npm run pricing:supplier:bailian:doc
npm run pricing:supplier:aigc

# 1–5. 刊例 + 汇总 + 校验 + 草案 + diff
npm run pricing:fetch
npm run pricing:upstream
npm run pricing:validate
npm run pricing:gen-65
npm run pricing:diff:065
```

---

## 命令速查

| 命令 | 作用 |
|------|------|
| `pricing:fetch` | 拉线上 `GET /v1/prices` |
| `pricing:upstream` | 汇总上游 + 线上 → Excel / `upstream-pricing.json` |
| `pricing:validate` | **校验**：线上 vs 各上游（抽样） |
| `pricing:compare:official` | **三方对比**：官方 vs 上游 vs 线上（按模态） |
| `pricing:gen-65` | 生成 `0.65_prices-api.json` 草案 |
| `pricing:gen-725` | 生成 `0.725_prices-api.json` |
| `pricing:diff:065` | 全量 diff：线上 vs 0.65 草案 |
| `pricing:diff` | 全量 diff：线上 vs 0.725 草案 |

旧别名 `compare:*`、`tokenhub:pricing:*`、`aigc:pricing` 仍可用。

---

## 产出目录（`output/`）

索引见 [output/README.md](./output/README.md)。主要路径：

| 路径 | 步骤 | 说明 |
|------|------|------|
| `online/prices-api.json` | 1 | **线上刊例真源** |
| `upstream/upstream-pricing.json` | 2 | 三上游 + 刊例汇总 JSON |
| **`trinity-pricing.xlsx`** | 2+ | **对外唯一 Excel 总册**（摘要 / 上游 / 官方 / OR） |
| `upstream/tokenhub/` 等 | 2 | 分上游 md / csv |
| `validate/sample.md` | 3 | **校验报告** |
| `official/text.md` | — | 官方 vs 上游 vs 线上 |
| `openrouter/text.md` | — | 官网 vs OpenRouter |
| `draft/0.65_prices-api.json` | 4 | 建议刊例草案 |
| `draft/0.65_prices-api-diff.md` | 5 | 全量偏差报告 |

---

## 文档索引

- **[STRUCTURE.md](./STRUCTURE.md)** — 完整目录树（含 `official` 模态拆分）
- **[docs/OFFICIAL-PRICING-SKILL-DESIGN.md](./docs/OFFICIAL-PRICING-SKILL-DESIGN.md)** — 官方价 Skill 与三方对比设计稿
- [suppliers/SOURCES.md](./suppliers/SOURCES.md) — 各上游 JSON 真源
- [pipeline/README.md](./pipeline/README.md) — 流水线脚本说明
- [suppliers/official/README.md](./suppliers/official/README.md) — 原厂价目（生文/生图/生视频）
- [suppliers/tokenhub/README.md](./suppliers/tokenhub/README.md)
- [suppliers/bailian/README.md](./suppliers/bailian/README.md)
- [suppliers/aigc/README.md](./suppliers/aigc/README.md) — 含 `trinity-map.json` 说明
- [docs/00-协作与工作流/工程师/prices接口文档.md](../docs/00-协作与工作流/工程师/prices接口文档.md)

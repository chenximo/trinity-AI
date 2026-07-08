# `pricing/` 目录结构说明

与 `apps/`、`packages/` 同级的**价目域**：上游真源、模型原厂价、线上刊例、换算草案与校验。

根路径：`trinity-AI/pricing/`

---

## 总览

```
trinity-AI/pricing/
├── README.md              # 价目体系总说明、六步流程、命令速查
├── STRUCTURE.md           # 本文件：目录树与各路径职责
├── pipeline/              # 拉线上价、汇总、校验、生成 0.65/0.725、diff
├── suppliers/             # 各上游供应商 + 模型原厂价目
│   ├── SOURCES.md         # 各供应商 JSON 真源索引
│   ├── tokenhub/          # 腾讯云 TokenHub 控制台价
│   ├── bailian/           # 阿里云百炼文档价
│   ├── aigc/              # 腾讯云 AIGC 内部价目表
│   └── official/          # 模型原厂官网价（按模态拆分）
├── config/                # 上游折扣等流水线配置
└── output/                # 流水线产出（线上刊例、汇总、校验、草案、diff）
```

---

## `pipeline/` — 价目流水线

对 **Trinity 线上刊例** 与 **上游真源** 做拉取、汇总、校验、换算草案与全量对比。

```
pipeline/
├── README.md
├── fetch-online-prices.mjs       # pricing:fetch → prices-api.json
├── gen-upstream-pricing.mjs      # pricing:upstream → upstream-pricing.json / Excel
├── validate-online-pricing.mjs   # pricing:validate → 线上 vs 各上游（抽样）
├── gen-725-prices-api.mjs        # pricing:gen-65 / gen-725 → 草案 JSON
├── compare-online-vs-scraped.mjs # pricing:diff / diff:065 → 全量偏差报告
└── lib/
    ├── paths.mjs                 # output/、suppliers/ 路径常量
    ├── parse-online-prices.mjs   # 解析 GET /v1/prices 档位
    ├── build-upstream-prices-api.mjs
    ├── build-rows.mjs
    ├── units.mjs
    ├── pricing-diff.mjs
    ├── pricing-compare.mjs
    ├── render-markdown.mjs
    └── export-excel.mjs
```

| 命令 | 主要产出（均在 `../output/`） |
|------|-------------------------------|
| `pricing:fetch` | `prices-api.json` |
| `pricing:upstream` | `upstream-pricing.json`、`trinity-pricing.xlsx`、`summary.md` |
| `pricing:validate` | `pricing-validation-sample.md` |
| `pricing:gen-65` | `0.65_prices-api.json` |
| `pricing:diff:065` | `0.65_prices-api-diff.md` |

详见 [pipeline/README.md](./pipeline/README.md)。

---

## `suppliers/` — 上游与原厂

四类数据来源，**不要混用**：

| 目录 | 角色 | 价是什么 |
|------|------|----------|
| `tokenhub/` | 转售上游 | TokenHub 控制台挂牌价（元/百万 tokens 等） |
| `bailian/` | 转售上游 | 百炼官网文档价（元/百万 tokens） |
| `aigc/` | 转售上游 | 内部价目表录入（国内元 / 国际美元） |
| `official/` | **模型原厂** | 各厂商官网文档/API 说明页权威价 |

真源文件与 npm 命令见 [suppliers/SOURCES.md](./suppliers/SOURCES.md)。

### `suppliers/tokenhub/`

```
tokenhub/
├── README.md
├── scrape-pricing.mjs          # 控制台 API 抓取（Playwright）
├── gen-sample.mjs              # 生成 Markdown 价目表
├── lib/pricing-api.mjs
├── .profile/                   # 浏览器登录态（gitignore）
└── output/
    ├── pricing-console-api.json   # ★ 真源
    └── pricing-table.md           # 全量人读表（抓取后自动生成）
```

```bash
npm run pricing:supplier:tokenhub:console
npm run pricing:supplier:tokenhub:sample -- --count=10
```

### `suppliers/bailian/`

```
bailian/
├── README.md
├── scrape-pricing.mjs          # 抓取官方文档 + 归一化
├── normalize-pricing.mjs       # 仅从 raw 重新归一化
├── gen-sample.mjs
├── lib/pricing-api.mjs
└── output/
    ├── bailian-pricing.json       # 原始表格（中间文件）
    ├── pricing-api.json           # ★ 真源
    └── pricing-sample-10.md       # 示例人读表
```

```bash
npm run pricing:supplier:bailian:doc
npm run pricing:supplier:bailian:normalize
npm run pricing:supplier:bailian:sample
```

### `suppliers/aigc/`

```
aigc/
├── README.md
├── build-pricing.mjs
├── trinity-map.json            # Trinity ID ↔ 价目表行（映射，非价目真源）
├── data/
│   └── pricing-sheet.mjs       # ★ 价目表原文（人工维护）
├── lib/pricing-api.mjs
└── output/
    └── pricing-api.json        # 生成后的 TokenHub 对齐 JSON
```

```bash
npm run pricing:supplier:aigc
```

### `suppliers/official/` — 模型原厂价目（按模态拆分）

与 TokenHub/百炼/AIGC **转售价**区分：`official` 记录各模型**厂商官网**挂牌价，用于对照「原厂 vs 上游 vs Trinity 线上」。

```
official/
├── README.md
├── fetch-pricing.mjs           # 按 --modality 拉取官网价 → JSON
├── gen-table.mjs               # 从 JSON 生成 Markdown 表
├── trinity-map.json            # Trinity ID ↔ 原厂 vendorModelId
├── data/
│   ├── catalog/                # 模型目录（按模态分文件）
│   │   ├── text.mjs            # 生文：OpenAI / Gemini / xAI / Anthropic（32 款）
│   │   ├── image.mjs           # 生图：混元等
│   │   └── video.mjs           # 生视频：可灵 / Vidu / 混元 / 优图
│   ├── seeds/                  # 官网核实种子价（live 抓取失败时 fallback）
│   │   ├── text.mjs
│   │   ├── image.mjs
│   │   └── video.mjs
│   ├── pricing-urls.mjs        # 各厂商价目总页 URL（多模态共用）
│   ├── vendor-catalog.mjs      # @deprecated → catalog/text.mjs
│   └── official-price-seed.mjs # @deprecated → seeds/text.mjs
├── lib/
│   ├── modality.mjs            # text | image | video 元数据与单位
│   ├── catalog-loader.mjs      # 按模态加载 catalog + seeds
│   └── parse-vendor-pricing.mjs # 各厂商页面解析 + 种子 fallback
└── output/
    ├── text/
    │   ├── vendor-pricing.json      # ★ 生文真源（USD / 百万 tokens）
    │   └── vendor-pricing-table.md
    ├── image/
    │   ├── vendor-pricing.json      # ★ 生图真源（CNY / 张）
    │   └── vendor-pricing-table.md
    └── video/
        ├── vendor-pricing.json      # ★ 生视频真源（CNY / 积分·次，分档）
        └── vendor-pricing-table.md
```

#### 模态与命令

| 模态 | 含义 | 目录真源 | 价目真源 | npm 命令 |
|------|------|----------|----------|----------|
| `text` | 生文 | `data/catalog/text.mjs` | `output/text/vendor-pricing.json` | `pricing:supplier:official:text` |
| `image` | 生图 | `data/catalog/image.mjs` | `output/image/vendor-pricing.json` | `pricing:supplier:official:image` |
| `video` | 生视频 | `data/catalog/video.mjs` | `output/video/vendor-pricing.json` | `pricing:supplier:official:video` |
| `all` | 三种一起 | 上述三个 catalog | 上述三个 output 子目录 | `pricing:supplier:official:all` |

```bash
cd trinity-AI

# 生文（默认）
npm run pricing:supplier:official:text
npm run pricing:supplier:official:text -- gpt-5.5 gemini-2.5-flash

# 生图 / 生视频
npm run pricing:supplier:official:image
npm run pricing:supplier:official:video -- kl-video-v3

# 仅生成 Markdown（需先有 JSON）
node pricing/suppliers/official/gen-table.mjs --modality=image
```

`pricing:supplier:official` 等价于 `pricing:supplier:official:text`。

#### 生文厂商覆盖（`catalog/text.mjs`）

| vendor | 标签 | 价目来源 |
|--------|------|----------|
| `openai` | GPT | `developers.openai.com/api/docs/models/{id}` |
| `google` | Gemini | `ai.google.dev/.../pricing` |
| `xai` | GK | `docs.x.ai/developers/models/{id}` |
| `anthropic` | CD | `platform.claude.com/.../models/overview` |

#### 生图 / 生视频厂商覆盖

| 模态 | vendor | 标签 | 说明 |
|------|--------|------|------|
| image | `tencent_hunyuan` | 混元 | `hy-image-v3.0`、`hy-image-lite` |
| video | `tencent_hunyuan` | 混元 | `hy-video-1.5` 等 |
| video | `kling` | 可灵 | `kl-video-v*` 系列 |
| video | `vidu` | Vidu | `vd-video-q*` 系列 |
| video | `tencent_youtu` | 优图 | `yt-video-*` 系列 |

国内生图/生视频目前以 **种子价**（`data/seeds/*.mjs`）为主；生文在国际厂商页解析失败时同样 fallback 到种子。

详见 [suppliers/official/README.md](./suppliers/official/README.md)。

---

## `config/` — 流水线配置

```
config/
├── channels-image.mjs
├── channels-video.mjs
└── …                         # 渠道配置；成本折扣见产品手册 supplier-cost-discounts.md
```

---

## `output/` — 流水线产出

**所有 `pipeline/` 脚本写入此处**；供应商各自的 JSON 真源仍在 `suppliers/*/output/`。

```
output/
├── README.md
├── prices-api.json             # ★ 线上刊例真源（GET /v1/prices）
├── prices-api.old.json         # fetch 前自动备份
├── prices-api-flat.json
├── prices-api-index.json
├── prices-api.csv
├── upstream-pricing.json       # 三上游 + 刊例汇总（validate 依赖）
├── upstream-pricing.md
├── trinity-pricing.xlsx        # Excel 多 Sheet 汇总
├── summary.md / summary.csv
├── supplier-tokenhub-guangzhou.md / .csv
├── supplier-bailian-beijing.md / .csv
├── supplier-aigc-domestic.md / .csv
├── supplier-aigc-international.md / .csv
├── pricing-validation-sample.md / .json   # 校验报告
├── 0.65_prices-api.json        # 建议刊例草案（0.65 规则）
├── 0.65_prices-api.meta.json
├── 0.65_prices-api-diff.md / .json / .csv
├── 0.725_prices-api.json       # 7.25 汇率草案
├── 0.725_prices-api.meta.json
├── pricing-diff.md / .json / .csv
└── trinity-models-api.json
```

| 文件 | 步骤 | 说明 |
|------|------|------|
| `prices-api.json` | 1 · fetch | 平台当前对用户刊例 |
| `upstream-pricing.json` | 2 · upstream | TokenHub + 百炼 + AIGC + 刊例 USD |
| `pricing-validation-sample.md` | 3 · validate | 线上 vs 各上游（抽样） |
| `0.65_prices-api.json` | 4 · gen-65 | 拟上线价草案 |
| `0.65_prices-api-diff.md` | 5 · diff | 线上 vs 草案全量偏差 |

> **注意**：`official` 原厂价目 JSON 在 `suppliers/official/output/{text,image,video}/`，尚未接入 `pricing:upstream` 四方汇总；后续可扩展。

---

## 四类数据关系（速查）

```
                    ┌─────────────────────────────────────┐
                    │  suppliers/official/output/{modality} │  模型原厂官网价
                    └─────────────────────────────────────┘
                                      （对照用，独立真源）

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ tokenhub/output  │    │ bailian/output   │    │ aigc/data        │
│ 转售上游价       │    │ 转售上游价       │    │ 转售上游价       │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    pipeline/gen-upstream-pricing.mjs
                                 │
                                 ▼
                    output/upstream-pricing.json
                                 │
         output/prices-api.json ◄┤  pipeline/validate · gen-65 · diff
         （线上刊例）            │
```

| 层级 | 路径 | 谁产生 |
|------|------|--------|
| 线上刊例 | `output/prices-api.json` | `pricing:fetch` |
| 转售上游 | `suppliers/{tokenhub,bailian,aigc}/…` | 各 supplier 脚本 |
| 原厂价目 | `suppliers/official/output/{text,image,video}/` | `pricing:supplier:official:*` |
| 建议草案 | `output/0.65_prices-api.json` | `pricing:gen-65` |

---

## 文档索引

| 文档 | 内容 |
|------|------|
| [README.md](./README.md) | 六步流程、命令速查 |
| [STRUCTURE.md](./STRUCTURE.md) | 本文件：完整目录树 |
| [docs/OFFICIAL-PRICING-SKILL-DESIGN.md](./docs/OFFICIAL-PRICING-SKILL-DESIGN.md) | 官方价 Skill 与三方对比设计稿 |
| [suppliers/SOURCES.md](./suppliers/SOURCES.md) | 各供应商 JSON 真源 |
| [pipeline/README.md](./pipeline/README.md) | 流水线脚本 |
| [suppliers/official/README.md](./suppliers/official/README.md) | 原厂价目与模态 |
| [suppliers/tokenhub/README.md](./suppliers/tokenhub/README.md) | TokenHub 抓取 |
| [suppliers/bailian/README.md](./suppliers/bailian/README.md) | 百炼抓取 |
| [suppliers/aigc/README.md](./suppliers/aigc/README.md) | AIGC 价目表 |

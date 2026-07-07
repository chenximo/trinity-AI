# 上游价目真源（Suppliers）

各供应商**只认下列文件**为官网价真源；流水线、校验、0.65 生成都从这里读。

目录总览见 [../STRUCTURE.md](../STRUCTURE.md)。

| 供应商 | 真源文件 | 获取方式 | 单位 |
|--------|----------|----------|------|
| **原厂（生文）** | `official/output/text/vendor-pricing.json` | `npm run pricing:supplier:official:text` | 美元/百万 tokens |
| **原厂（生图）** | `official/output/image/vendor-pricing.json` | `npm run pricing:supplier:official:image` | 元/张 |
| **原厂（生视频）** | `official/output/video/vendor-pricing.json` | `npm run pricing:supplier:official:video` | 元/积分·次 |
| **TokenHub** | `tokenhub/output/pricing-console-api.json` | `npm run pricing:supplier:tokenhub:console` | 元/百万 tokens |
| **百炼** | `bailian/output/pricing-api.json` | `npm run pricing:supplier:bailian:doc` | 元/百万 tokens |
| **AIGC** | `aigc/data/pricing-sheet.mjs` | 人工维护 → `npm run pricing:supplier:aigc` 生成 JSON | 国内元 / 国际美元 |
| **火山方舟** | `volcengine/output/{text,image,video}/pricing-api.json` | `npm run pricing:supplier:volcengine:all` | 生文/生视频元/M tokens · 生图元/张 |
| **原厂直连（通用）** | `official-direct/` | `npm run pricing:supplier:official-direct:all` | 渠道配置在 `channels/*.mjs` |
| **网聚云联·云门户** | `wangju-cloudportal/output/` | `npm run pricing:supplier:wangju-cloudportal` | 筛选 GPT/Gemini |
| **中转站-cust** | `relay-cust/output/` | `npm run pricing:supplier:relay-cust` | official 全量复制 |

## `official/` 与转售上游的区别

| | `official/` | `tokenhub` / `bailian` / `aigc` |
|--|-------------|----------------------------------|
| 价是什么 | 模型**厂商官网**挂牌价 | Trinity **转售渠道**挂牌价 |
| 组织方式 | 按模态 `text` / `image` / `video` | 各供应商单一目录 |
| 真源路径 | `official/output/{modality}/vendor-pricing.json` | 见上表 |
| 详细说明 | [official/README.md](./official/README.md) | 各子目录 README |

## 每个供应商目录约定（四件套）

| 产物 | 说明 |
|------|------|
| 脚本 | `scrape-pricing.mjs` / `build-pricing.mjs` |
| **JSON 真源** | 上表路径（百炼 scrape 会覆盖 `pricing-api.json`；中间 `bailian-pricing.json` 可本地重归一化，非对外真源） |
| `output/pricing-table.md` | 人读全量价目表（表头以 TokenHub 为准） |
| `output/*-sample-10.md` | 可选打样（`--count=10`） |
| Excel | **不在供应商目录**；对外总册见 `pricing/output/trinity-pricing.xlsx`（`npm run pricing:upstream` 等增量更新 Sheet） |

## 不纳入真源

- ~~`tokenhub/output/pricing-console-details.json`~~ — 已废弃（旧抓包中间文件）

## 与线上刊例的关系

真源更新后，按 [../README.md](../README.md) 六步流程：`fetch` → `upstream` → **`validate`** → `gen-65` → `diff:065`。

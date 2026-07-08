# 价目流水线（`pricing/pipeline/`）

脚本层：拉线上刊例、汇总上游、**校验**、生成 0.65/0.725 草案、全量 diff。

> 完整六步流程见 **[../README.md](../README.md)**。下文按脚本说明。

## 流程中的位置

| 顺序 | 脚本 | npm 命令 | 产出（均在 `../output/`） |
|------|------|----------|---------------------------|
| 1 | `fetch-online-prices.mjs` | `pricing:fetch` | `prices-api.json` |
| 2 | `gen-upstream-pricing.mjs` | `pricing:upstream` | `upstream-pricing.json`、Excel、summary |
| 3 | `validate-online-pricing.mjs` | `pricing:validate` | `pricing-validation-sample.md` |
| 4 | `gen-725-prices-api.mjs` | `pricing:gen-65` / `gen-725` | `0.65_prices-api.json` |
| 5 | `compare-online-vs-scraped.mjs` | `pricing:diff:065` | `0.65_prices-api-diff.md` |
| — | `compare-official-pricing.mjs` | `pricing:compare:official` | `output/official/{modality}.*` |

**步骤 3 不可跳过**：在生成 0.65 草案之前，应先 `pricing:upstream` + `pricing:validate`，确认线上与各上游真源关系正常。

---

## `fetch-online-prices.mjs`

```bash
npm run pricing:fetch          # JSON
npm run pricing:fetch:all      # JSON + CSV
```

- `GET /v1/prices?modality=text`
- 写入前备份为 `prices-api.old.json`

---

## `gen-upstream-pricing.mjs`

```bash
npm run pricing:upstream
```

读取：

- `../suppliers/tokenhub/output/pricing-console-api.json`
- `../suppliers/bailian/output/pricing-api.json`
- `../suppliers/aigc/data/pricing-sheet.mjs` + `trinity-map.json`
- `../output/online/prices-api.json`（刊例 USD）

---

## `validate-online-pricing.mjs` ★ 校验

```bash
npm run pricing:validate
npm run pricing:validate -- glm-4-7-251222 gpt-5.5
FX_CNY_PER_USD=6.5 npm run pricing:validate
```

- **依赖**：`upstream-pricing.json`（先跑 `pricing:upstream`）
- **行为**：对指定模型调用 `GET /v1/prices`，与 `upstream-pricing.json` 中 TokenHub / 百炼 / AIGC 国内/国际主档比价
- **默认模型**：`deepseek-v3.2`、`qwen3.5-plus`、`gpt-4o`
- **产出**：`pricing-validation-sample.md`、`.json`

与 `pricing:diff:065` 的区别：

| | `pricing:validate` | `pricing:diff:065` |
|--|-------------------|-------------------|
| 对比对象 | 线上 vs **各上游真源** | 线上 vs **0.65 换算草案** |
| 范围 | 默认 3 模型，可指定 | 全量模型 |
| 用途 | 发版前抽查、排查定价依据 | 草案是否与线上一致 |

---

## `gen-725-prices-api.mjs`

```bash
npm run pricing:gen-65      # FX 6.5 · optimized_0.65
npm run pricing:gen-725     # FX 7.25
```

- 模板：`prices-api.json` 结构
- 上游：`upstream-pricing.json`

---

## `compare-online-vs-scraped.mjs`

```bash
npm run pricing:diff:065
npm run pricing:diff
```

---

## `compare-official-pricing.mjs`

```bash
npm run pricing:compare:official -- gpt-5.5
npm run pricing:compare:official -- --modality=video
npm run pricing:compare:official -- --modality=all
```

- **依赖**：`official/trinity-map.json`、各 supplier 真源、`output/online/prices-api.json`
- **行为**：按模态 join 官方价、TokenHub、百炼、AIGC、线上刊例
- **产出**：`output/official/{text,image,video}.{md,json,csv}`；Sheet 写入总册 `output/trinity-pricing.xlsx`
- Skill：`.cursor/skills/trinity-official-pricing/`

---

## 环境变量

```bash
export TRINITY_BASE_URL=https://api.trinitydesk.ai/v1
export TRINITY_API_KEY=xh-...    # validate / fetch 可选
export FX_CNY_PER_USD=7.25       # validate 用
```

---

## 库文件（`lib/`）

| 文件 | 用途 |
|------|------|
| `paths.mjs` | `output/`、`suppliers/` 路径常量 |
| `parse-online-prices.mjs` | 解析 `GET /v1/prices` 档位 |
| `build-upstream-prices-api.mjs` | 上游 → prices-api 同构 JSON |
| `pricing-diff.mjs` | diff 报告逻辑 |
| `pricing-compare.mjs` | 三上游字段对比 |

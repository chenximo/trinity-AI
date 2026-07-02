# 模型原厂权威价目

各模型**厂商官网**挂牌价真源：目录按**模态**拆分。**混合获取**：国际模型 live 抓取官网；国内生文以核实种子为主（DeepSeek V4 另支持 live 解析定价页）。

## 获取策略（混合）

| 类型 | 行为 | `fetchStatus` |
|------|------|----------------|
| 国际 OpenAI / Gemini / xAI / Anthropic | 访问 `docUrl` / pricing 页解析 | `ok` |
| 国内生文（通义 / 智谱 / Kimi / MiniMax / 混元等） | 读 `data/seeds/text.mjs`，链接在 catalog 可追溯 | `seed` |
| DeepSeek V4 Flash / Pro | 优先 live 解析 API 定价页，失败回退种子 | `ok` 或 `seed` |
| 生图 / 生视频 | 种子 + 厂商定价页链接 | `seed` |

涨价时：国内对照 catalog 中的 `docUrl` / `pricingUrl` 更新种子 → `npm run pricing:supplier:official:text`。

## 模态与输出

| 模态 | 目录 | 价目真源 | 单位 |
|------|------|----------|------|
| **生文** `text` | `data/catalog/text.mjs` | `output/text/vendor-pricing.json` | USD 或 CNY / 百万 tokens（按模型 `currency`） |
| **生图** `image` | `data/catalog/image.mjs` | `output/image/vendor-pricing.json` | CNY / 张 |
| **生视频** `video` | `data/catalog/video.mjs` | `output/video/vendor-pricing.json` | CNY / 积分·次（分档） |

### 上线真源：阶梯价 `tiers[]`

`vendor-pricing.json` 中 **`models[].tiers[]` 为完整官方阶梯价**（拟上线对照的真源）：

- 单档国际模型：1 档，`tierLabel` 多为「标准价」
- 国内长上下文 / 多模式：seed 与 JSON 中须写 **多档** `tiers`
- 人读表 `vendor-pricing-table.md` 按档位多行展开
- 对比脚本默认用 **首档** 摘要；全档以 JSON 为准

```json
"tiers": [
  { "tierLabel": "输入≤16k", "input": 1.2, "output": 4, "cache": 0.4, "parseSource": "official_price_seed" },
  { "tierLabel": "输入>16k", "input": 2.4, "output": 8, "cache": 0.8, "parseSource": "official_price_seed" }
]
```

共享：`data/pricing-urls.mjs`、`data/seeds/{modality}.mjs`、`trinity-map.json`。

## 命令

```bash
cd trinity-AI

# 生文（默认，国际 GPT/Gemini/GK/CD）
npm run pricing:supplier:official:text

# 生图（混元等）
npm run pricing:supplier:official:image

# 生视频（可灵 / Vidu / 混元 / 优图）
npm run pricing:supplier:official:video

# 三种模态一次拉取
npm run pricing:supplier:official:all

# 仅拉指定模型（任意模态）
npm run pricing:supplier:official:text -- gpt-5.5 gemini-2.5-flash
npm run pricing:supplier:official:video -- kl-video-v3

# 仅生成 Markdown（需先有对应 JSON）
npm run pricing:supplier:official:table
node pricing/suppliers/official/gen-table.mjs --modality=image

# 脚手架（新增模型代码片段）
node pricing/suppliers/official/scaffold-official-model.mjs --modality=text ...

# 三方对比（官方 vs 上游 vs 线上）
npm run pricing:compare:official -- gpt-5.5
npm run pricing:compare:official -- --modality=all
```

Skill：`.cursor/skills/trinity-official-pricing/`

`pricing:supplier:official` 等价于 `pricing:supplier:official:text`。

## 各厂商价目来源

| 模态 | 厂商 | 价目怎么来 |
|------|------|------------|
| 生文 | OpenAI (GPT) | 各模型 `developers.openai.com/api/docs/models/{id}` |
| 生文 | Google (Gemini) | `ai.google.dev/.../pricing` 按 model code |
| 生文 | xAI (GK) | `docs.x.ai/developers/models/{id}` |
| 生文 | Anthropic (CD) | `platform.claude.com/.../pricing` + overview |
| 生文 | DeepSeek | V4：`api-docs.deepseek.com`（live）；v3.2 等：百炼定价 + 种子 |
| 生文 | 通义 / Kimi | `help.aliyun.com/.../model-pricing` + 种子 |
| 生文 | 智谱 | `bigmodel.cn/pricing` + 种子 |
| 生文 | MiniMax | `platform.minimaxi.com/.../pricing-paygo` + 种子 |
| 生文 | 腾讯混元 | `cloud.tencent.com/.../130055` + 种子 |
| 生图 | 腾讯混元 | `cloud.tencent.com/.../97732` + 种子 |
| 生视频 | 可灵 / Vidu / 混元 / 优图 | 各厂商定价页 + 种子 |

> 原厂**没有**统一价目 REST API；本目录用**官网文档**作为权威来源，与 TokenHub/百炼/AIGC 上游转售价区分。

## 维护

1. 新模型：在 `data/catalog/{text,image,video}.mjs` 增加条目
2. 对照官网更新 `data/seeds/{modality}.mjs`（生文改 `TEXT_SEED_VERIFIED_AT`）
3. Trinity 映射：更新 `trinity-map.json`
4. 刷新：`npm run pricing:supplier:official:{text|image|video}`

完整价目流程见 [../../README.md](../../README.md) · 真源索引 [../SOURCES.md](../SOURCES.md) · 目录树 [../../STRUCTURE.md](../../STRUCTURE.md) · Skill 设计 [../../docs/OFFICIAL-PRICING-SKILL-DESIGN.md](../../docs/OFFICIAL-PRICING-SKILL-DESIGN.md)。

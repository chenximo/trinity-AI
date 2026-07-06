# Workflow · 新增或更新模型官方价

用户示例：「补充 `gpt-5.6` 的官方价格」。

> 能力清单：[`../tools.yaml`](../tools.yaml) · 确认：[`../confirmation.md`](../confirmation.md)

## Checklist

```
- [ ] Step 1: 判定模态 text | image | video
- [ ] Step 2: 查重 catalog / trinity-map / TokenHub
- [ ] Step 3: 核实官网 docUrl、pricingUrl、价目
- [ ] Step 4: 改 catalog + seeds + trinity-map（须确认）
- [ ] Step 5: pricing.supplier.official.{modality} 验证 JSON
- [ ] Step 6: 展示 vendor-pricing-table.md
- [ ] Step 7: pricing.refresh → Excel 与汇总最新
- [ ] Step 8: （可选）pricing.gate 或 pricing.compare.official
```

## 能力引用

| 步骤 | tool id |
|------|---------|
| 4 快捷片段 | `pricing.scaffold.model` |
| 4 编辑 | `pricing.catalog.edit` · `pricing.seed.edit` · `pricing.map.edit` |
| 5 验证 | `pricing.supplier.official.text` / `.image` / `.video` |
| 7 刷新 Excel | **`pricing.refresh`**（必跑） |
| 8 门禁 | `pricing.gate` |
| 8 对比 | `pricing.compare.official` |

## Step 1 — 模态

| 模态 | catalog | 单位 |
|------|---------|------|
| text | `data/catalog/text.mjs` | USD / 百万 tokens |
| image | `data/catalog/image.mjs` | CNY / 张 |
| video | `data/catalog/video.mjs` | CNY / 积分·次 |

参考 TokenHub `tags`（`图片生成` / `视频生成`）、Trinity `modality_type`。

## Step 2 — 查重

```bash
rg "gpt-5.6" pricing/suppliers/official/
rg "gpt-5.6" pricing/suppliers/tokenhub/output/pricing-console-api.json
```

已存在 → 更新 seed + 重新 fetch；不存在 → 新增。

## Step 3 — 官网真源

- 打开厂商模型页，记录 input/output/cache 或分档价
- `pricing-urls.mjs` 查价目总页
- 国际生文：OpenAI / Gemini / xAI / Anthropic 文档

## Step 4 — 改文件

**快捷**：先跑 `pricing.scaffold.model`，再粘贴核对：

```bash
node pricing/suppliers/official/scaffold-official-model.mjs \
  --modality=text --vendor=openai --vendor-label=GPT \
  --vendor-model-id=gpt-5.6 --trinity-id=gpt-5.6 \
  --doc-url=https://developers.openai.com/api/docs/models/gpt-5.6
```

编辑类操作触发 **confirmation**（`pricing.catalog.edit` / `pricing.seed.edit` / `pricing.map.edit`）。

### 生文 seed 模板（上线真源 = `tiers[]`）

```javascript
// 多档
"qwen3.5-plus": {
  currency: "CNY",
  tiers: [
    { tierLabel: "输入≤128k", input: 1.2, output: 4, cache: 0.24 },
    { tierLabel: "输入>128k", input: 2.4, output: 8 },
  ],
},
// 单档
"gpt-5.6": { currency: "USD", input: 1.25, cache: 0.125, output: 10 },
```

更新 `TEXT_SEED_VERIFIED_AT`；`fetch` 后核对 `vendor-pricing.json` → `models[].tiers[]`。

### trinity-map 模板

```json
"gpt-5.6": {
  "modality": "text",
  "vendor": "openai",
  "vendorModelId": "gpt-5.6"
}
```

## Step 5 — 验证

执行 `pricing.supplier.official.{modality}`（单模型可加 `-- <id>`）。

确认 `output/{modality}/vendor-pricing.json` 中 `fetchStatus` 为 `ok` 或 `seed`。

## Step 6 — 汇报

读取 `output/{modality}/vendor-pricing-table.md`，向用户说明：价、档位、抓取状态、docUrl。

## Step 7 — 刷新产出（必跑）

按模态：

| 模态 | 命令 | Excel |
|------|------|-------|
| 生文 | `pricing.refresh`（或 `--skip-official-fetch`） | `trinity-pricing-text.xlsx` |
| 生图 | `pricing.supplier.official.image` → `pricing.upstream.image` | `trinity-pricing-image.xlsx` |
| 生视频 | `pricing.supplier.official.video` | （video upstream 待补） |

`pricing.refresh` 会拉 official 三模态 + 生文 upstream，**不含**生图 Excel。

**规则**：凡说「新增 / 改价 / 改映射」，交付前须跑对应 upstream，Excel 才算最新。

## Step 8 — 可选

- 门禁：[`pricing-gate.md`](./pricing-gate.md) → `pricing.gate`
- 对比：[`compare-pricing.md`](./compare-pricing.md) → `pricing.upstream` / `pricing.upstream.image`

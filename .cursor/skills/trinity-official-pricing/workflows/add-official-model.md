# Workflow · 新增或更新模型官方价

用户示例：「补充 `gpt-5.6` 的官方价格」。

## Checklist

```
- [ ] Step 1: 判定模态 text | image | video
- [ ] Step 2: 查重 catalog / trinity-map / TokenHub
- [ ] Step 3: 核实官网 docUrl、pricingUrl、价目
- [ ] Step 4: 改 catalog + seeds + trinity-map
- [ ] Step 5: fetch 验证 JSON
- [ ] Step 6: 展示 vendor-pricing-table.md
- [ ] Step 7: （可选）pricing:compare:official
```

## Step 1 — 模态

| 模态 | catalog | 单位 |
|------|---------|------|
| text | `data/catalog/text.mjs` | USD / 百万 tokens |
| image | `data/catalog/image.mjs` | CNY / 张 |
| video | `data/catalog/video.mjs` | CNY / 积分·次 |

参考 TokenHub `tags`（`图片生成` / `视频生成`）、Trinity `modality_type`。

## Step 2 — 查重

```bash
# 在仓库内搜索
rg "gpt-5.6" pricing/suppliers/official/
rg "gpt-5.6" pricing/suppliers/tokenhub/output/pricing-console-api.json
```

已存在 → 更新 seed + 重新 fetch；不存在 → 新增。

## Step 3 — 官网真源

- 打开厂商模型页，记录 input/output/cache 或分档价
- `pricing-urls.mjs` 查价目总页
- 国际生文：OpenAI / Gemini / xAI / Anthropic 文档

## Step 4 — 改文件

**快捷**：先跑脚手架，再粘贴核对：

```bash
node pricing/suppliers/official/scaffold-official-model.mjs \
  --modality=text --vendor=openai --vendor-label=GPT \
  --vendor-model-id=gpt-5.6 --trinity-id=gpt-5.6 \
  --doc-url=https://developers.openai.com/api/docs/models/gpt-5.6
```

### 生文 catalog 模板

```javascript
{
  vendor: "openai",
  vendorLabel: "GPT",
  vendorModelId: "gpt-5.6",
  docUrl: "https://developers.openai.com/api/docs/models/gpt-5.6",
  status: "active",
},
```

### 生文 seed 模板

### 生文 seed 模板（上线真源 = `tiers[]`）

```javascript
// 多档（国内长上下文等）
"qwen3.5-plus": {
  currency: "CNY",
  tiers: [
    { tierLabel: "输入≤128k", input: 1.2, output: 4, cache: 0.24 },
    { tierLabel: "输入>128k", input: 2.4, output: 8 },
  ],
},

// 单档可简写（fetch 后仍为 1 档「标准价」）
"gpt-5.6": { currency: "USD", input: 1.25, cache: 0.125, output: 10 },
```

更新 `TEXT_SEED_VERIFIED_AT`；`fetch` 后核对 `vendor-pricing.json` → `models[].tiers[]`。

### 生图 seed 模板

```javascript
"hy-image-v3.0": {
  tiers: [{ tierLabel: "输出", price: 0.2, unit: "元/张" }],
},
```

### 生视频 seed 模板

```javascript
"kl-video-v3": {
  tiers: [{ tierLabel: "统一价", price: "2.5-25", unit: "积分/次" }],
},
```

### trinity-map 模板

```json
"gpt-5.6": {
  "modality": "text",
  "vendor": "openai",
  "vendorModelId": "gpt-5.6"
}
```

## Step 5 — 验证

```bash
npm run pricing:supplier:official:text -- gpt-5.6
```

确认 `output/text/vendor-pricing.json` 中 `fetchStatus` 为 `ok` 或 `seed`。

## Step 6 — 汇报

读取 `output/{modality}/vendor-pricing-table.md`，向用户说明：价、档位、抓取状态、docUrl。

## Step 7 — 可选对比

见 [`compare-pricing.md`](./compare-pricing.md)。

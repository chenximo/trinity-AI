# Workflow · 新增生视频官方模型

> 基建完成后，加 1 个 video 模型 ≈ **填数据 + 重跑 pipeline**（非重建生产线）。  
> 产品 SOP：[add-model-sop.md](../../../../apps/trinity-product/docs/ai-api-platform/pricing-sources/add-model-sop.md)

## Checklist

```
- [ ] Step 1: 查重（catalog / registry / AIGC / 线上 slug）
- [ ] Step 2: catalog + seeds + official trinity-map
- [ ] Step 3: video-model-registry.mjs（onlineSlug · listingAttribute）
- [ ] Step 4: AIGC pricing-sheet-video + trinity-map-video
- [ ] Step 5: pricing.supplier.official.video + aigc:video
- [ ] Step 6: validate:official-aigc-video · upstream:video
- [ ] Step 7: （若要发刊例）gen → diff → publish
```

## Step 1 — 查重

```bash
rg "<slug-or-trinity-id>" pricing/config/video-model-registry.mjs
rg "<slug>" pricing/suppliers/official/
rg "<slug>" pricing/suppliers/aigc/
```

## Step 2 — 官方 L1

| 文件 | 必填 |
|------|------|
| `data/catalog/video.mjs` | vendor · docUrl |
| `data/seeds/video.mjs` | 档位价（积分/秒 · 积分/次 · USD/秒 · token） |
| `trinity-map.json` | modality=video · vendorModelId |

脚手架：

```bash
node pricing/suppliers/official/scaffold-official-model.mjs \
  --modality=video --vendor=kling --vendor-model-id=kling-4 \
  --trinity-id=kl-video-v4 --doc-url=https://...
```

## Step 3 — registry（生视频专有）

`pricing/config/video-model-registry.mjs`：

```javascript
{
  onlineSlug: "kling-4",
  trinityId: "kl-video-v4",
  vendor: "kling",
  vendorModelId: "kling-4",
  listingAttribute: "标准价",  // 或 "无声" / "有声"，对齐 AIGC 列
}
```

## Step 4 — AIGC L2

- `suppliers/aigc/data/pricing-sheet-video.mjs`
- `suppliers/aigc/trinity-map-video.json`

## Step 5–6 — 构建与校验

```bash
npm run pricing:supplier:official:video
npm run pricing:supplier:aigc:video
npm run pricing:validate:official-aigc-video
npm run pricing:upstream:video
```

确认 `coverage-video.md` P6 通过（线上 slug 不缺失）。

## Step 7 — 刊例（可选）

见 [`rollout-listing-price.md`](./rollout-listing-price.md) 或 `npm run pricing:rollout:video`.

## 计价口径速查

| 官方口径 | 与 AIGC 对比 |
|----------|--------------|
| 积分/秒 = 元/秒 | 直接比国内 AIGC |
| 积分/次 | ÷ 参考秒数（`video-reference-conversion.mjs`） |
| $/百万 tokens | 刊例 token 价；与 AIGC 元/秒标 `ℹ口径不同` |

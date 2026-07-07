# Workflow · 刊例价发布（gen → diff → publish）

用户示例：「发布生视频刊例」「把 official 草案上线到 prices-api」。

> 能力清单：[`../tools.yaml`](../tools.yaml) · 产品 SOP：[video-rollout.md](../../../../apps/trinity-product/docs/ai-api-platform/pricing-sources/video-rollout.md)

## Checklist

```
- [ ] Step 1: 确认 L1 真源已更新（official + AIGC）
- [ ] Step 2: pricing.validate.official-aigc.{image|video}（建议 gate 绿）
- [ ] Step 3: pricing.upstream.{image|video} — Excel 刊例对比
- [ ] Step 4: pricing.gen-official.{image|video}
- [ ] Step 5: pricing.diff.official-{image|video} — 人工读 diff
- [ ] Step 6: pricing.publish-official.{video}（image 待 P1-2）
- [ ] Step 7: 提醒生产部署（listing-deploy.md）
```

## 能力引用

| 步骤 | tool id |
|------|---------|
| 2 | `pricing.validate.official-aigc.image` / `.video` · `pricing.gate` |
| 3 | `pricing.upstream.image` / `pricing.upstream.video` |
| 4 | `pricing.gen-official.image` / `pricing.gen-official.video` |
| 5 | `pricing.diff.official.image` / `pricing.diff.official.video` |
| 6 | `pricing.publish.official.video` |

## 生视频（完整）

```bash
npm run pricing:gen-official:video
npm run pricing:diff:official-video
# 人工确认 draft/official-prices-api-video-diff.md
npm run pricing:publish-official:video
```

上架源：`pricing/output/draft/official-prices-api-video.json`

## 生图（草案；publish 待补）

```bash
npm run pricing:gen-official:image
npm run pricing:diff:official-image
# publish-official:image 见 PRICING-OPTIMIZATION-BACKLOG P1-2
```

## 注意

- `online/prices-api.json` 为单模态共享路径；publish 前确认当前 modality
- 本地 publish ≠ 生产 API；见 [listing-deploy.md](../../../../apps/trinity-product/docs/ai-api-platform/pricing-sources/listing-deploy.md)

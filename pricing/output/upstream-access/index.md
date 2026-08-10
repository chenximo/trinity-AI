# 上游全量模型 · 接入覆盖

> 生成：2026-08-07T09:51:48.341Z
> **规则**：行 = 该上游抓取目录全量；**已接入**（同模态 `/v1/prices`）标 `-`；未接入留空。
> 用途：看见还有哪些模型可长期接入。不替代刊例对比表。

| 上游 | 模态 | 全量 | 已接入 | 未接入 | 明细 |
|---|---|---:|---:|---:|---|
| 腾讯云 TokenHub | text | 30 | 25 | 5 | [tokenhub.md](./tokenhub.md) |
| 阿里云百炼 · 中国内地 | text | 355 | 23 | 332 | [bailian.md](./bailian.md) |
| 阿里云百炼 · 国际 | text | 73 | 14 | 59 | [bailian-intl.md](./bailian-intl.md) |
| 腾讯云 AIGC · 生文 | text | 108 | 36 | 72 | [aigc-text.md](./aigc-text.md) |
| 腾讯云 AIGC · 生图 | image | 18 | 16 | 2 | [aigc-image.md](./aigc-image.md) |
| 腾讯云 AIGC · 生视频 | video | 63 | 14 | 49 | [aigc-video.md](./aigc-video.md) |
| 火山方舟 · 生文 | text | 26 | 4 | 22 | [volcengine-text.md](./volcengine-text.md) |
| 火山方舟 · 生图 | image | 3 | 3 | 0 | [volcengine-image.md](./volcengine-image.md) |
| 火山方舟 · 生视频 | video | 6 | 0 | 6 | [volcengine-video.md](./volcengine-video.md) |
| OpenRouter | text | 338 | 44 | 294 | [openrouter.md](./openrouter.md) |

## 口径

| 项 | 说明 |
|----|------|
| 行集合 | 上游 JSON **全量**，不按 Trinity 裁剪 |
| 接入=`-` | 同模态线上刊例已有对应模型（id 粗匹配） |
| 接入留空 | 尚未挂 `/v1/prices`，可作接入候选 |
| 与刊例表关系 | 上游价目分表仍出挂牌对比；本表专盯「还能接什么」 |

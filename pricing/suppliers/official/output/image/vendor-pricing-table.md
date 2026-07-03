# 模型原厂权威价目（生图）

> 真源：`output/image/vendor-pricing.json` · 抓取 2026-07-03T03:32:28Z · live 0 · seed 5 / 5 · **5 档**
> 单位：**CNY per image (or per request)**

| # | 厂商 | 原厂模型 ID | 状态 | 抓取 | 档位 | 价格 | 单位 | 价目来源 | 文档 |
|---|------|-------------|------|------|------|------|------|----------|------|
| 1 | 混元 | hy-image-v3.0 | active | seed | 输出 | 0.2 | 元/张 | [来源](https://cloud.tencent.com/document/product/1729/97732 (seed 2026-06-28)) | [链接](https://cloud.tencent.com/document/product/1729/105545) |
| 2 | 混元 | hy-image-lite | active | seed | 输出 | 0.099 | 元/张 | [来源](https://cloud.tencent.com/document/product/1729/97732 (seed 2026-06-28)) | [链接](https://cloud.tencent.com/document/product/1729/105545) |
| 3 | 豆包 | doubao-seedream-5.0-lite | active | seed | 输出 | 0.22 | 元/张 | [来源](https://www.volcengine.com/docs/82379/1544106?lang=zh (seed 2026-06-28)) | [链接](https://www.volcengine.com/docs/82379/1544106?lang=zh) |
| 4 | 豆包 | doubao-seedream-4.5 | active | seed | 输出 | 0.25 | 元/张 | [来源](https://www.volcengine.com/docs/82379/1544106?lang=zh (seed 2026-06-28)) | [链接](https://www.volcengine.com/docs/82379/1544106?lang=zh) |
| 5 | 豆包 | doubao-seedream-4.0 | active | seed | 输出 | 0.2 | 元/张 | [来源](https://www.volcengine.com/docs/82379/1544106?lang=zh (seed 2026-06-28)) | [链接](https://www.volcengine.com/docs/82379/1544106?lang=zh) |

## 说明

- **目录真源**：`data/catalog/image.mjs`
- **价目真源**：`output/image/vendor-pricing.json`
- **种子备用**：`data/seeds/image.mjs`（`fetchStatus: seed`）
- **上线真源**：`vendor-pricing.json` 内 `models[].tiers[]` 为完整阶梯价（单档模型也占 1 档）
- `fetchStatus: ok` = 官网 live 解析成功；`seed` = 对照官网维护的种子价

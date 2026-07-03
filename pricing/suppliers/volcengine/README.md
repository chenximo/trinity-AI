# 火山方舟（Volcengine Ark）上游价目

直连厂商按量付费价，真源：[模型价格 · 火山方舟](https://www.volcengine.com/docs/82379/1544106?lang=zh)。

一次抓取整页，按模态归一化输出；与 `official` 分轨维护。

## 命令

```bash
cd trinity-AI

# 抓取官网 → raw + 三模态 pricing-api.json
npm run pricing:supplier:volcengine:all

# 仅从已提交的 raw 重新归一化（无需 Playwright）
npm run pricing:supplier:volcengine
npm run pricing:supplier:volcengine -- --modality=text

npm run pricing:upstream   # 生文 Excel「火山方舟」分表
```

## 输出

| 模态 | 路径 |
|------|------|
| raw | `output/volcengine-pricing-raw.json` |
| 生文 | `output/text/pricing-api.json`（兼容 `output/pricing-api.json`） |
| 生图 | `output/image/pricing-api.json` |
| 生视频 | `output/video/pricing-api.json` |

生文取 **在线推理（常规）** 主表；生图取 **图片生成模型**；生视频取 Seedance 相关分表。

## 维护

1. `npm run pricing:supplier:volcengine:all` 更新 raw 与 JSON
2. 对照 `official/data/seeds/{text,image,video}.mjs` 更新 Trinity 已上架模型种子
3. 已上架模型补充 `trinity-map.json`
4. `npm run pricing:refresh`

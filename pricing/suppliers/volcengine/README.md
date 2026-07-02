# 火山方舟（Volcengine Ark）上游价目

直连厂商按量付费价，真源：[模型价格 · 火山方舟](https://www.volcengine.com/docs/82379/1544106?lang=zh)。

与 TokenHub/百炼不同，火山方舟无转售爬虫；**挂牌价 = 厂商官方价**（录入 `data/pricing-sheet.mjs`，并同步 `suppliers/official/data/seeds/text.mjs`）。

## 命令

```bash
cd trinity-AI
npm run pricing:supplier:volcengine
npm run pricing:upstream   # 写入 Excel「火山方舟」分表（刊例对比表不含方舟列）
```

## 维护

1. 对照 [模型价格页](https://www.volcengine.com/docs/82379/1544106?lang=zh) 更新 `data/pricing-sheet.mjs`
2. 同步 `official/data/seeds/text.mjs` 中对应 `vendorModelId` 条目
3. 已上架 Trinity 模型补充 `trinity-map.json`
4. `npm run pricing:supplier:volcengine && npm run pricing:supplier:official:text && npm run pricing:upstream`

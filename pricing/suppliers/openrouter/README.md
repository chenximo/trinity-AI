# OpenRouter 价目

从 [OpenRouter Models API](https://openrouter.ai/api/v1/models) 拉取公开挂牌价，用于与 Trinity 线上刊例及官方价对照。

## 命令

```bash
npm run pricing:supplier:openrouter
npm run pricing:compare:openrouter
```

## 输出

- `output/models-api.json` — 全量模型（USD/百万 tokens，`pricing.prompt` × 10⁶）
- `trinity-map.json` — Trinity `modelId` → OpenRouter `id`（如 `deepseek/deepseek-v3.2`）

## 映射说明

- 有日期后缀的 Trinity 快照 ID（如 `deepseek-v4-pro-202606`）可映射到同一 OpenRouter slug
- 百炼旧版 `qwen-flash` / `qwen-max` 等若 OpenRouter 无对应 slug，表中显示「未收录」
- 混元翻译/角色等腾讯专有模型通常不在 OpenRouter 上架

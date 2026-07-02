# 官方价 vs 上游 vs 线上刊例（生图）

> 生成 2026-07-02T02:36:08Z · 模型 2 个 · 行 2（生文按全档位展开）
> 官方价：`suppliers/official/output/image/vendor-pricing.json`（2026-07-01T04:03:46Z）
> 线上刊例：`output/online/prices-api.json`（2026-06-30T13:38:49Z）
> TokenHub：2026-06-30T03:32:07Z
> 国内 CNY→USD（平台线上一致）：÷6.5 · 粗算参考：÷7.25

| Trinity ID | 原厂模型 | 官方价 | TokenHub | 百炼 | AIGC国内 | 线上刊例 | 官方抓取 | 备注 |
|------------|----------|--------|----------|------|----------|----------|----------|------|
| hy-image-v3.0 | hy-image-v3.0 | 输出: 0.2 元/张 | : 0.2 元/张 | — | — | — | seed | TokenHub hy-image-v3.0 |
| hy-image-lite | hy-image-lite | 输出: 0.099 元/张 | : 0.099 元/张 | — | — | — | seed | TokenHub hy-image-lite |

## 说明

- **官方价**：各模型厂商官网文档权威挂牌价（`official` 供应商）
- **TokenHub / 百炼 / AIGC**：Trinity 转售上游挂牌价
- **线上刊例**：`GET /v1/prices` 当前对用户扣费价（USD）
- **生文多档**：每档单独一行，避免只比第一档造成误判（如 glm-5 输入长度档 vs 总 token 档）
- 国内模型线上 USD ≈ 官方 CNY ÷ 6.5（`gen-65` 规则）
- 官网 vs OpenRouter 对比见 `output/openrouter/text.md`
- 对比前请确保已运行 `pricing:supplier:official:{modality}` 与 `pricing:fetch`
- `官方抓取` 为 `未拉取` 表示 map 有映射但尚未写入 vendor-pricing.json
- 生成命令：`npm run pricing:compare:official -- --modality=image`
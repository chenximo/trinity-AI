# 网聚云联 · 云门户

**网聚云联-云门户**为 OpenAI GPT / Google Gemini **原厂直连**进货渠道；挂牌价与 `suppliers/official` 种子对齐。

## 真源

| 文件 | 说明 |
|------|------|
| `output/pricing-api.json` | 结构化价目（由 official 筛选生成） |
| `trinity-map.json` | Trinity ID ↔ 上游 modelId（build 时写入） |

## 生成

```bash
# 需先有 official 生文价目
npm run pricing:supplier:official:text
npm run pricing:supplier:wangju-cloudportal
```

筛选规则见 `data/config.mjs`：`vendors: ["openai", "google"]`。

## 与 official 的关系

- **不是**转售加价渠道（对比 L3 百炼），而是 L2 原厂直连参照
- 价目从 `official/output/text/vendor-pricing.json` **复制筛选**，不单独维护 sheet
- 上游汇总 Excel Sheet：**网聚云联云门户**（`npm run pricing:upstream`）

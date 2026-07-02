# 腾讯云 AIGC 上游价目

从 **内部价目表** 录入（国内站 元/M token · 国际站 美元/M token），输出与 TokenHub 对齐的 JSON，并汇入 `compare:pricing` 生成 MD / Excel。

## 命令

```bash
cd trinity-AI
npm run pricing:supplier:aigc   # 仅生成 pricing/suppliers/aigc/output/pricing-api.json
npm run compare:pricing   # 含 AIGC + TokenHub + 百炼 全量导出
```

## 数据维护

| 文件 | 说明 |
|------|------|
| `data/pricing-sheet.mjs` | **价目表原文**（厂商代码、模型名、档位、国内/国际价） |
| `trinity-map.json` | Trinity 模型 ID ↔ AIGC 价目表行映射（摘要对齐，**非价目真源**） |

录入后改 `pricing-sheet.mjs`，再跑 `npm run pricing:supplier:aigc`。

完整价目流程（含校验）见 [../../README.md](../../README.md)。

## 厂商代码（价目表内）

| 代码 | 含义 |
|------|------|
| Hunyuan | 混元 |
| OO | OpenAI |
| GG | Google / Gemini |
| CLM | Claude（AIGC 国内+国际刊例） |
| CD | 微软国际站 Claude |
| Kim | Kimi |
| GK | Groq |
| Deepseek | DeepSeek |
| Minimax | Minimax |

## 输出

- `output/pricing-api.json` — TokenHub 对齐结构（`site`: `domestic` / `international`）
- `pricing/output/upstream/aigc-domestic/pricing.md` / `aigc-international/pricing.md`
- Excel 总册 `pricing/output/trinity-pricing.xlsx` 中 **AIGC国内站** / **AIGC国际站** Sheet

## 说明

- 价目表为 **截图/Excel 人工录入**，非 API 抓取；若官网调价请改 `pricing-sheet.mjs`。
- 未在 `trinity-map.json` 映射的模型仍会出现在 AIGC 全量目录，但摘要中无 Trinity 行。
- Minimax / CD 等含 **5m/1h 缓存写入** 价，在 `items` 与 MD 额外列中展示。

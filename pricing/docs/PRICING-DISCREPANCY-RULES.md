# 价目出入登记与二次校验规则

> 适用于 `刊例对比校验-生文`、供应商分表（TokenHub / 百炼 / AIGC）、`output/upstream/summary.md`  
> 总工作流见 [PRICING-GOVERNANCE-WORKFLOW.md](./PRICING-GOVERNANCE-WORKFLOW.md)

## 1. 什么算「真出入」（应写入待更新）

| 类型 | 条件 | 待更新文案示例 |
|------|------|----------------|
| 供应商加价 | 同档同币种，入/出偏差 ≥0.5% 且非 FX 可解释 | `⚠ 供应商 TokenHub 入+300%` |
| 刊例偏离官方 | 入/出相对厂商官方价（USD 口径）偏差 ≥0.5% | `⚠ 刊例偏差 入+5%` |
| 官方缺档 | 供应商有明确档位，官方库无同 `tierKey` | `— 官方无同档`（供应商列） |
| 映射错误 | `trinity-map` 指向上游错误 SKU | 人工登记 `config/pricing-annotations.mjs` |
| 线上缺档 | 上游有音频/长上下文档，线上刊例无分档 | `线上无音频分档刊例` |

## 2. 什么不算出入（禁止误报）

| 情况 | 处理 |
|------|------|
| **档位错位** | 必须用 `tier-key.mjs` 按 `mod:text` / `mod:audio` / `ctx:0-200k` 等同档对齐，禁止仅用 input 价最近档 |
| **缓存舍入** | 入/出一致时，缓偏差仍会在刊例结论中显示「缓上浮 X%」；仅入/出偏差 ≥0.5% 记为实质偏离 |
| **USD 官方 vs CNY 供应商** | 在 FX 6.5 / 7.25 / 7.5 / 隐含汇率下取最佳匹配；全字段一致则 `✅ 一致(÷7.5)` |
| **多 FX 一致** | AIGC 国内常用 ÷7.5 挂牌，与官方 USD×7.5 四舍五入 ±0.5% 内视为一致 |

## 3. 官方价种子维护（`suppliers/official/data/seeds/text.mjs`）

- **Gemini**：必须分「文本/图片/视频」与「音频」两档；Pro 系列须含 `≤20万` / `>20万`
- **OpenAI GPT-5.4 系列**：须含 `≤272K` / `>272K` 两档
- **gemini-3.5-flash**：Standard 档为 **$1.5 / $9 / $0.15**（非 3 Flash Preview 的 $0.5）
- 写入种子后执行：`npm run pricing:supplier:official:text`

## 4. 人工例外登记

在 `config/pricing-annotations.mjs` 登记无法自动消化的业务口径：

```javascript
{
  id: "unique-id",
  trinityIds: ["model-id"],
  severity: "warn", // error | warn | info
  flag: "短标签",
  scopes: ["compare-hub", "supplier-compare", "openrouter-compare"],
  title: "标题",
  detail: "说明与处理建议",
}
```

## 5. 二次校验命令

```bash
# 全量再生
npm run pricing:supplier:official:text
npm run pricing:supplier:aigc
npm run pricing:upstream
npm run pricing:compare:official -- --modality=text

# 二次校验（假阳性 / 缺官方档 / 未登记真出入）
node pricing/pipeline/validate-pricing-compare.mjs

# L3 官方 vs 渠道 + 告警（见 PRICING-GOVERNANCE-WORKFLOW.md）
npm run pricing:validate:official-suppliers
npm run pricing:alert
npm run pricing:gate
```

校验失败时根据输出修正：官方种子 → tierKey → 映射 → annotations。

## 6. 改码检查清单

- [ ] `tierToKey` 能识别新档位文案（供应商 attribute、线上 `display_short`）
- [ ] `pickOfficialTierForSupplier` / `compare-hub` 优先 `tierKey` 再价格回退
- [ ] 新增模型已写入 `official/trinity-map.json` 与 seeds
- [ ] 运行 `validate-pricing-compare.mjs` 通过

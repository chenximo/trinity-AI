# Trinity 价目导出索引

> 更新 2026-08-18T07:48:14.507Z · 生文模型 **19** 款 · 生图官方目录 **20** 款
> TokenHub/百炼：— · AIGC 价目表：—

## 对外 Excel（按模态分册）

| 文件 | 模态 | 说明 |
|------|------|------|
| [trinity-pricing-text.xlsx](./trinity-pricing-text.xlsx) | 生文 | 刊例校验 · **汇总-供应商vs官方**（第 2 Sheet）· 各供应商分表（含 vs 官方） |
| [trinity-pricing-image.xlsx](./trinity-pricing-image.xlsx) | 生图 | 刊例校验 · **汇总-供应商vs官方-生图** · **AIGC 国内/国际**分表（当前唯一接入渠道） |
| [trinity-pricing-video.xlsx](./trinity-pricing-video.xlsx) | 生视频 | 官方价对比 |

生文册 Sheet：

- 刊例对比校验-生文
- 汇总-供应商vs官方
- TokenHub广州
- 百炼北京
- 百炼国际
- AIGC国内站
- AIGC国际站
- 火山方舟
- 网聚云联云门户
- 中转站-cust

生图册 Sheet：

- 刊例对比校验-生图
- 汇总-供应商vs官方-生图
- AIGC国内站-生图
- AIGC国际站-生图

## 目录结构

```
output/
├── README.md
├── trinity-pricing-text.xlsx
├── trinity-pricing-image.xlsx
├── trinity-pricing-video.xlsx
├── online/
├── upstream/
├── official/
├── openrouter/
├── draft/
└── validate/
```

## 常用文件（非 Excel）

| 路径 | 命令 | 说明 |
|------|------|------|
| [online/prices-api.json](./online/prices-api.json) | `pricing:fetch` | 平台线上刊例真源 |
| [upstream/summary.md](./upstream/summary.md) | `pricing:upstream` | 生文刊例对比（与 Excel 同源） |
| [upstream/image-summary.md](./upstream/image-summary.md) | `pricing:upstream:image` | 生图刊例对比（与 Excel 同源） |
| [official/text.json](./official/text.json) | `pricing:upstream` | 生文 · JSON（与 Excel 同步） |
| [official/text.md](./official/text.md) | `pricing:upstream` | 生文 · Markdown |
| [official/image.md](./official/image.md) | `pricing:upstream:image` | 生图刊例对比 · Markdown |
| [official/video.md](./official/video.md) | `pricing:compare:official -- --modality=video` | 生视频官方价 |
| [openrouter/text.md](./openrouter/text.md) | `pricing:compare:openrouter` | 官网 vs OpenRouter |
| [draft/0.65_prices-api.json](./draft/0.65_prices-api.json) | `pricing:gen-65` | 建议刊例草案 |

供应商 JSON 真源见 `pricing/suppliers/SOURCES.md`。

## `Trinity模型报价表_hehe.xlsx` 维护约定

`Trinity模型报价表_hehe.xlsx` 视为 **定制报价版本**，用于在最新版 `Trinity模型报价表.xlsx` 基础上维护一套独立折扣。

每次 **上架新模型** 后，按下面流程处理：

1. 先拉取并确认最新价格，确保最新版 `Trinity模型报价表.xlsx` 内容无误。
2. 再同步检查 `Trinity模型报价表_hehe.xlsx` 是否缺少新上架模型。
3. **原有模型保持不变**：已有行的折扣与内容不因同步而覆盖。
4. **只补新增模型**：将最新版中缺失的模型补入 `Trinity模型报价表_hehe.xlsx`。
5. **新增必须高亮**：每次新补充的模型行统一加颜色标记，便于人工复核。

当前约定的高亮方式：

- 新增模型整行使用 **浅黄色** 标记（约 `#FFF2CC`）。
- 对话汇总时，需同时列出本次新增的模型清单，便于核对。

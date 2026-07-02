# Trinity 价目导出索引

> 更新 2026-07-02T03:50:15Z · 生文模型 **59** 款
> TokenHub/百炼：2026-06-30 · AIGC 价目表：2026-06

## 对外 Excel（按模态分册）

| 文件 | 模态 | 说明 |
|------|------|------|
| [trinity-pricing-text.xlsx](./trinity-pricing-text.xlsx) | 生文 | 刊例校验 · 供应商分表 · **汇总-供应商vs官方** |
| [trinity-pricing-image.xlsx](./trinity-pricing-image.xlsx) | 生图 | 官方价对比 |
| [trinity-pricing-video.xlsx](./trinity-pricing-video.xlsx) | 生视频 | 官方价对比 |

生文册 Sheet：

- 刊例对比校验-生文
- TokenHub广州
- 百炼北京
- AIGC国内站
- AIGC国际站
- 汇总-供应商vs官方

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
| [official/text.json](./official/text.json) | `pricing:upstream` | 同上 · JSON（与 Excel 同步） |
| [official/text.md](./official/text.md) | `pricing:upstream` | 同上 · Markdown |
| [official/image.md](./official/image.md) | `pricing:compare:official -- --modality=image` | 生图官方价 |
| [official/video.md](./official/video.md) | `pricing:compare:official -- --modality=video` | 生视频官方价 |
| [openrouter/text.md](./openrouter/text.md) | `pricing:compare:openrouter` | 官网 vs OpenRouter |
| [draft/0.65_prices-api.json](./draft/0.65_prices-api.json) | `pricing:gen-65` | 建议刊例草案 |

供应商 JSON 真源见 `pricing/suppliers/SOURCES.md`。

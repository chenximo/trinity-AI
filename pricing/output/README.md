# Trinity 价目导出索引

> 更新 2026-09-01 · 生文模型 **85** 款
> TokenHub/百炼：2026-06-30 · AIGC 价目表：2026-06

## 商务报价 Excel（先找这里）

| 类型 | 路径 | 说明 |
|------|------|------|
| L3b 真源 | [商务洽谈折扣总表.xlsx](./商务洽谈折扣总表.xlsx) | 族阶梯 + 交叉模型 |
| L3a 外发 | [Trinity模型报价表.xlsx](./Trinity模型报价表.xlsx) | Admin · external |
| L3a 对内 | [Trinity模型报价表（内部）.xlsx](./Trinity模型报价表（内部）.xlsx) | Admin · internal |
| **定制报价** | [custom-quotes/](./custom-quotes/) | hehe / 主力 / 海外三家 · **非主流程** |

Python 脚本索引：[`../scripts/README.md`](../scripts/README.md)

## 对外 Excel（按模态分册 · 刊例对比大册）

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
├── Trinity模型报价表.xlsx
├── Trinity模型报价表（内部）.xlsx
├── 商务洽谈折扣总表.xlsx
├── custom-quotes/                 # 定制报价 Excel
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

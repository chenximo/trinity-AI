# Trinity 价目导出索引

> 更新 2026-07-07 · 生视频刊例 **25** 模型（`official-prices-api-video.json`）

## 对外 Excel（按模态分册）

| 文件 | 模态 | 说明 |
|------|------|------|
| [trinity-pricing-text.xlsx](./trinity-pricing-text.xlsx) | 生文 | 刊例校验 · **汇总-供应商vs官方**（第 2 Sheet）· 各供应商分表（含 vs 官方） |
| [trinity-pricing-image.xlsx](./trinity-pricing-image.xlsx) | 生图 | 刊例对比校验-生图 · 汇总 · AIGC 国内/国际 |
| [trinity-pricing-video.xlsx](./trinity-pricing-video.xlsx) | 生视频 | 刊例对比校验-生视频 · AIGC 分表 · 火山方舟-生视频 |

生视频册 Sheet（见 `paths.mjs` `VIDEO_SHEET_ORDER`）：

- 刊例对比校验-生视频
- 汇总-供应商vs官方-生视频
- AIGC国内站-生视频
- AIGC国际站-生视频
- 火山方舟-生视频

## 目录结构

```
output/
├── README.md
├── trinity-pricing-{text,image,video}.xlsx
├── online/          # L4 刊例缓存（prices-api.json）
├── upstream/
├── official/
├── draft/           # 可上线刊例草案 + diff
├── openrouter/
└── validate/
```

## 常用文件（非 Excel）

| 路径 | 命令 | 说明 |
|------|------|------|
| [online/prices-api-video.json](./online/prices-api-video.json) | `publish-official:video` | **生视频 L4 刊例** |
| [online/prices-api-image.json](./online/prices-api-image.json) | `publish-official:image` | **生图 L4 刊例** |
| [online/prices-api.json](./online/prices-api.json) | `pricing:fetch`（legacy 回退） | 历史路径 |
| [draft/official-prices-api-video.json](./draft/official-prices-api-video.json) | `pricing:gen-official:video` | **生视频上架源** |
| [draft/official-prices-api-video-diff.md](./draft/official-prices-api-video-diff.md) | `pricing:diff:official-video` | 草案 vs 线上 |
| [draft/official-prices-api-image.json](./draft/official-prices-api-image.json) | `pricing:gen-official:image` | 生图上架源 |
| [draft/0.65_prices-api.json](./draft/0.65_prices-api.json) | `pricing:gen-65` | 生文 legacy 草案 |
| [upstream/video-summary.md](./upstream/video-summary.md) | `pricing:upstream:video` | 生视频刊例对比 |
| [upstream/coverage-video.md](./upstream/coverage-video.md) | `pricing:upstream:video` | P6 线上覆盖检查 |

供应商 JSON 真源见 `pricing/suppliers/SOURCES.md`。  
产品 SOP：`apps/trinity-product/docs/ai-api-platform/pricing-sources/`

---

## 产物保留（少囤 JSON）

| 层级 | 保留（可入库） | 可再生 / 定期删 |
|------|----------------|-----------------|
| **L4 刊例** | `online/prices-api-{text,image,video}.json` | `*-flat.json` · `*-index.json` · `*.old.json` · legacy `prices-api.json` |
| **草案** | `draft/official-prices-api-{modality}.json` + `.meta.json` | `*-diff.json`（有 `.md`/`.csv` 即可） |
| **校验** | 无硬性入库 | `validate/*.json`（gate 时再生） |
| **发布** | — | `*-publish.log.json`（默认不再写） |

```bash
npm run pricing:clean              # 删 backup / legacy 重复 / publish 日志
npm run pricing:clean -- --derived # 额外删 flat/index 衍生 JSON
```

改价或 publish 后跑一遍 `pricing:clean`，避免 `output/online/` 堆叠无效文件。

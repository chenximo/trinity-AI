# TokenHub 价目抓取

腾讯云 [TokenHub](https://console.cloud.tencent.com/tokenhub/models) 模型价格与元数据。

## 目录

| 路径 | 说明 |
|------|------|
| `scrape-pricing.mjs` | 控制台 API 抓取 |
| `gen-sample.mjs` | 从 JSON 生成 Markdown 价目表 |
| `lib/pricing-api.mjs` | 扁平化结构与工具函数 |
| `output/pricing-console-api.json` | **真源**（控制台 API） |
| `output/pricing-table.md` | **全量**人读价目表（与控制台抓取后自动生成） |

## 命令

```bash
cd trinity-AI

# 控制台价目（需登录，写入 pricing-console-api.json）
npm run tokenhub:pricing:console

# 生成 10 条示例 Markdown 表（打样）
npm run pricing:supplier:tokenhub:sample -- --count=10
```

真源说明见 [../SOURCES.md](../SOURCES.md)。

首次控制台抓取需安装 Playwright：

```bash
npm install -D playwright && npx playwright install chromium
```

浏览器登录态保存在 `pricing/suppliers/tokenhub/.profile/`（已 gitignore）。

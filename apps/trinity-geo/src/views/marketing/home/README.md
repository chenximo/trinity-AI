# 营销首页（交付工程）

## 1. 一句话

`marketing/index.html` v1.1 **整页 Vue 化**；顶栏/页脚见 `../shell/`，本目录仅 `main#main` 正文。

## 2. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `trinity-geo` |
| 路径 | `/` |
| 布局 | `MarketingSiteLayout` |
| HTML 对照 | `trinity-geo-prototype/marketing/index.html` |

## 3. 五件套

| 文件 | 职责 |
|------|------|
| `MarketingHomePage.vue` | 正文各 section（原型 class） |
| `marketingHomeInteractions.ts` | Dashboard Tab 点击 |
| `marketing-home.css` | 增量 |
| `README.md` | 本文 |

**样式**：`body.geo-site` + 全局 `home.css`（vendored）。

## 4. 链接替换

原型 `console/dashboard.html` → `RouterLink` `geo-dashboard`。

## 5. 已知缺口

- 套件链接 `/ai-cloud`、`/trinity-ai` 依赖门户同源
- `product` / `pricing` 仍跳 HTML 原型（未迁入）

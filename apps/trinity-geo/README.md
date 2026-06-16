# Trinity GEO · 营销首页

**独立 GEO 视觉**：继承套件蓝紫 `--grad` + 场景卡合成底；海外 `--blue-soft` / 国内 `--warning` 双市场语义。

## 本地预览

**门户（推荐）**：根目录 `npm run dev` → [http://localhost:5173/trinity-geo](http://localhost:5173/trinity-geo)

**静态直出**（须在**仓库根目录**启动，以便加载 `packages/tokens`）：

```bash
cd /path/to/trinity-AI && python3 -m http.server 5210
```

→ [http://127.0.0.1:5210/apps/trinity-geo/index.html](http://127.0.0.1:5210/apps/trinity-geo/index.html)

## 与 Trinity AI 聚合首页的差异

| 维度 | Trinity AI（聚合 API） | Trinity GEO |
|------|------------------------|-------------|
| 受众 | 开发者 | 出海品牌营销 / SEO |
| 主色 | `--geo-grad` = `--grad` · accent = `--indigo-500` / `--purple-soft` |
| 语义辅色 | 海外 `--blue-soft` · 国内 `--warning`（Dashboard / 平台） |
| Hero | 居中 + pill + 厂商胶囊 | **左文案右 Dashboard** |
| 核心叙事 | 一个 API 接入模型 | **SOA / 答案可见性 / SEO→GEO** |
| 组件 | fcard、mock-api、stats | 平台矩阵、bento、竞品差距面板 |
| CSS | `trinity-ai/home.css` | **独立** `css/home.css`（`@import` tokens） |

## 规格

[官网首页原型规格](../trinity-product/docs/geo/prototypes/v1-homepage.md)

# Trinity GEO · 营销首页

**独立 GEO 视觉**：继承套件蓝紫 `--grad` + 场景卡合成底；海外 `--blue-soft` / 国内 `--warning` 双市场语义。

## 本地预览

**MVP 演示系统（完整六环）**：

```bash
cd apps/trinity-geo && bun run dev
```

→ [http://127.0.0.1:5203/demo](http://127.0.0.1:5203/demo) · 门户 [http://localhost:5173/trinity-geo/demo](http://localhost:5173/trinity-geo/demo)

**营销首页**：`/` 或门户 `/trinity-geo`（单页，可独立上线）

**官网卫星页（可选）**：

| 页面 | 预览 |
|------|------|
| 产品能力 | [product.html](http://127.0.0.1:5173/__geo_marketing/product.html) · 门户 [`/trinity-geo/product`](http://127.0.0.1:5173/trinity-geo/product) |
| 定价 | [pricing.html](http://127.0.0.1:5173/__geo_marketing/pricing.html) · 门户 [`/trinity-geo/pricing`](http://127.0.0.1:5173/trinity-geo/pricing) |

**控制台（HTML 原型）**：

| 页面 | 预览 | 解读 |
|------|------|------|
| 可见性总览 | [dashboard.html](http://127.0.0.1:5203/__geo_marketing/console/dashboard.html) | [dashboard.md](marketing/console/dashboard.md) |
| 品牌设置 | [brand-settings.html](http://127.0.0.1:5203/__geo_marketing/console/brand-settings.html) | [brand-settings.md](marketing/console/brand-settings.md) |
| 问题集管理 | [keywords.html](http://127.0.0.1:5203/__geo_marketing/console/keywords.html) | [keywords.md](marketing/console/keywords.md) |
| 竞品管理 | [competitors-manage.html](http://127.0.0.1:5203/__geo_marketing/console/competitors-manage.html) | [competitors-manage.md](marketing/console/competitors-manage.md) |
| 竞品概览 | [competitors.html](http://127.0.0.1:5203/__geo_marketing/console/competitors.html) | [competitors.md](marketing/console/competitors.md) |
| 竞品详情（OpenRouter） | [competitor-detail.html](http://127.0.0.1:5203/__geo_marketing/console/competitor-detail.html) | [competitor-detail.md](marketing/console/competitor-detail.md) |
| 诊断列表 | [diagnosis.html](http://127.0.0.1:5203/__geo_marketing/console/diagnosis.html) | [diagnosis.md](marketing/console/diagnosis.md) |
| 优化待办 | [optimize.html](http://127.0.0.1:5203/__geo_marketing/console/optimize.html) | [optimize.md](marketing/console/optimize.md) |
| CCR 样本（Q01·ChatGPT） | [answer-detail-brand.html](http://127.0.0.1:5203/__geo_marketing/console/answer-detail-brand.html) | — |
| 监测概览 | [monitoring.html](http://127.0.0.1:5203/__geo_marketing/console/monitoring.html) | [monitoring.md](marketing/console/monitoring.md) |
| 关键词详情（Q00） | [keyword-detail.html](http://127.0.0.1:5203/__geo_marketing/console/keyword-detail.html) | [keyword-detail.md](marketing/console/keyword-detail.md) |
| AI 回答详情（Q00·豆包） | [answer-detail.html](http://127.0.0.1:5203/__geo_marketing/console/answer-detail.html) | [answer-detail.md](marketing/console/answer-detail.md) |

**静态直出**（仓库根目录 `python3 -m http.server 5210`）：

→ [http://127.0.0.1:5210/apps/trinity-geo/marketing/index.html](http://127.0.0.1:5210/apps/trinity-geo/marketing/index.html)

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

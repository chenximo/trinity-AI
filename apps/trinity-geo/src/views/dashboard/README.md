# 可见性总览（交付工程）

## 1. 一句话

控制台首页：SOA KPI、平台分布、竞品对比、最新回答；Vue 五件套真源，对照 `trinity-geo-prototype` HTML。

## 2. 本页规则

- 市场 / 周期 Tab 仅筛展示；口径见 `product-design-analysis.md` §0.6。
- 上手弹层：`localStorage.geo_dash_onboard_done`。

## 3. 工程对齐

- 路由：`geo-dashboard` · `/console`（门户 `/trinity-geo/console`）
- 入口：`DashboardPage.vue`
- 对照：`apps/trinity-geo-prototype/marketing/console/dashboard.html`

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `DashboardPage.vue` | 整页模板（类名与 HTML 原型一致） |
| `dashboard.css` | 增量 |
| `dashboardInteractions.ts` | 市场/周期/onboard |
| `mock.ts` | KPI、平台、竞品、回答 |
| `README.md` | 本文 |

**样式真源**：`src/assets/geo-css/`（vendored 自 `trinity-geo-prototype/marketing/css`）+ `vue-bridge.css`；`main.ts` 全局引入，子页须沿用原型 class，禁止自造魔法色。

## 5. 接 API

替换 `mock.ts` → `api/`；趋势图与诊断/优化区待后续模块迁入。

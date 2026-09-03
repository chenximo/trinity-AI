# 可见性总览（原型）

## 1. 一句话

控制台首页：品牌 SOA / 平台分布 / 竞品对比 / 最新回答；HTML 真源 `marketing/console/dashboard.html` 的 `<main>` + 上手弹层迁入本页。

## 2. 本页规则（需求）

- 市场 Tab（全部 / 海外 / 国内）与周期（日 / 周 / 月）只筛展示，不改采集。
- KPI / 平台行 / 趋势线口径见手册 `apps/trinity-product/docs/geo/product-design-analysis.md` **§0.6**（SOA、CCR、引用 M/N、D1–D5、S1–S6、R1/R2）。本页不复制该长文。
- 上手弹层：`localStorage.geo_dash_onboard_done`；关闭后不再弹出。
- 顶栏 9 项仍含引用 / 情感（走查后再收导航）。

## 3. 工程对齐

- 路由：独立 `/console` · 门户 `/trinity-geo/console` · name `geo-dashboard` · `meta.nav` = `dashboard`
- 入口：`DashboardPage.vue`（同步引入，见 `src/geoRoutes.ts`）
- 对照：`marketing/console/dashboard.html`
- 样式：壳 `src/views/shell/shell.css` `@import` `marketing/css/{core,home,dashboard}.css`，本页无 `dashboard.css`

## 4. 五件套

迁页期模板为 HTML 整页 + `v-pre`；`mock.ts` / `dashboardInteractions.ts` 保留为后续去 `v-pre` 时的契约，当前未接线。

| 文件 | 职责 |
|------|------|
| `DashboardPage.vue` | 整页模板 + onboard |
| `mock.ts` | 后续 Vue 化 KPI / 平台行（当前未引用） |
| `dashboardInteractions.ts` | 后续市场/周期/onboard composable（当前未引用） |
| `README.md` | 本文 |
| （无独立 css） | 走壳层营销 CSS |

## 5. 接 API 时

1. 去掉 `v-pre` 与 `marketing/js/dashboard.js` raw eval。
2. 用 `mock.ts` 类型接真实 snapshot，再换 `dashboardInteractions.ts`。
3. 可删 `marketing/console/dashboard.md`（以本文 + 手册 §0.6 为准）。

## 6. 已知缺口

- 主路径按钮多为 disabled；采集未接。
- 页内 `./dashboard.md` 产品解读在 Vue 路由下会 404（对照请打开 marketing 静态文件）。

## 7. 参考

- `marketing/console/dashboard.md`
- 产品线：`apps/trinity-product/docs/geo/index.md`

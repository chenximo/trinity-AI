# 审计报告（原型）

## 1. 一句话

由 `marketing/console/audit-reports.html` 的 `<main>` 迁入 Vue，顶栏走控制台壳。

## 2. 本页规则（需求）

与 HTML 原型同屏能力；口径见手册 `apps/trinity-product/docs/geo/product-design-analysis.md` §0.6。
迁完后以本文 + 页面模板为准。对应 `audit-reports.html` 旁解读 `.md` 仍可对照，不在本目录再写一份需求长文。

## 3. 工程对齐

- 路由：`/console/…`（门户 `/trinity-geo/console/…`）· `meta.nav` = `diagnosis`
- 入口：`AuditReportsPage.vue`
- 对照：`marketing/console/audit-reports.html`
- 样式：壳层 `src/views/shell/shell.css` `@import` 营销 CSS，本页无独立 css

## 4. 五件套

本页为 HTML 整页迁入。无独立 mock / Interactions（避免空文件）。简单页允许合并。

| 文件 | 职责 |
|------|------|
| `AuditReportsPage.vue` | 整页模板（`v-pre`，不拆子组件） |
| `README.md` | 本文 |


## 5. 接 API 时

先把表格/KPI 抽到 `mock.ts`，再补 `*Interactions.ts`，去掉 `v-pre` 与 raw JS。

## 6. 已知缺口

- 主按钮多为 disabled。
- 页内 `./xxx.md` 产品解读链未接到文档站。

## 7. 参考

- `marketing/console/audit-reports.md`
- 产品线：`apps/trinity-product/docs/geo/index.md`

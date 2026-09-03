# 控制台壳（原型）

## 1. 一句话

用户控制台顶栏 + `RouterView`。各业务页不再复制 header。

## 2. 本页规则（需求）

- 顶栏 9 项与现 HTML 一致（引用 / 情感仍在；Vue 走查后再收）。
- 页内 `href="./xxx.html"` 由壳拦截，跳到对应 Vue 路由。
- 不负责 KPI / 表格；那些在子页五件套。

## 3. 工程对齐

- 路由：父级 `/console`（门户 `/trinity-geo/console`），默认子路由 name `geo-dashboard`
- 入口：`GeoConsoleLayout.vue`
- 对照：各 `marketing/console/*.html` 的 `<header class="geo-console-header">`

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `GeoConsoleLayout.vue` | 顶栏 + 子路由出口 |
| `shell.css` | `@import` 营销控制台 CSS |
| `shellInteractions.ts` | HTML 链 → 路由；`body.geo-console`；迁页 IIFE |
| `mock.ts` | 导航项、文件名映射 |
| `README.md` | 本文 |

## 5. 接 API 时

壳可不动。换登录态 / 品牌名时改模板右上角或后续接 session。

## 6. 已知缺口

- 无真实登录；账户链到设置页。
- 样式仍依赖 `marketing/css/dashboard.css` 大表。

## 7. 参考

- 产品线：`apps/trinity-product/docs/geo/index.md`
- 口径：`product-design-analysis.md` §0.6

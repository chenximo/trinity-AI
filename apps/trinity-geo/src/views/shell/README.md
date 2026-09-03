# 控制台壳（交付工程）

## 1. 一句话

用户控制台顶栏 + `RouterView`；各业务页不复制 header。

## 2. 本页规则

- 顶栏 9 项与 HTML 原型一致（引用 / 情感保留，走查后再收）。
- 子页用 `RouterLink` / 路由 name，不拦截 `./xxx.html`。

## 3. 工程对齐

- 路由：父级 `/console`（门户 `/trinity-geo/console`）
- 入口：`GeoConsoleLayout.vue`
- 对照原型：`apps/trinity-geo-prototype/marketing/console/*.html`

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `GeoConsoleLayout.vue` | 顶栏 + 子路由出口 |
| `shell.css` | `@import` 原型 CSS（`src/assets/geo-css/`） |
| `shellInteractions.ts` | `body.geo-console` |
| `mock.ts` | 顶栏导航项 |
| `README.md` | 本文 |

样式在 `main.ts` 全局加载，避免子路由漏引。

## 5. 参考

- 口径：`apps/trinity-product/docs/geo/product-design-analysis.md` §0.6

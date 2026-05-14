# 站点壳模块（原型）

> 目录与交付约定见仓库根文档：`docs/Trinity原型模块目录与交付规范.md`。

## 1. 一句话

全站顶栏、移动抽屉、`RouterView` 正文槽与登录/注册弹层集中在 **`TrinityAiShellLayout.vue` 单文件**（原 `layouts/` + `components/TrinityAiAuthModal.vue` 已合并）；会话 / 主题 / 界面语言 composable 与 `window.TrinityOR` 桥接在 **`shellInteractions.ts`**；导航项与 `localStorage` 键名在 **`mock.ts`**。

## 2. 五件套（本目录仅五个文件）

| 文件 | 职责 |
|------|------|
| `TrinityAiShellLayout.vue` | 路由父级壳：主导航、用户菜单、主题、登录弹层 DOM 与脚本（单入口，无同目录子 `.vue`） |
| `shell.css` | 壳层增量样式占位；视觉真源以全局 `or-*` 表为准（见 README §4） |
| `shellInteractions.ts` | `mountTrinityOrWindowApi`；`useTrinityOrSession` / `useTrinityOrTheme` / `useTrinityOrUiLang`（原 `src/composables/*`） |
| `mock.ts` | `SHELL_PRIMARY_NAV`、`TRINITY_OR_REMEMBER_KEY` 及会话/主题/语言的 **localStorage 键名** |
| `README.md` | 本说明 |

## 3. 路由

`apps/trinity-ai/src/router/index.ts` 将根布局 `component` 指向本目录 **`TrinityAiShellLayout.vue`**；子路由仍由 `getTrinityAiChildRoutes()` 提供。

## 4. 依赖样式

- 登录弹层与顶栏的 `or-*` / `or-auth-*` 等规则在应用入口或全局 CSS 中维护（与静态 `TrinityAI` 原型对齐）；本目录 `shell.css` 仅占位。

## 5. 接 API / 正式开发

1. 替换 `onSigninSubmit` / `onSignupSubmit` / `oauthDemo` 为真实鉴权；`mock.ts` 可保留键名常量或迁入配置层。  
2. `shellInteractions.ts`：若不再暴露 `window.TrinityOR`，可删除桥接。  
3. 弹层若拆为独立包内组件，再迁出 `views/shell/`（并更新本 README）。

## 6. 参考

- `docs/TrinityAI用户站Vue还原计划.md`（壳与弹层行为说明）

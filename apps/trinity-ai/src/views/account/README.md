# Account 域（原型 · 精简五件套）

> 目录与 **§7.1 多路由精简契约** 见：`docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md`。  
> **用户控制台系统文档索引**：`docs/03-用户控制台系统/README.md`（与平台运营后台 `docs/02-后台运营管理系统设计/` 分轨）。

## 路由真源（工程 ↔ 静态）

以下与 `src/trinityAiRoutes.ts` 一致；嵌套在 `apps/trinity-portal` 的 `/trinity-ai` 下时，路径前加 `/trinity-ai`。

| path（子路径） | 路由 name | 路由级 Vue | 静态真源 `TrinityAI/account/*.html` | 说明 |
|----------------|-----------|------------|--------------------------------------|------|
| `account/console` | `tai-account-console` | `ConsolePage.vue` | `console.html` | 懒加载；主列自静态迁入；壳内链用 `ACCOUNT_CONSOLE_HASH`；实例名 `TaiAccountConsolePage` 供壳 `KeepAlive` |
| `account/keys` | —（无 name） | — | `keys.html`（重定向到 `console.html#keys`） | **redirect** → `tai-account-console` + `ACCOUNT_CONSOLE_HASH.KEYS` |
| `account/billing` | — | — | `billing.html`（→ `console.html#credits`） | **redirect** → `tai-account-console` + `ACCOUNT_CONSOLE_HASH.CREDITS` |
| `account/login` | — | — | `login.html`（→ 首页 `#login`） | **redirect** → `tai-home` + `#login` |
| `account/register` | — | — | `register.html`（→ 首页 `#register`） | **redirect** → `tai-home` + `#register` |

## 1. 一句话

账户控制台为 **单页 + hash 五区**（与 `console.html` 一致）；站内链为 `RouterLink`。静态页内联脚本以 `legacy/inline*.js` 保留并在首次进入控制台时注入（全 SPA 一次），故壳内 **`RouterView` 对控制台使用 `KeepAlive`**，避免离开再进时交互未绑定。布局与留白约定见 **§4**。

## 2. 域内文件

| 文件 | 职责 |
|------|------|
| `ConsolePage.vue` | 路由入口：根为 **`main.mvp-main`**；内为 `or-shell`、五面板与模态（**无** `page-foot`） |
| `account.css` | OpenRouter 式控制台布局（`#main` flex、侧栏/主列无边框、隐藏页脚）及历史 `account-proto-*` |
| `mock.ts` | `ACCOUNT_STATIC_DIR`、`CONSOLE_HTML`、`ACCOUNT_CONSOLE_HASH` |
| `accountInteractions.ts` | `hashchange` ↔ 面板 `hidden`；按静态顺序注入 `legacy/inline1.js`、`@repo/assets/adm-form2-dd.js`、`legacy/inline2.js` |
| `legacy/inline1.js`、`legacy/inline2.js` | 自 `TrinityAI/account/console.html` 抽出的内联脚本原文（复制、Preset/Keys 弹层等） |
| `README.md` | 本说明 |

## 3. 依赖样式

- 本目录：`account.css`（由 `ConsolePage.vue` `import`）。
- 全局：`trinity-base` / 壳层与营销页共用 token（见 `views/shell/README.md`）。

## 4. 布局与视觉（OpenRouter 式控制台）

> 产品参考：顶栏 + 左侧工作区/账户导航 + 右侧主内容；**无整页页脚**；侧栏/主列用 token 区分底色（见下表）。实现真源为 **`account.css`**（勿在 `ConsolePage.vue` 内联大块 layout）。

| 层级 | DOM / 职责 |
|------|----------------|
| 顶栏 | **`TrinityAiShellLayout`** 内 `header.or-inject`（全站主导航、账户入口） |
| 左栏 | **`.or-shell > aside.or-side`**：工作区（keys / preset）与账户（credits / activity / logs）链接；`RouterLink` 为产品区 |
| 主列 | **`.or-shell > .or-main`**：`data-or-panel` 五区 + 模态根节点 |
| 壳主列 | **`main#main`**：在存在 `.account-console-root` 时 `padding: 0`、纵向 flex 占满顶栏下高度，避免与营销首页 `main#main` 留白规则冲突 |

| 视觉约定 | 说明 |
|----------|------|
| 左栏贯通 | 桌面 **`.or-side` `align-self: stretch`**，与 **`.or-main` 同高**，`--surface` 背景自上而下拉满；侧栏链接过多时 **`overflow-y: auto`** |
| 主列底 | **`.or-main`** 背景 **`var(--bg)`**，与侧栏 `--surface` 成对 |
| 无整页页脚 | 模板不渲染 `page-foot`；`account.css` 对遗留 `.page-foot` `display: none` 兜底 |
| 留白 | 主列 `.or-main` 使用收紧的 `padding`；侧栏 `sticky` 顶距与 `max-height` 与 `--nav-h` 对齐 |

全站页边距、50px gutter 等仍以 **`docs/01-原型与交付规范/Trinity版式与视觉规范.md`** 为准；控制台 Vue 特例以上表 + `account.css` 为准。

## 5. 数据与交互

- **mock**：常量与 hash；表格/角色假数据仍在模板 DOM 中（接 API 时再迁入 `mock.ts`）。
- **交互**：`accountInteractions.ts`；遗留脚本在 `document`/`window` 上的监听**原型阶段不随路由卸载**（刷新页面可清）。

## 6. 结构约定

- 每路由一枚**路由级**入口：`/account/console` 仅对应 `ConsolePage.vue`；其余路径为 redirect，**不**在 `views/account/components/` 下拆子 `.vue`。

## 7. 接 API / 正式开发时建议优先动哪些文件

1. `ConsolePage.vue` / `gen-account-console-page.mjs`：静态 `console.html` 变更后同步大模板或改交互下沉策略。
2. `mock.ts`：密钥表、Preset 列表等假数据。
3. `accountInteractions.ts` / `legacy/*`：将遗留 IIFE 逐步改为可 `dispose` 的 TS（并评估是否保留 `KeepAlive`）。

## 8. 已知缺口与风险

- 遗留脚本仅**首次**进入控制台时注入；依赖壳对 `TaiAccountConsolePage` 的 **KeepAlive**，勿在不清缓存策略下强依赖「第二次冷挂载控制台」。
- 大模板单文件约 1.4k 行，合并冲突时优先用脚本区注释分区 + `gen-account-console-page.mjs` 对齐静态。

## 9. 参考

- 静态目录：`TrinityAI/account/`（`console.html`、`keys.html`、`billing.html`、`login.html`、`register.html`）。

## 10. 二次开发补充（§6.1）

无。

## 11. 与平台「运营后台」产品文档的关系

- **本目录（Account）**：租户 / 开发者使用的 **控制台 UI 真源**（密钥、额度、活动、用量等），**不是**平台员工使用的聚合 **运营后台**。  
- **整平台产品全景（一页）**：`docs/AI-API聚合平台-产品全景与介绍.md`（双端矩阵、能力地图入口）。  
- **运营后台**（独立产品、文档另轨）：模块级真源见 **`docs/AI-API聚合平台-后台管理系统-详细设计-v1.md`**（建议从 §1.5、头部「文档范围」读起）。  
- **后续**：可将本 README 中偏 **产品 / IA** 的段落拆出为《租户侧控制台》短文，与上述设计文档 **互链**，避免与运营侧 §4.7「租户主数据」混写。

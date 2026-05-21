# Chat 模块（原型）

> 目录与交付约定见仓库根文档：`docs/Trinity原型模块目录与交付规范.md`。

## 1. 一句话

对话页原型：主列与浮层结构在 `ChatPage.vue` 模板中；假数据与 `paintMock*` 在 `mock.ts`；样式为全局 `chat.css`；DOM 行为在 `chatInteractions.ts`。与正式接入 API 后的实现会有差距。

## 2. 五件套（本目录仅五个文件）

| 文件 | 职责 |
|------|------|
| `ChatPage.vue` | 路由入口：整页模板（侧栏、主列、浮层、说明 `<template>`、弹窗壳）、模型选中与收藏、`patchTaiChatAnchors` |
| `chat.css` | 模块唯一样式表（全局 CSS，非 CSS Modules） |
| `chatInteractions.ts` | 说明气泡、壳层布局 composable、锚点替换、原型级点击与键盘行为 |
| `mock.ts` | 模型与会话等演示数据、`paintMock*` 等纯函数 |
| `README.md` | 本说明 |

历史迁移脚本（源文件已无时为 no-op）：`apps/trinity-ai/scripts/bundle-chat-fivepiece.mjs`。

## 3. 路由

| 路径（独立 `trinity-ai`） | 路由 name | 说明 |
|---------------------------|-----------|------|
| `/chat` | `tai-chat` | 懒加载，见 `src/trinityAiRoutes.ts` |

嵌套在 `apps/trinity-portal` 的 `/trinity-ai` 下时为 `/trinity-ai/chat`，共用同一路由表。

## 4. 接 API / 正式开发时建议优先动哪些文件

1. `mock.ts` → 换为请求层 + 类型（或删除并由 store 提供数据）。
2. `chatInteractions.ts` → 改为 composable / Pinia 与真实组件事件，删除全局委托。
3. 主列 / 浮层 DOM → 已在 `ChatPage.vue` 模板中维护；接 API 时可逐步改为数据驱动子块。
4. `ChatPage.vue`：保留为编排入口或继续合并/拆分模板（若规范变更）。

## 5. 已知缺口与风险

- 多模型对比、场景卡加载集合等未按静态脚本完整实现。
- 无障碍与错误态为占位级别。

## 6. 参考

- 静态原型：`TrinityAI/app/chat/`（`index.html`、`chat-openrouter.js`、`chat-openrouter.css`）
- 迁移计划：`docs/04-工程与迁移/Trinity对话页Vue迁移计划.md`
- 静态期交互备忘（归档）：`docs/06-归档与提示词/Trinity对话页原型说明（归档）.md`

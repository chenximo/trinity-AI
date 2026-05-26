---
title: 用户侧模块
---

# 用户侧模块 · 总览

::: tip 指标待填（文内含 TODO）
- **当前已做**、**5.30 能力** 请用 **✅ 🟡 ⬜**
- **体验地址** 默认指向部署环境；本地开发见表下说明  
:::

> 平台三层之 **用户侧**：官网、登录、广场、Chat、文档、控制台等**对外产品**。

**部署基址**：[http://43.159.57.43/trinityai/](http://43.159.57.43/trinityai/)

| 用户侧模块 | 对标 OpenRouter | 当前已做 | 5.30 能力 | 原型链接 | 体验地址 |
|------------|-----------------|:--------:|:---------:|----------|----------|
| 营销首页 / 落地页 | 首页 + CTA | 🟡 | ✅ | `TrinityAI/index.html` | [首页](http://43.159.57.43/trinityai/) |
| 注册 / 登录 | Sign up / OAuth | ⬜ | ⬜ | `TrinityAI/account/login.html` | [登录](http://43.159.57.43/trinityai/account/login) |
| [模型广场列表](./model-catalog) | Models | ⬜ | ⬜ | `TrinityAI/app/models.html` | [模型广场](http://43.159.57.43/trinityai/models) |
| [Chat 在线体验](./chat-experience) | Chat | ⬜ | ⬜ | `TrinityAI/app/chat/index.html` | [Chat](http://43.159.57.43/trinityai/chat) |
| [开发者文档](./developer-docs) | Docs + API Ref | ⬜ | ⬜ | `TrinityAI/app/docs.html`（旧静态） | [文档站](http://127.0.0.1:5205/docs/)（本地；部署路径待补） |
| [用户控制台](./account-console) | Account / Keys | ⬜ | ⬜ | `TrinityAI/account/console.html` | [控制台](http://43.159.57.43/trinityai/account/console) |

本地开发：`npm run dev:trinity-ai` → `http://127.0.0.1:5201`（路径与上表相同，如 `/models`、`/chat`）。经门户：`http://127.0.0.1:5173/trinity-ai/…`。

## 5.30 能力门禁（待你勾选）

| 优先级 | 模块 |
|--------|------|
| P0 | 模型广场：可浏览在架模型，与运营上架一致 |
| P0 | 开发者文档：Quickstart 生文可调通 |
| P0 | 控制台：Key + 用量 |

用例步骤与 Bug 见 [飞书 · 5.30 体验测试表](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)。

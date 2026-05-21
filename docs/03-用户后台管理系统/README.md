# 03 · 用户后台管理系统

> **定位**：租户 / 开发者使用的 **用户侧控制台**（API 密钥、额度、用量、Preset 等），与 [`02-后台运营管理系统设计/`](../02-后台运营管理系统设计/)（**平台内部员工**运营后台）**严格分轨**。  
> **风格统一真源**：[用户后台管理风格统一规范.md](./用户后台管理风格统一规范.md)（**必读**）  
> **全站交付**：[`01-原型与交付规范/`](../01-原型与交付规范/Trinity原型模块目录与交付规范.md)  
> **产品说明**：[`05-产品与PRD/`](../05-产品与PRD/) · 租户能力见产品全景 §3.1

---

## 文档一览

| 文档 | 说明 |
|------|------|
| **[用户后台管理风格统一规范.md](./用户后台管理风格统一规范.md)** | 双轨定位、母版 `account`、布局/组件/按钮、AI 云接入清单、禁止事项 |
| **Agent Skill** | `.cursor/skills/trinity-user-console/SKILL.md`（生成 Vue 时的操作手册；样例见 `/user-console-spec`） |
| **方法论** | [08/Vue原型生成最佳实践-Skill规范页与验收.md](../08-方法论与汇报/Vue原型生成最佳实践-Skill规范页与验收.md)（为何三层、流程、规范先行） |
| **Agent 验收** | `/user-console-spec` · `.cursor/skills/trinity-user-console/SKILL.md` |
| **[AI云-用户后台-需求理解.md](./AI云-用户后台-需求理解.md)** | AI 云登录后用户中心：IA、五模块内容、旅程、待确认项 |
| [用户控制台-布局与样式规范.md](./用户控制台-布局与样式规范.md) | OpenRouter 式壳层、`account.css`、**§4.1 列表表头/操作列** |
| 用户后台 · 原型总览（待写） | 模块 ↔ `views` 对照（Trinity AI / AI 云） |

---

## 可运行入口

| 路由 | 说明 |
|------|------|
| [`/user-console-spec`](http://localhost:5173/user-console-spec) | 设计枢纽 · **用户后台·规范**（条文 + 各节内联样例） |
| [`/trinity-ai/account/console`](http://localhost:5173/trinity-ai/account/console) | Trinity AI · **完整原型**（`ConsolePage.vue`） |
| [`/ai-cloud`](http://localhost:5173/ai-cloud) | AI 云 · 营销首页（`HomePage.vue`） |
| [`/ai-cloud/account/console`](http://localhost:5173/ai-cloud/account/console) | AI 云 · 用户中心（默认 `#accounts`） |
| [`/design-spec`](http://localhost:5173/design-spec) | 全站 UI 原子（筛选、按钮、弹窗） |

独立设计站：`npm run dev -w @trinity/app-trinity-design`（端口 5210）路径相同。

---

## 工程真源（Trinity AI）

| 模块 | 路径 |
|------|------|
| Account 控制台 | [`apps/trinity-ai/src/views/account/`](../../apps/trinity-ai/src/views/account/README.md) |
| 产品壳 | [`apps/trinity-ai/src/views/shell/`](../../apps/trinity-ai/src/views/shell/README.md) |

**AI 云** 用户后台：规划在 `apps/ai-cloud` 内按 **account 五件套** 同构接入，见统一规范 §11。

---

## 与运营后台对比（一句话）

- **用户后台**：`@account` + `trinity-base` + `/design-spec` → `/user-console-spec`  
- **运营后台**：`trinity-ai-admin` + Element Plus → `/admin-ops-spec`  

新增文档或 app 时 **勿** 与 `02-后台运营管理系统设计` 混写。

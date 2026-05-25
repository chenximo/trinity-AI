# AI 云 · 用户中心（Account 五件套）

> **模块需求 / 字段 / 交互定稿**：[`docs/03-用户控制台系统/AI云-用户控制台系统-需求理解.md`](../../../../docs/03-用户控制台系统/AI云-用户控制台系统-需求理解.md) **§5.1**（产品真源，改需求只改该处）  
> **用户控制台系统视觉与 DOM**：`.cursor/skills/trinity-user-console/SKILL.md` · `/user-console-spec#spec-sample-main`  
> **交付规范**：[`docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md`](../../../../docs/01-原型与交付规范/Trinity原型模块目录与交付规范.md) §6（**本 README = 工程索引，非 PRD**）

## 路由真源

| path | name | Vue | 说明 |
|------|------|-----|------|
| `account/console` | `aic-account-console` | `ConsolePage.vue` | 单页 + hash；默认 `#accounts` |
| `` | — | redirect | → `account/console#accounts` |

| 环境 | URL |
|------|-----|
| 独立 dev | http://localhost:5202/account/console#accounts |
| 门户 | http://localhost:5173/ai-cloud/account/console#accounts |

## 五件套职责

| 文件 | 职责 |
|------|------|
| `ConsolePage.vue` | 路由入口；壳层 + 五区 `data-or-panel` |
| `mock.ts` | Hash、面板常量、`MOCK_CLOUD_ACCOUNTS`、`MOCK_BILLING_*`、`MOCK_INVOICE_*` 等 |
| `consoleInteractions.ts` | hash ↔ 面板 `hidden` |
| `ai-cloud-console.css` | 本模块增量样式（厂商色标、弹窗、列补丁等） |
| `README.md` | 本文件：路由、文件边界、工程状态、链到需求与规范 |

## 工程对齐

- **样式链**：`@trinity-ai/views/account/account.css`（`ConsolePage.vue` import）+ 本目录 `ai-cloud-console.css`。
- **结构参照**：`apps/trinity-ai/.../ConsolePage.vue` `#keys` 的页头/表壳（**业务文案与列**以 §5.1 为准）。
- **规范**：`trinity-user-console`（页头 UC-MAIN-*、表 UC-TBL-*、`SearchForm1Fixed`、操作 &lt;4 线框）。
- **未写「落地工程」时**：勿改 `assets/trinity-base.css`；勿改 `trinity-ai` / `TrinityAI/account`。

## hash 与实现状态

| hash | ConsolePage | 备注 |
|------|-------------|------|
| `#accounts` | §5.1 已落地 | 见需求文档字段表 |
| `#billing` | §5.2 已落地 | KPI + 占比图 + 明细表 + 下钻弹窗 |
| `#invoices` | §5.4 P0 已落地 | 双栏概览 + 抬头 chips + 记录表；企业认证演示弹窗（与 `#accounts` 共用） |
| `#contact` | 顾问主卡 + 支持/财务/商务通道 + 官网预约 CTA | §5.5 |

## 依赖与脚本

- 形式 2 筛选：`@repo/assets/adm-form2-dd.js`（`#accounts` / `#billing` 挂载时注入）。
- 搜索 / 弹窗组件：`@trinity/ui`（如 `SearchForm1Fixed`、`ModalPanel`），按 §5.1 与 design-spec。

## 接 API 时建议动哪些文件

1. `mock.ts` — 云账号、费用汇总/明细字段  
2. `ConsolePage.vue` — 模板与筛选/搜索逻辑  
3. `consoleInteractions.ts` — 若 hash 规则变复杂再拆  
4. `ai-cloud-console.css` — 仅保留 AI 云专有视觉  

## 参考

- 对照母版：`apps/trinity-ai/src/views/account/README.md`（五件套 README 写法示例）  
- 用户控制台系统文档索引：`docs/03-用户控制台系统/README.md`

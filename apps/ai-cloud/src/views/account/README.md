# AI 云 · 用户中心（Account）

> **规范**：[docs/03-用户后台管理系统/AI云-用户后台-需求理解.md](../../../../docs/03-用户后台管理系统/AI云-用户后台-需求理解.md)  
> **样式母版**：`apps/trinity-ai/src/views/account/account.css`

## 路由

| path（嵌套在 `/ai-cloud` 下） | name | 说明 |
|------------------------------|------|------|
| `account/console` | `aic-account-console` | 单页 + hash 五区；默认 `#accounts` |
| `` | redirect | → `account/console#accounts` |

独立 dev：`npm run dev -w @trinity/app-ai-cloud` → http://localhost:5202/account/console#accounts  
门户：`npm run dev -w @trinity/app-trinity-portal` → http://localhost:5173/ai-cloud/account/console#accounts

## 文件

| 文件 | 职责 |
|------|------|
| `ConsolePage.vue` | 路由入口；账号管理表格 + 其余四区简版 |
| `mock.ts` | hash 常量、`MOCK_CLOUD_ACCOUNTS` |
| `consoleInteractions.ts` | hash ↔ `data-or-panel` |

## 产品约定（已确认）

- **默认区**：账号管理（`#accounts`）
- **费用 / 合同 / 发票 / 联系**：简版占位，后续迭代
- **官网**：不迁入本 app，链至 `TrinityCloud/home.html`

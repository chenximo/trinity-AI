# admin-billing · 用量与计费（P2 · §4.3）

## 1. 一句话

用量明细、扣费/入账流水、配额、SKU、账单、调账的 **七 Tab + 表格 + 导出占位**（mock），对齐详设 **§4.3**。列表页遵循 **[运营后台-若依式列表规范.md](../../../../docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md)**（参考 `admin-keys/KeysPage.vue`）。

## 2. 路由

| path 段 | name 后缀 | 说明 |
|---------|-----------|------|
| `billing/usage` | `tai-admin-billing-usage` | **用量明细**（默认） |
| `billing/debit-ledger` | `…-debit-ledger` | 扣费流水 |
| `billing/credit-ledger` | `…-credit-ledger` | 入账流水 |
| `billing/quota` | `…-quota` | 配额监控 |
| `billing/sku` | `…-sku` | 套餐 SKU |
| `billing/invoice` | `…-invoice` | 账单 |
| `billing/adjust` | `…-adjust` | 调账 / 充值 |

门户内：`/trinity-ai-admin/billing/usage` 等。侧栏二级见 `moduleSecondaryPages.ts` → `tai-admin-billing`。

## 3. 五件套

| 文件 | 职责 |
|------|------|
| `BillingPage.vue` | 单入口；`route.meta.billingTab` 切换七表 |
| `billing.css` | 页布局、徽章、等宽字体 |
| `billingInteractions.ts` | Tab 与 `sessionStorage` |
| `mock.ts` | 各 Tab 表行 |
| `README.md` | 本说明 |

## 4. 列表规范（2026-05-19 对齐 API 密钥）

| 项 | 实现 |
|----|------|
| 结构 | `section.bill-page__panel` → `el-card` → `AdminSectionHead toolbar-only` |
| 查询 | `AdminListQuery`；时间类 Tab 带 `AdminDateRangePicker` + `AdminExportCsvButton` |
| 表格 | `admin-ep-table-wrap`；列 `:min-width="ADMIN_TABLE_COL.*"`；无数据列 `width` / `align` |
| 用量状态 | 徽章 `bill-page__badge`（200 / 429 等） |
| 说明 | 产品文案在 `AdminInternalTip`，不在卡片内重复标题 |

## 5. 接 API 后

替换 `mock.ts`；导出与分页进 `billingInteractions.ts`；金额字段接计费引擎；用量明细支持从大盘/风控带 query 筛选。

---

*对齐日期：2026-05-19*

# admin-billing · 用量与计费（P2）

## 1. 一句话

用量明细、配额、SKU、账单、调账的 **Tab + 表格 + 示意按钮**（mock），对齐 **`docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` §4.3**。

## 2. 路由

| path（独立 app） | name |
|------------------|------|
| `/billing` | `tai-admin-billing` |

门户内：**`/trinity-ai-admin/billing`**。

## 3. 五件套

| 文件 | 职责 |
|------|------|
| `BillingPage.vue` | 整页 Tab + 各分区 |
| `billing.css` | 样式 |
| `billingInteractions.ts` | Tab 与 `sessionStorage` |
| `mock.ts` | 表行与 SKU 等 |
| `README.md` | 本说明 |

## 4. 接 API 后

替换 `mock.ts`；导出与分页进 `billingInteractions.ts`；金额字段接计费引擎。

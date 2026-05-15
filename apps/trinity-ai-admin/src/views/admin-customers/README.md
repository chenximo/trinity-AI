# admin-customers · 客户与合同（P6）

## 1. 一句话

运营侧 **租户主数据与商务财务**（§4.7）：五类二级子路由共 **`CustomersPage.vue`**，数据以 `mock.ts` 为主；**租户列表**支持检索与 `localStorage` 增改。

## 2. 路由（`tai-admin-customers-*`）

| path | name | 说明 |
|------|------|------|
| `/customers/tenants` | `tai-admin-customers-tenants` | 租户列表（默认） |
| `/customers/org` | `tai-admin-customers-org` | 组织 / 项目 |
| `/customers/contract` | `tai-admin-customers-contract` | 合同 |
| `/customers/invoice` | `tai-admin-customers-invoice` | 发票与抬头 |
| `/customers/credit` | `tai-admin-customers-credit` | 授信 |

父级 `tai-admin-customers` → redirect 至 `tenants`。

## 3. 文件

| 文件 | 职责 |
|------|------|
| `CustomersPage.vue` | 五子页 `v-show` + 租户弹窗 |
| `mock.ts` | 假数据（`org-acme` 等与计费/密钥对齐） |
| `customersInteractions.ts` | 租户行 / 搜索 `localStorage` |
| `customers.css` | `cus-*` 样式 |

## 4. 联调

- **用量与计费** §4.3：客户名 / `org-*` ID 一致。
- **API 密钥** §4.8：`orgId` 字段一致。
- **用户与认证** §4.11：终端用户组织名与租户区分（页内文案已说明）。

## 5. 接 API 后

替换 `mock` 与租户 `localStorage`；组织/合同/发票/授信接各自服务；工作台「合同到期」待办与合同表字段对齐。

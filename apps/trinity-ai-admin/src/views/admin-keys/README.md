# admin-keys · API 密钥（P7 · §4.8）

## 1. 一句话

运营后台 **平台上游密钥** 与 **用户 API Key（运营视角）** 的检索、状态管理、限额调整与操作审计；原型为 mock + `localStorage`，**不含真实密钥串**。与门户租户侧「用户自助密钥」分轨。后端 V1 能力摘录见本文 **§8**（真源：[`doc/创建后端需实现页面与功能.md`](../../../doc/创建后端需实现页面与功能.md)）。

### 1.1 产品功能（通俗说明）

> 给产品、运营、评审阅读；字段与接口见下文 §5、§8。

**这个模块是干什么的**  
运营在后台管两类「API 账号」（密钥）：**平台密钥**（公司对接上游大模型用的）、**用户密钥**（终端客户在 Workspace 里用来调我们网关的）。可以查列表、改状态、调限额，并留下「谁动了哪把 Key」的记录。

| 子菜单 | 一句话 | 典型场景 |
|--------|--------|----------|
| **平台密钥** | 管上游供应商的 Key，能新建/改/删、冻结、吊销，敏感时二次验证看明文。 | 换供应商 Key、风控暂停某条上游、查绑定了几条路由。 |
| **用户密钥** | 按用户/Workspace 查客户的 API Key，能调 RPM/日限额、冻结、撤销。 | 客户投诉被限流、协助调高配额、违规 Key 先冻再撤。 |
| **审计轨迹** | **不是**调用次数日志，而是**后台对密钥做过什么**的清单。 | 查「谁把某 Key 冻了、备注里写的冻结原因是什么」。 |

**审计轨迹记什么（举例）**  
在平台或用户密钥页点了冻结、解冻、撤销、改限额、看明文等，会在这里多一行：**时间、操作人、动作、哪把密钥、说明**（说明里可含冻结原因、工单号等弹窗里填的备注）。正式环境应与「系统与合规 → 操作审计」写入同一张审计库；本 Tab 是**只围绕 API 密钥**筛出来的查询视图，方便围着某把 Key 查。

**不要和这些搞混**

| 页面 | 区别 |
|------|------|
| 用量与计费 → 用量日志 | 记录 **API 被调用了多少次**（请求侧）。 |
| 系统与合规 → 操作审计 | **全后台**写操作（含模型、用户、密钥等），字段更全（IP、改前改后等）。 |
| 本模块 → 审计轨迹 | 只列 **密钥相关** 的后台操作，查起来更省事。 |

侧栏二级菜单旁的一句摘要见 `admin-shell/moduleSecondaryPages.ts`（`tai-admin-keys`）。

## 2. 路由

| path | name | 入口 | 说明 |
|------|------|------|------|
| `keys/platform-keys` | `tai-admin-keys-platform-keys` | `KeysPage.vue` | **平台密钥**（默认） |
| `keys/user-keys` | `tai-admin-keys-user-keys` | `KeysPage.vue` | **用户密钥** |
| `keys/audit` | `tai-admin-keys-audit` | `KeysPage.vue` | **审计轨迹** |
| `keys` | `tai-admin-keys` | redirect | → `tai-admin-keys-platform-keys` |

**兼容重定向**（`trinityAdminRoutes.ts`）：

| 旧 path / name | 目标 |
|----------------|------|
| `keys/list`、`keys/search`、`keys/detail`、`keys/freeze` | `tai-admin-keys-platform-keys` |
| `tai-admin-keys-list` | `tai-admin-keys-platform-keys` |
| `keys/risk` | `tai-admin-risk-rules`（风控规则已独立模块） |

侧栏二级定义真源：`admin-shell/moduleSecondaryPages.ts` → `tai-admin-keys`。

## 3. 入口与五件套

| 文件 | 职责 |
|------|------|
| `KeysPage.vue` | 单入口；`route.meta.stubSecondaryId` 切换三个子面板（`platform-keys` / `user-keys` / `audit`） |
| `keys.css` | 列表、徽章、详情弹窗、危险操作条 |
| `keysInteractions.ts` | `localStorage` 读写键名、`document.body.or-modal-open` 弹层锁 |
| `mock.ts` | `PlatformKeyRow`、`UserKeyRow`、`KeyAuditRow` 种子数据 |
| `README.md` | 本说明 |

交付规范：[`docs/Trinity原型模块目录与交付规范.md`](../../../../docs/Trinity原型模块目录与交付规范.md)  
模块总览：[`docs/02-后台运营管理系统设计/后台原型总览.md`](../../../../docs/02-后台运营管理系统设计/后台原型总览.md)

## 4. 依赖样式与列表规范

**运营后台若依式列表真源**（本模块为三表参考实现）：[`docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md`](../../../../docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md)

- 全局：`src/styles/admin-theme.css`、`admin-page.css`、`admin-ruoyi.css`、`admin-element-plus.css`
- 本模块：`keys.css`
- 共享组件：`AdminListQuery`、`AdminDateRangePicker`（审计）、`AdminTablePagination`、`AdminDialog`、`AdminExportCsvButton`

## 5. 子面板与原型能力

### 5.1 平台密钥（`platform-keys`）— 对齐后端 §4.2.3

| 能力 | 原型 | 后端 V1 |
|------|------|---------|
| 列表：掩码指纹、客户/项目、创建人、状态 | ✅ `fingerprintPrefix` 脱敏 | `platform_api_key` 掩码字段 |
| 到期、用途说明、绑定路由数 | ✅ 列展示 | 校验：须有到期策略、非空用途 |
| 最近调用摘要（时间/模型/地域） | ✅ mock | 聚合 `usage_event` 或网关日志 |
| 检索 / 按客户组织、**状态**筛选 | ✅ | 分页 + 筛选 API |
| 详情：到期、用途、绑定数 → `models/bindings` | ✅ | GET 单条 |
| 冻结 / 解冻 / 吊销 / 删除 + 二次确认 | ✅ 写 `localStorage` + 审计追加 | 状态机 API |
| **明文查看**（credential gate） | ✅ 二次口令 → 弹层展示 mock 明文 + 审计 | `verify-credential-password` → gate token → 明文接口 |
| 新增 / 编辑 / 删除平台密钥 | ✅ 表单（用途、到期必填） | POST/PATCH/DELETE `/v1/admin/platform-api-keys` |
| RBAC 按钮占位 | ✅ `KEYS_PROTOTYPE_PERMISSIONS` | `platform_key:write` / `reveal_secret` |

**原型状态枚举**：`正常` · `已冻结` · `已吊销`（吊销不可恢复）。

### 5.2 用户密钥（`user-keys`）— 对齐后端 §4.3.3

| 能力 | 原型 | 后端 V1 |
|------|------|---------|
| 按用户、workspace、名称检索 | ✅ | `/v1/admin/api-keys` 查询 |
| 列表：指纹、RPM、日 Token 顶、**窗口重置**、**过期**、策略版本、状态 | ✅ | `user_api_key` + 策略表 |
| **限额抽屉**（RPM、日 Token 顶、窗口重置） | ✅ 本地持久化 + 审计 | 修改限额、重置窗口 |
| 冻结 / 解冻 + 二次确认 | ✅ 行内 / 详情 + 审计 | 运营侧暂停调用（与平台密钥同类状态机） |
| 撤销 + 二次确认 | ✅ `user-keys` 行内 + 审计 | 撤销 API |

**原型状态枚举**：`正常` · `已冻结` · `已撤销`（撤销不可恢复）。

与 **门户 Account 控制台** 用户自助创建密钥的 UX 可能不一致；运营页侧重查询与策略干预。

### 5.3 审计轨迹（`audit`）

**产品含义**：后台对 API 密钥的写操作留痕查询（谁、何时、对哪把 Key、做了什么、原因/备注）。详见 **§1.1**。

| 能力 | 原型 | 后端 V1 |
|------|------|---------|
| 按时间范围、动作类型筛选 | ✅ | 后台审计 / 密钥域操作日志 |
| 字段：时间、操作人、密钥、动作、详情 | ✅ | 写入 `admin_audit_log`（全站写操作审计） |
| 导出 CSV | ✅ `AdminExportCsvButton` + 追加「导出审计」行 | 走导出审批（§4.13） |

平台 / 用户密钥上的冻结、解冻、吊销/撤销、调整限额、查看明文、新建/编辑等会 **追加** 到本地审计表（示意）；工程期与 `system/audit-log` 同源、按模块筛选即可。

## 6. 数据与交互

### 6.1 `mock.ts`

- `KEY_PANEL_ORDER`：`platform-keys` | `user-keys` | `audit`
- `DEFAULT_PLATFORM_KEYS`、`DEFAULT_USER_KEYS`、`DEFAULT_KEY_AUDIT_ROWS`
- 类型：`PlatformKeyRow`、`UserKeyRow`、`KeyAuditRow`

### 6.2 `keysInteractions.ts` · localStorage 键

| 键名 | 用途 |
|------|------|
| `trinity-ai-admin:platform-keys-rows` | 平台密钥列表 JSON |
| `trinity-ai-admin:platform-keys-search-q` | 列表检索词 |
| `trinity-ai-admin:platform-keys-filter-org` | 按客户组织筛选 |
| `trinity-ai-admin:platform-keys-selected-id` | 上次选中行（预留） |
| `trinity-ai-admin:platform-keys-audit-rows` | 审计轨迹 JSON |
| `trinity-ai-admin:user-keys-rows` | 用户密钥列表 JSON |

`KEYS_PROTOTYPE_PERMISSIONS`（`mock.ts`）：原型全开 `canWrite` / `canRevealSecret`；工程期接 RBAC。

## 7. 结构约定

- **单入口** `KeysPage.vue`，三个子面板用 `v-show` + 注释分区；**不** 在 `admin-keys/` 下再拆子 `.vue`。
- 模板分区：`<!-- 平台密钥 -->`、`<!-- 用户密钥 -->`、`<!-- 审计轨迹 -->`、危险操作 / gate / 限额弹窗。

## 8. 后端需求对照（摘自 `doc/创建后端需实现页面与功能.md`）

> 工程实现时以该文档为准；本节便于原型评审与前后端对齐。

### 8.1 已有接口（可复用）

| 接口 | 用途 |
|------|------|
| `POST /v1/admin/auth/verify-credential-password` | 平台密钥明文查看前的二次验证 → 签发 gate token |
| `/v1/admin/platform-api-keys` | 平台密钥 CRUD、列表（含掩码） |
| `/v1/admin/api-keys` | 用户 API Key 运营查询与策略变更 |

### 8.2 涉及数据表

| 表 | 关联子页 |
|----|----------|
| `platform_api_key` | 平台密钥 |
| `model_route_api_key_binding` | 绑定路由数（详情/跳转 `models/bindings`） |
| `user_api_key` | 用户密钥 |
| （策略窗口使用表） | 用户密钥限额/窗口 |
| `admin_audit_log` | 冻结/吊销/明文查看等写操作审计 |

### 8.3 权限点（RBAC）

| 权限 key | 说明 |
|----------|------|
| `platform_key:write` | 平台密钥增删改、冻结/吊销 |
| `platform_key:reveal_secret` | **高危**：查看平台密钥明文（需 gate） |

目录定义：`src/utils/adminPermissions.ts`；角色勾选见 `admin-access` 角色弹窗。

### 8.4 V1 验收要点（与本模块相关）

1. **基础数据可维护**：平台密钥可维护，绑定关系在「模型管理 → 路由绑定」维护。
2. **日志可查询**：用户密钥属运营查询域，与用量日志（`billing/usage`）通过 API Key 名称关联。
3. **写操作可审计**：冻结/吊销/明文查看等须落 `admin_audit_log`（含 before/after，若改配置）。

### 8.5 原型覆盖度（附录摘要）

| 文档章节 | 原型路由 | 状态 |
|----------|----------|------|
| §4.2.3 平台密钥 | `keys/platform-keys` | P1+P2 已对齐（mock + localStorage） |
| §4.3.3 用户 API Key | `keys/user-keys` | P1+P2 已对齐（mock + localStorage） |
| 路由绑定 | `models/bindings` | 独立模块，与本模块 `bindingCount` 呼应 |

**工程期未在原型实现**：真实 gate token、RBAC 按钮级禁用、分页接 API、导出审批流。

## 9. 接 API / 正式开发时要动哪些文件

| 文件 | 改动 |
|------|------|
| `mock.ts` | 改为类型 + 空壳，或删除改由 API 类型生成 |
| `keysInteractions.ts` | 列表分页、gate 流程、撤销/限额 API 调用；去掉列表 `localStorage` 或仅保留 UI 偏好 |
| `KeysPage.vue` | 接 loading/empty/error；平台密钥表单（新增/编辑）；用户密钥撤销；权限 `v-if` |
| `keys.css` | 按接口态补样式即可 |
| 新建 `keysApi.ts`（可选） | 封装 `platform-api-keys`、`api-keys` 请求 |

建议与 **`models/bindings`**、**`system/audit-log`** 联调跳转（绑定数、操作审计）。

## 10. 已知缺口与风险（工程期）

- 未接真实 API / 分页；`KEYS_PROTOTYPE_PERMISSIONS` 写死为全开。
- 明文 gate 为 mock 固定串，未接 `verify-credential-password` 与 gate token。
- 审计导出未接 §4.13 导出审批（仅占位 alert + 审计行）。
- 密钥材料不入库、不入 mock 注释；禁止把真实 sk- 写入仓库。

## 11. 参考

| 文档 | 路径 |
|------|------|
| 后台原型总览 | `docs/02-后台运营管理系统设计/后台原型总览.md` |
| 创建后端需实现页面与功能 | `apps/trinity-ai-admin/doc/创建后端需实现页面与功能.md` §4.2.3、§4.3.3、§6、§7.1、附录 |
| 详设 IA | `docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` §4.8 |
| API Key 限额设计（若存在） | `docs/详细代码设计/扣款相关设计/APIKEY限额与过期设计.md` |

## 12. 二次开发补充

| 补充项 | 路由 / 入口 | 涉及文件 | 数据 / 交互 | 对齐日期 / 备注 |
|--------|-------------|----------|-------------|-----------------|
| 平台/用户密钥拆分 | `keys/platform-keys`、`keys/user-keys` | `mock.ts` `KEY_PANEL_ORDER`；`KeysPage.vue` | 子面板 `v-show` | 2026-05-19 · 对齐后端 doc §4.2.3 / §4.3.3 |
| 平台新建/编辑/删除 | `platform-keys` | `KeysPage.vue` | `platformFormOpen`；用途/到期校验 | 2026-05-19 · P1 |
| gate 明文弹窗 | `platform-keys` | `KeysPage.vue` | `gateRevealed` + mock 明文 + 审计 | 2026-05-19 · 待接 gate API |
| 用户撤销 / 限额审计 | `user-keys` | `KeysPage.vue` | `userRevokeOpen` / `saveUserQuota` | 2026-05-19 · P1/P2 |
| 审计导出 | `audit` | `AdminExportCsvButton` | `@export` 追加审计行 | 2026-05-19 · P2 |
| 旧路由兼容 | `tai-admin-keys-list` 等 | `trinityAdminRoutes.ts` | redirect | 2026-05-19 |

---

*对齐日期：2026-05-19 · 规范 [`Trinity原型模块目录与交付规范.md`](../../../../docs/Trinity原型模块目录与交付规范.md) v1.11*

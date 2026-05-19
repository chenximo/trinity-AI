# admin-risk · 风控（P1b · §4.4.2 / §4.4.3）

## 1. 一句话

运营后台 **IP 限流与拉黑** 的规则配置与处置追溯；原型为 mock + `localStorage`（规则列表）。**运行态观测**（QPS、错误率、趋势等）在侧栏 **「实时大盘」**（`admin-ops/`），与本模块分轨。后端 V1 能力见 [`doc/创建后端需实现页面与功能.md`](../../../doc/创建后端需实现页面与功能.md) **§4.4.2、§4.4.3**。

### 1.1 产品功能（通俗说明）

> 给产品、运营、评审阅读；字段见 §5。

**这个模块是干什么的**  
当怀疑 **刷接口、攻击、滥用** 时，运营/风控在这里：**定规则**（多少请求限流、多少请求拉黑、持续多久）并 **查已经拦了谁**（哪条 IP、限流还是拉黑、命中哪条规则）。

| 子菜单 | 一句话 | 典型场景 |
|--------|--------|----------|
| **风控规则** | 配全局限流/拉黑：时间窗口、两个阈值、TTL、启停。 | 大促前收紧阈值；某条规则临时停用。 |
| **风控动作日志** | 查 **已执行** 的限流/拉黑记录（IP、动作、时间）。 | 客户投诉「被限了」；核对某 IP 是否仍在拉黑窗内。 |

**不要和这些搞混**

| 页面 | 区别 |
|------|------|
| **实时大盘** | 看 QPS、错误率、趋势、Top —— **观测**，不在这里改限流规则。 |
| 用量与计费 → 用量日志 | 单条 **API 调用** 明细。 |
| 系统与合规 → 操作审计 | **后台账号** 对系统的写操作。 |
| 用户与认证 → 黑名单 | 多为 **登录/账号** 侧；本模块偏 **调用侧 IP** 策略。 |
| API 密钥 → 审计轨迹 | **后台对 Key** 的冻结/撤销等，不是 IP 限流。 |

侧栏模块名 **「风控」**（原「监控与风控」易与大盘混淆，已改名）；二级摘要见 `admin-shell/moduleSecondaryPages.ts`（`tai-admin-risk`）。

## 2. 路由

| path | name | 入口 | 说明 |
|------|------|------|------|
| `risk/rules` | `tai-admin-risk-rules` | `RiskPage.vue` | **风控规则**（默认） |
| `risk/action-logs` | `tai-admin-risk-action-logs` | `RiskPage.vue` | **风控动作日志** |
| `risk` | `tai-admin-risk` | redirect | → `tai-admin-risk-rules` |

**兼容重定向**（`trinityAdminRoutes.ts`）：

| 旧 path | 目标 |
|---------|------|
| `keys/risk` | `tai-admin-risk-rules`（原密钥模块下的风控入口） |

门户内前缀示例：`/trinity-ai-admin/risk/rules`。

## 3. 五件套

| 文件 | 职责 |
|------|------|
| `RiskPage.vue` | 单入口；`route.meta.stubSecondaryId` 切换 `rules` / `action-logs` |
| `risk.css` | 分工说明条、状态徽章、表单宽度 |
| `riskInteractions.ts` | 规则 `localStorage`、筛选条件持久化、弹层 `or-modal-open` |
| `mock.ts` | `RiskRuleRow`、`RiskActionLogRow`、枚举中文标签 |
| `README.md` | 本说明 |

交付规范：[`docs/Trinity原型模块目录与交付规范.md`](../../../../docs/Trinity原型模块目录与交付规范.md)  
模块总览：[`doc/后台原型总览.md`](../../../doc/后台原型总览.md)

## 4. 依赖样式与列表规范

列表页遵循 **[运营后台-若依式列表规范.md](../../../doc/运营后台-若依式列表规范.md)**（参考实现：`admin-keys/KeysPage.vue`）。

- 全局：`src/styles/admin-theme.css`、`admin-page.css`、`admin-ruoyi.css`、`admin-element-plus.css`
- 本模块：`risk.css`（徽章等增量）
- 共享组件：`AdminSectionHead`、`AdminListQuery`、`AdminDateRangePicker`、`AdminTablePagination`、`AdminDialog`、`AdminExportCsvButton`

## 5. 子面板与原型能力

### 5.1 风控规则（`rules`）— 对齐后端 §4.4.2

| 能力 | 原型 | 后端 V1 |
|------|------|---------|
| 列表：窗口、限流/拉黑阈值、TTL、启停 | ✅ | `risk_rule` |
| 校验：限流阈值 ≤ 拉黑阈值 | ✅ 表单 + 保存前 | 服务端校验 |
| 检索 / 按启停筛选 | ✅ `AdminListQuery` | 分页 API |
| 新建 / 编辑规则 | ✅ 弹窗 + `localStorage` | POST/PATCH |
| 行内启停开关 | ✅ `el-switch` | PATCH enabled |
| 链「实时大盘」 | ✅ 页头描述 | — |

### 5.2 风控动作日志（`action-logs`）— 对齐后端 §4.4.3

| 能力 | 原型 | 后端 V1 |
|------|------|---------|
| 列表：IP、动作、范围、命中次数、规则、起止时间 | ✅ | `risk_ip_action` |
| 动作/范围中文展示 | ✅ `RISK_*_LABEL` | 枚举映射 |
| 规则 ID → 规则名称 | ✅ `riskRuleLabelById` | JOIN `risk_rule` |
| 检索 + 动作筛选 + 时间范围 | ✅ | 筛选 API |
| 导出 CSV 占位 | ✅ `AdminExportCsvButton` | 异步导出（二期） |

**动作枚举**：`rate_limit`（限流）· `blacklist`（拉黑）。  
**范围枚举**：`global` · `model` · `key`。

## 6. mock 与 localStorage

| 键 / 常量 | 说明 |
|-----------|------|
| `DEFAULT_RISK_RULES` | 规则种子（含一条停用示例） |
| `DEFAULT_RISK_ACTION_LOGS` | 动作日志种子 |
| `trinity-ai-admin:risk-rules-rows` | 规则列表持久化（`riskInteractions.ts`） |
| `trinity-ai-admin:risk-rules-search-q` 等 | 各 Tab 筛选条件持久化 |

动作日志工程期只读接 API，原型未做 `localStorage` 写入。

## 7. 权限（工程期）

| 权限点 | 用途 |
|--------|------|
| `risk_rule:write` | 新建/编辑/启停规则 |
| `risk_log:read` | 查看动作日志 |

角色模板见 `utils/adminPermissions.ts`（如 `tpl-risk-viewer`）。

## 8. 接 API 后

| 文件 | 改动 |
|------|------|
| `mock.ts` | 类型保留或改为 OpenAPI 生成 |
| `RiskPage.vue` | `onMounted` + 保存/启停调 API；动作日志分页 |
| `riskInteractions.ts` | 可仅保留 UI 筛选持久化，规则改服务端为准 |

## 9. 已知缺口

- 规则变更 **历史** 未做（详设可选）；仅 `updatedAt` 示意。
- 动作日志为静态 mock，未接分页 API。
- 告警阈值（详设 §4.2 告警规则）不在本模块，大盘亦不在此配置。

## 10. 参考

| 文档 | 路径 |
|------|------|
| 创建后端需实现 | `doc/创建后端需实现页面与功能.md` §4.4.2、§4.4.3 |
| 实时大盘 | `admin-ops/README.md` |
| 后台原型总览 | `doc/后台原型总览.md` §2.3 |

---

## 11. 二次开发登记

| 补充项 | 路由 | 备注 |
|--------|------|------|
| 侧栏改名「风控」 | — | `adminNavTree.ts` · 2026-05-19 |
| 五件套补全 | `risk/*` | README + `riskInteractions.ts` |
| 页头分工说明 + 链大盘 | `rules` / `action-logs` | `RiskPage.vue` |
| 规则 localStorage + 行内启停 | `rules` | `riskInteractions.ts` |

---

*对齐日期：2026-05-19 · 规范 [`Trinity原型模块目录与交付规范.md`](../../../../docs/Trinity原型模块目录与交付规范.md)*

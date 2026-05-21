# admin-ops · 实时大盘（P1 · §4.4.1）

## 1. 一句话

运营后台 **系统运行健康** 专页：值班 KPI、趋势与错误构成、模型调用占比、五类监控时序、Top 榜与供应商健康；原型为 **mock + 定时刷新示意**，工程期接 `/v1/admin/monitor/*` 及用量聚合。与 **工作台** 监控摘要互补、不重复展开。后端能力真源：[`doc/创建后端需实现页面与功能.md`](../../../doc/创建后端需实现页面与功能.md) **§4.4.1**；产品 IA 见 `docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` **§4.2**。

### 1.1 产品功能（通俗说明）

> 给产品、运营、评审阅读；字段与 mock 键名见 §5。

**这个页面是干什么的**  
值班/运营打开 **实时大盘**，在选定时间窗（2 / 6 / 24h）内判断：**流量大不大、错得多不多、慢不慢、上游线路是否正常**。不是查某一条 API 请求（→ **用量与计费 → 用量日志**），也不是改限流规则（→ **风控 → 风控规则**）。

**和工作台的区别**

| | **工作台** §4.1 | **实时大盘** 本页 |
|--|-----------------|-------------------|
| 目的 | 登录首页，10 秒内「有没有事」 | 专职盯监控，看得更全、窗更长 |
| 时间窗 | 固定短窗（近 5m / 15m 示意） | 可选 2 / 6 / 24h，15s 刷新 |
| 独有内容 | 待办、运营摘要、快捷入口、运行提醒 | QPS/P99、7 日趋势、模型占比、错误构成、Top 榜、供应商健康 |
| 重叠部分 | 五类监控 **当前值** 摘要卡 | 五类监控 **同窗时序**（可折叠，注明与工作台同源） |

页顶有 **分工说明** 条，页头描述链 **工作台**（`tai-admin-dashboard`）。

**页面上能看到什么（自上而下 · 原型已挂 UI）**

| 顺序 | 区域 | 看什么 | 典型用法 |
|------|------|--------|----------|
| — | **工具栏** | 时间窗、刷新、stale、链工作台 | 切换 2h/24h；缓存降级黄条 |
| — | **分工说明** | 与工作台差异（只读） | 新同学分清两页职责 |
| ① | **值班 KPI** | QPS、错误率、P99 | 当前窗是否异常 |
| ② | **趋势 + 错误分布** | 近 7 日调用折线、近 24h 错误码饼图 | 走势与 429/5xx 构成 |
| ③ | **模型调用占比** | 小饼图 + 表（请求 %、Token %、调用量） | 流量集中在哪些模型；Token 显著高于请求时标黄 |
| ④ | **五类监控时序** | SSE / Token / Spend / Active / Stability 迷你柱 | 与工作台同源；默认展开，可 `<details>` 折叠 |
| ⑤ | **异常与根因** | 错误 Top、延迟 Top（并排表） | 定位路由/线路/维度 |
| ⑥ | **供应商健康** | 成功率、P95、容量、状态 | 是否切备路；降级行可跳线路 |
| 顶 | **维护预告** | 计划窗口、动作、负责人 | 值班知晓可能抖动 |

**下钻（原型占位，工程期接路由 query）**

| 从大盘点击 | 跳到哪里 |
|------------|----------|
| 页头 / 描述「工作台」 | `tai-admin-dashboard` |
| 错误 Top「用量」 | `billing/usage`（`status` = 错误码） |
| 「按模型查用量」 | `billing/usage` |
| 供应商「供应商管理」 | `suppliers/list` |
| 降级行「线路」 | `models/lines` |
| 工具栏「风控规则」 | `risk/rules`（侧栏模块 **风控**） |

详设里另有独立二级页（错误分析、告警、维护配置等）；**原型 v1 合并进单页分区**，旧 path `ops/errors` 等重定向至 `ops/live`。

---

## 2. 页面信息架构（单页分区）

`OpsPage.vue` 单入口，**不**拆多个 `*Page.vue`；分区用 HTML 注释标注（规范五件套）。

```
┌─ 页顶：维护预告（el-alert，有则显示）──────────────────────┐
├─ AdminSectionHead：时间窗 · 刷新 · stale · 链工作台 ──────┤
├─ .ops-page__panel > .ops-page__scroll（唯一纵向滚动区）───┤
│  ├─ 分工说明（ops-page__context）──────────────────────────│
│  ├─ ① 值班 KPI（三卡 + 图标）────────────────────────────│
│  ├─ ② 趋势 | 错误码分布（双列 el-card）──────────────────│
│  ├─ ③ 模型调用占比（lean：小饼 + 表，Token is-high）──────│
│  ├─ ④ 五类监控时序（<details> 可折叠 + 同源说明）──────────│
│  ├─ 「异常与根因」分组标题 ────────────────────────────────│
│  ├─ ⑤ 错误 Top | 延迟 Top（双列表）──────────────────────│
│  └─ ⑥ 供应商健康（全宽表）────────────────────────────────│
└──────────────────────────────────────────────────────────┘
```

**布局约定（2026-05-19 定稿）**

- 信息顺序按 **值班路径**：KPI → 趋势/错误 → 模型 → 五类时序 → Top → 供应商。
- 壳层 `admin-shell__main` 子节点 `overflow:hidden`；本页用 `.ops-page__panel` + `.ops-page__scroll` 滚动；多块 `.admin-ep-card` 须 `flex: 0 0 auto`，避免若依把多卡挤进一屏。
- 模型区 **去掉重复图例**：表内色点 + 请求占比条；`tokenPct - pct ≥ 8` 时 `.ops-page__token-pct.is-high` 标黄。
- 五类监控与工作台监控卡 **数据同源**，大盘侧重同窗 **时序柱**；默认可折叠以缩短首屏。

**实现状态（UI · mock）**

| 分区 | mock | UI（OpsPage） |
|------|------|---------------|
| 分工说明 | — | ✅ |
| ① KPI | `OPS_SUMMARY` | ✅ |
| ② 趋势/分布 | `OPS_CALL_TREND_7D`、`OPS_ERROR_DIST_24H` | ✅ |
| ③ 模型占比 | `OPS_MODEL_CALL_SHARE` | ✅ lean |
| ④ 五图 | `OPS_MONITOR_CHARTS` | ✅ `<details>` |
| ⑤ Top | `OPS_ERROR_TOP`、`OPS_LATENCY_TOP` | ✅ |
| ⑥ 健康 | `OPS_SUPPLIER_HEALTH` | ✅ |
| 维护 / stale | `OPS_MAINTENANCE`、`stale` | ✅ `el-alert` |

`OPS_ALERT_RULES` 留给 **风控规则** 模块，大盘不展示规则配置，工具栏可链「风控规则」。

---

## 3. 路由

| path | name | 说明 |
|------|------|------|
| `ops/live` | `tai-admin-ops-live` | **实时大盘**（侧栏单入口） |
| `ops` | `tai-admin-ops` | redirect → `live` |
| `ops/errors` · `health` · `alerts` · `maintenance` | — | 旧书签 **重定向** → `live` |

门户内前缀：`/trinity-ai-admin/ops/live`。

侧栏：`adminNavTree.ts` 为 **single** 项「实时大盘」，顺序为 **工作台 → 实时大盘 → API 密钥 → …**（非折叠子菜单）。

---

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `OpsPage.vue` | 整页 + 各监控分区（HTML 注释 ①～⑥） |
| `ops.css` | 滚动区、KPI、双列、lean 模型表、`<details>` 五图、表格辅助类 |
| `opsInteractions.ts` | Tab 状态 `sessionStorage`（当前仅 `live`，预留多 Tab；**OpsPage 未引用**） |
| `mock.ts` | 全部分区假数据与窗口常量 |
| `README.md` | 本说明 |

交付规范：[`docs/Trinity原型模块目录与交付规范.md`](../../../../docs/Trinity原型模块目录与交付规范.md)  
模块总览：[`docs/02-后台运营管理系统设计/后台原型总览.md`](../../../../docs/02-后台运营管理系统设计/后台原型总览.md)

---

## 5. mock 数据对照

### 5.1 窗口与刷新

| 常量 | 含义 |
|------|------|
| `OPS_MONITOR_WINDOW.defaultHours` | 默认 2h |
| `OPS_MONITOR_WINDOW.maxHours` | 最大 24h |
| `OPS_MONITOR_WINDOW.refreshSec` | 自动刷新间隔 15s（原型仅更新时间戳） |

### 5.2 分区数据（与页面顺序一致）

| 常量 | 分区 | 主要字段 |
|------|------|----------|
| `OPS_SUMMARY` | ① KPI | `qps`、`errRate`、`p99`、`updatedAt`、`stale` |
| `OPS_CALL_TREND_7D` | ② 趋势 | `title`、`points[]`、`labels[]` |
| `OPS_ERROR_DIST_24H` | ② 分布 | `segments[]`：`label`、`pct`、`color` |
| `OPS_MODEL_CALL_SHARE` | ③ 模型占比 | `segments[]`：`model`、`pct`、`tokenPct`、`calls`、`color` |
| `OPS_MONITOR_CHARTS` | ④ 五图 | `id`、`title`、`series[]`、`last`、`unit` |
| `OPS_ERROR_TOP` | ⑤ 错误 Top | `code`、`route`、`line`、`count` |
| `OPS_LATENCY_TOP` | ⑤ 延迟 Top | `dim`、`p95`、`note` |
| `OPS_SUPPLIER_HEALTH` | ⑥ 健康 | `name`、`line`、`ok`、`p95`、`cap`、`status` |
| `OPS_MAINTENANCE` | 维护条 | `title`、`window`、`action`、`owner` |
| `OPS_ALERT_RULES` | （不在大盘 UI） | 供 `admin-risk` 复用 |
| `OPS_SERIES_POINTS` | 预留 | 细粒度时序，接 API 时可替换五图 |

工程期：键名可映射为接口 DTO；**禁止**在 mock 中写入真实密钥或客户隐私。

---

## 6. 与后端文档 / 其它模块

### 6.1 `创建后端需实现页面与功能.md`

| 章节 | 与本模块关系 |
|------|----------------|
| **§4.1 总览** | 工作台：短窗摘要 + 五类监控当前值 + 待办；与本页数据同源 |
| **§4.4.1 实时监控** | V1 验收：五图 + 2h 窗 + 15s 刷新 + stale |
| **§4.4.2 / §4.4.3** | 风控规则 / 动作日志；大盘只 **跳转** |
| **§4.3.1 用量日志** | 错误 Top、模型占比下钻目标 |
| **§9 验收** | 五类监控可视化 + 时间窗与刷新 |

本文 **§2 分区 ①～⑥** 为 §4.4.1 之上的 **原型增广**（详设 §4.2）；后端可按 **`monitor_sse_sample`、`usage_event`** 及聚合接口分期实现，文档与 mock 已对齐字段。

### 6.2 建议接口（文档约定，后台可分期实现）

| 接口（示意） | 分区 |
|--------------|------|
| `GET /v1/admin/monitor/summary?windowHours=` | ① KPI + stale |
| `GET /v1/admin/monitor/call-trend?days=7` | ② 折线 |
| `GET /v1/admin/monitor/error-distribution?windowHours=` | ② 饼图 |
| `GET /v1/admin/monitor/model-share?windowHours=` | ③ 模型占比 |
| `GET /v1/admin/monitor/series?metric=&windowHours=` | ④ 五图时序 |
| `GET /v1/admin/monitor/errors/top?windowHours=` | ⑤ 错误 Top |
| `GET /v1/admin/monitor/latency/top?windowHours=` | ⑤ 延迟 Top |
| `GET /v1/admin/monitor/suppliers/health` | ⑥ 健康表 |
| `GET /v1/admin/monitor/maintenance/upcoming` | 维护条 |

现有 **`/v1/admin/monitor/*`** 五通道可保留；summary / 聚合层为便利接口。

### 6.3 权限

- 读：`monitor:read`（见后端 doc §6.1）

---

## 7. 分阶段（产品 / 原型 / 后端）

| 阶段 | 范围 | 状态 |
|------|------|------|
| **A · V1 必交付** | 五图、时间窗、刷新、stale | mock ✅ · UI ✅（④ 可折叠） |
| **B · 原型增广** | KPI、趋势、分布、模型占比、Top、健康、维护 | mock ✅ · UI ✅（2026-05-19 定稿） |
| **C · V2** | 告警摘要独立页、强下钻、维护配置、ECharts 真时序 | 待排期 |

---

## 8. 接 API 后

| 文件 | 改动 |
|------|------|
| `mock.ts` | 保留类型或改为 OpenAPI 生成类型 |
| `OpsPage.vue` | `onMounted` + 定时器拉各分区；loading/error；`windowHours` 驱动全页 |
| `ops.css` | 接 ECharts 等时微调图表容器高度 |
| `opsApi.ts`（可选） | 封装 monitor 请求 |

刷新：15s 轮询应 **重拉指标**，而非仅改本地时间字符串。

---

## 9. 已知缺口（工程期）

- 图表为 **CSS 柱 / SVG 折线 / conic 饼** 占位，未接 ECharts 或真实时序 API。
- `opsInteractions.ts` 的 Tab 读写 **OpsPage 未引用**（单 Tab 可保留预留）。
- `stale` 为 mock 开关，非真实缓存降级。
- 时间窗切换仅更新 `windowHours` 与刷新时间，**未**按窗重算 mock 序列（接 API 后一并实现）。

---

## 10. 参考

| 文档 | 路径 |
|------|------|
| 创建后端需实现页面与功能 | `apps/trinity-ai-admin/doc/创建后端需实现页面与功能.md` §4.1、§4.4.1、§9 |
| 后台原型总览 | `docs/02-后台运营管理系统设计/后台原型总览.md` §2.2 |
| 详设 IA | `docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` §4.2 |
| 工作台 | `admin-dashboard/DashboardPage.vue`（短窗摘要，不改本页布局） |

---

## 11. 二次开发登记

| 补充项 | 路由 | 涉及文件 | 备注 |
|--------|------|----------|------|
| 单页实时大盘 | `ops/live` | `OpsPage.vue` | 侧栏 single |
| 分区 ①～⑥ mock + UI | `live` | `mock.ts`、`ops.css` | P1 齐全 |
| 模型调用占比 | `live` | `OPS_MODEL_CALL_SHARE` | lean 饼+表 |
| 侧栏顺序 | — | `adminNavTree.ts` | 工作台下、API 密钥上 |
| 旧 ops 子 path 重定向 | `ops/errors` 等 | `trinityAdminRoutes.ts` | → `live` |
| **值班路径版式定稿** | `live` | `OpsPage.vue`、`ops.css` | 2026-05-19：顺序调整、五图折叠、滚动修复、Token 高亮 |

---

*对齐日期：2026-05-19（版式定稿）· 规范 [`Trinity原型模块目录与交付规范.md`](../../../../docs/Trinity原型模块目录与交付规范.md)*

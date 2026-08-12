# 定价系统 · Agent 架构、SOP 与 WorkSession

> **定稿**：2026-08-11（含设计缘起、术语与学习笔记）  
> **读者**：产品 / 定价运营 / 研发 / Agent 平台对接 / **自我学习与述职**  
> **关联真源**：  
> - 场景总机：`.cursor/skills/trinity-official-pricing/workflows/ops-scenario-router.md`  
> - 价审运营 SOP：`价审运营SOP-Admin价格校验.md`  
> - 研发需求：`模型供应与定价运营-研发需求清单.md`  
> - 刊例策略：`刊例策略-V1-V2-国际站优先.md`  
> - Worker 部署：`pricing/worker/DEPLOY.md`  
> - Admin 说明：`TrinityAI-web/apps/admin/src/views/admin-pricing/README.md`

---

## 0. 一句话

**价审「做什么、按什么顺序、何时等人」= SOP；「一次任务怎么可靠跑完、可暂停、可审计」= WorkSession。**  
Trinity 定价域已跑通 **SOP 主链（出包 → 人闸写刊例）**；WorkSession 平台化与 Agent 编排为 **演进层**，不是对现有设计的否定。清单补完后可对接 LinkAI 类智能体平台。

---

## 0.1 设计缘起 · 为什么不是「一开始就做 Agent 长任务」

### 当初的目标（正确且务实）

定价系统最初动机是：**把跟价流程化、方便运营**——机器出包、人看 diff、确认才写线上刊例。  
这是 **业务闭环优先**，不是「先搭通用 WorkSession 平台再填业务」。

### 和「业界人机协同长任务范式」的关系

| | 当初做法 | 业界范式（JD / Agent 平台） |
|--|----------|----------------------------|
| 动机 | 运营可重复、可审计、不误写价 | 同上 + 通用 session / 多 Agent / Eval |
| HITL | Admin 确认单 + confirm | 同构（HITL 拦截点） |
| 会话 | 价审 `taskId` | 全局 WorkSession + checkpoint |
| SOP | Skill + Worker 步骤 | 可加载 DSL / 工作流引擎 |
| 入口 | Admin 表单 | Admin + 可选对话框 |

**结论（写方案 / 述职可用）：**

- **不是认知缺失导致的烂设计**，而是 **MVP → 平台化** 的常见路径。  
- 核心约束（**不确认不改 `/v1/prices`**）一开始就对了；缺的是 **持久化编排、Tool 权限、平台 session** 等增强项。  
- 叙事建议：**「价审已具备 HITL 与任务化；WorkSession / Agent 是增强层，不是补锅。」**

### 常见误区（避免自我否定）

| ❌ 误区 | ✅ 更准确 |
|--------|----------|
| 没做 WorkSession 所以价审错了 | 价审任务表已是 **弱 WorkSession**，主链可用 |
| 必须有聊天框才算 Agent | **Admin 确认单就是 HITL UI**，更适合表格型价审 |
| 必须自建公司级 Session 中台 | 可 **域内 taskId** → 将来 **挂 Agent 平台** |
| 一开始就要 DSL + 多 Agent | 先 **四场景 + API**，再编排 |

---

## 0.2 组件专业命名（用于架构表述）

你们这条链路里，常用“行业化”命名可以写成一套映射表（便于对外沟通）。

| 现网组件 | 推荐专业叫法 | 主要职责 |
|---|---|---|
| Admin（价格校验页） | `HITL Console / Operations UI`（人机协同操作台） | 展示确认单、触发确认写回（HITL 终端） |
| 后端 PriceReview API | `Orchestrator / Backend Controller / Task Manager API` | 创建价审任务、接收/回传 Worker 产物、confirm 写回、审计批次管理 |
| 价审 Worker 服务（pricing/worker） | `Workflow Worker / Job Runner` | 执行 SOP steps：调用 trinity-AI CLI、组装价审包、回传/挂回任务 |
| trinity-AI pricing CLI / npm scripts | `Toolchain / Pipeline Scripts`（工具链/批处理脚本） | 真正运行算价：fetch、upstream、diff、emit 等（真源执行层） |
| 价审包、diff、Excel 产物与写回记录 | `Artifact Store` + `Audit Log Store`（制品库 + 审计库） | 持久化包快照、diff/Excel 对照、写回批次与审计链 |

### Backend / Worker 是一个还是两个？

正常情况下：**Backend 和 Worker 不是同一个服务**，而是“编排器 + 执行器”的两段式分工。

- **Backend（Orchestrator）**：负责任务生命周期与 pause/resume 语义的业务落地（例如创建任务、HITL 前后状态推进、写回 confirm 调用等）。
- **Worker（Job Runner）**：负责按步骤执行具体工具链，产出 `draftPrices + diff` 这类价审中间态/最终包，并把产物回传/挂回任务。

所以当我们说“Backend/Worker 共同承担 durable workflow 的业务闭环”，意思是：**Orchestrator 管状态与编排，Worker 管执行与产物**；它们通常保持分离，而不是合并为一个服务。

---

## 1. 四场景产物（产品真源）

巡检不单独占场景，并入 **①**（只看不写 = 触发后看确认单、不点「确认写价」）。

| # | Router id | 目标产物 | Admin 落点 | 人闸 |
|---|-----------|----------|------------|------|
| **①** | `follow-official-listing` | 价审包 → 写 **`/v1/prices`** | 价格校验 · **官方锚跟刊例** | 确认写价（只上浮闸） |
| **②** | `adjust-upstream-route-rate` | 线路成本/倍率建议 → 保存线路 | 价目预览 / 线路 · **上游路线调价** | 保存线路；**≠** 确认写刊例 |
| **④** | `onboard-model` | 新 SKU 映射 + 首次刊例 + 上架门禁 | 价格校验 · **上新跟价**（B1/B2） | 确认写价 + 模型「价格校验」 |
| **⑤** | `commercial-quote` | L3a / L3b 商务表 | 商务价格 · 生成/下载 | **不写** `/v1/prices` |

### 1.1 判定顺序（Agent / 运营共用）

```text
1. 只要商务对外报价表？           → ⑤
2. 上游挂牌变了，先调进货倍率？   → ②
3. 货架还没有该模型 / 无 map？    → ④（再问 B1/B2）
4. 其余（已上架、跟官方锚刊例）   → ①
```

**① 与 ② 禁止混名**：官方锚跟刊例 ≠ 上游路线调价。  
**B1/B2**：老渠道多一行 → B1；连进货渠道都是新的 → B2（先接供应厂商，再 B1）。

### 1.2 Admin `scenario` 枚举（2026-08-11 起）

| 展示名 | API `scenario` | 说明 |
|--------|----------------|------|
| 官方锚跟刊例 | `官方锚跟刊例` | 含原「巡检」；历史 `官方上游变价` / `巡检跟进` 读入归一 |
| 上新跟价 | `上新跟价` | B1/B2 子类型待产品化 |
| 自定义 | `自定义` | note 写清意图 |

---

## 2. 价审主链（① / ④ 共用 UI，步骤可分化）

### 2.1 人路径（现网已通）

```text
用户点击【触发价审】
    ↓
创建价审任务（taskId / taskCode）          ← 域内「弱 WorkSession」
    ↓
Worker 按场景跑 CLI → 价审包（draftPrices + diff）
    ↓
Admin 展示确认单（中间态：Δ% / 风险标 / 拦一下）
    ↓
人工【确认写价】→ 写 /v1/prices（只上浮闸）
    或 不确认 → 线上不变
    ↓
写回批次可复原；模型价格校验字段回写（上架门禁）
```

### 2.2 Worker 默认步骤（生文 · ①，2026-08-11）

```text
pricing:fetch → pricing:listing:v1v2 → pricing:gen-listing-v2 → pricing:diff:listing-v2 → pricing:emit-review-package
```

口径：V1=线上刊例；V2=`listing-v2_prices-api.json`（国际站优先）；对比=V2 vs V1。`0.65_*` 归档保留。  
按需可加 `pricing:supplier:official:*`（官方锚刷新）。
④ 上新前置：Admin 触发 `上新跟价`（`onboard=auto`）→ Worker 跑 **detect-new**（`pricing:upstream:access` + 读 `output/upstream-access/*.json`）→ 自动判 B1/B2 与渠道 → 再出确认单。显式 `modelIds` 可选，用于 map 覆盖校验。

### 2.3 对照关系（「巡逻看谁」）

中间态 diff 对照的是 **线上刊例** 与 **官方锚 / 转售上游 / 建议草案** 之间的偏差；  
**看完再决定是否写价**，不是单独第三个产品场景。

---

## 3. SOP 与 WorkSession 分层

### 3.1 一句话（职责切分）

**SOP = 价审步骤剧本；WorkSession = 跑这套剧本的运行容器。** 二者缺一不可，但 **可以分期建设**。

| 归属 | 负责什么 | 价审里举例 |
|------|----------|------------|
| **SOP** | 顺序、分支、HITL 拦截点定义 | 触发 → CLI 出包 → 等人 → 写价/终止；scenario ①②④⑤ |
| **WorkSession** | sessionId、checkpoint、暂停/恢复、状态机、跨步审计 | 全局会话 ID；包生成后快照；宕机续跑；suspended 等人 |

**极简类比**

- **SOP** = 导航 **路线规划**（去哪里、走哪条路、在哪要问人）  
- **WorkSession** = 导航 **会话**（保存位置、断网续跑、弹窗确认、轨迹记录）

### 3.2 目标架构（演进 · 人机协同长任务）

```text
用户点击【触发价审】
    ↓
初始化 WorkSession，生成全局唯一会话 ID
    ↓
加载价审业务 SOP 流程定义，启动任务执行流
    ↓
执行步骤：调用 trinity-AI CLI 生成价审数据包
    ↓
WorkSession 触发 Checkpoint，持久化价审包快照与上下文
    ↓
命中 SOP 预设 HITL 拦截点，自动冻结执行流，前端展示确认单
    ↓
人工核对信息，执行【确认写价】操作
    ↓
WorkSession 恢复任务执行，继续执行线上刊例写入逻辑
    ↓
任务正常完成，更新会话终态；基于 SessionID 留存完整审计链路
```

### 3.3 逐步释义（学习用 · 对应 §3.2 每一步）

| 步骤 | 白话 | 你们现在 |
|------|------|----------|
| 触发价审 | 运营点按钮，开始一次跟价 | ✅ Admin |
| 初始化 WorkSession | 开一条「工单」，全局 ID 串日志 | ⚠️ 有 `taskId`，无跨平台 session 服务 |
| 加载 SOP | 读剧本：先 CLI、再等人、再写价 | ⚠️ router + Worker 代码，非独立 DSL |
| 调用 CLI 出包 | 重活：拉线上、对照、diff | ✅ Worker |
| Checkpoint | 存 **包 + 跑到第几步**；崩了不重算 | ⚠️ 包挂任务；续跑未齐 |
| HITL 拦截 | **强制停**，只展示确认单 | ✅ 不确认不写价 |
| 确认写价 | 人点按钮才写刊例 | ✅ confirm API |
| resume 写价 | 从挂起点继续最后一步 | ✅ 逻辑有；未绑统一 resume API |
| 终态 + 审计 | 全链路可查 | ⚠️ 任务表 + 写回批次；缺 session 级视图 |

**Checkpoint vs「包已经存了」**

- **存包**：有 diff 结果。  
- **Checkpoint**：还知道 **流程状态**（下一步是「等人」还是「写价」），引擎可 **续跑** 而不必重跑耗时 CLI。

**WorkSession vs 价审 task**

- **task**：这次价审业务单。  
- **WorkSession**：更底层的 **运行容器**，可跑价审 SOP，也可跑别的 SOP。  
- 演进：先用 **taskId ≈ sessionId**，再接平台。

### 3.4 现网 vs 目标

| 能力 | 现网 | 目标 |
|------|------|------|
| 会话 ID | 价审 `taskId`（域内） | 全局 WorkSession + 与 taskId 映射 |
| SOP | Skill md + Worker env 步骤 | 可加载 DSL/YAML（或 platform 工作流） |
| HITL | Admin 确认单 + confirm API | platform 人工节点 + 同一 confirm API |
| Checkpoint | 价审包 JSON / 任务表 | CLI 完成后快照，宕机不重跑 upstream |
| 状态机 | queued / ready / failed（任务表） | + suspended / completed 统一引擎 |

### 3.5 只有 SOP / 只有 WorkSession 会怎样（踩坑）

| 情况 | 结果 |
|------|------|
| **只有 SOP**（文档 + 硬编码） | 主链能跑；**服务崩在出包后**可能需重跑 CLI；暂停/恢复靠约定 |
| **只有 WorkSession**（空容器） | 不知道要调 CLI、何时等人 → **无业务逻辑** |
| **SOP + WorkSession** | 目标形态：可靠跑完价审长任务 |

---

## 4. WorkSession：底层能力吗？大不大？要不要平台？

### 4.1 是不是底层能力？

**是。** WorkSession 关心 **运行时**：ID、状态、checkpoint、暂停/恢复、审计——**不关心**「价审第一步是不是 fetch」。

### 4.2 工程量三档（怎么选）

| 档位 | 做什么 | 规模 | 建议 |
|------|--------|------|------|
| **A. 域内够用** | 价审 taskId + 状态 + 包挂任务 + confirm | **小** · **现状** | 继续用；不必自责 |
| **B. 定价域增强** | Worker 出包后 checkpoint；失败从快照恢复 | **中** | backlog 可独立做，不依赖全公司平台 |
| **C. 公司 Agent 平台** | LinkAI / 自研工作流引擎自带 Session | **大** · **平台团队** | 定价 **注册 SOP + tool**，不自建引擎 |

**结论：定价项目不必须先上 C，才算「做对了」。**  A 已支撑 HITL 主链；B/C 是增强。

### 4.3 和 Agent 的关系

- Agent **不等于** WorkSession。  
- Agent 常 **跑在** WorkSession 里：调 tool、在 HITL 点等人。  
- 定价 **真源**仍在 CLI / Worker / Admin API；Agent 只编排。

---

## 5. 要不要对话框？

**不需要。** 对话框是入口之一，**不是**人机协同的必要条件。

| 交互 | 适用 | 价审 |
|------|------|------|
| **Admin 确认单 + 按钮** | 批量表格、强审计、写价闸 | ✅ **主入口** |
| 钉钉 / 邮件 | 「包好了，去 Admin」 | 可选通知 |
| **对话框 / Agent 助理** | 解释 diff、推荐场景、跳转 | 锦上添花 |

价审 = 强规则 + 大批量 diff → **Admin 比聊天更合适**。  
JD / LinkAI 强调对话，因平台卖 **多入口**；你们 **Admin 已是 HITL UI**。

---

## 6. 业界范式：是不是「行业标准」？

**不只有一个叫 WorkSession 的标准**，但和下列 **同构**：

| 业界说法 | 价审对应 |
|----------|----------|
| Long-running / durable workflow | 触发 → CLI → 等人 → 写价 |
| Human-in-the-loop (HITL) | 确认单 + 不确认不写 |
| Checkpoint | 出包后快照，避免重算 |
| Tool use | Worker 调 `pricing:*` CLI |
| Orchestration | SOP 步骤顺序 |

类似思路见于：Temporal、LangGraph interrupt、BPM+审批、LinkAI 工作流「转人工」等。

**你们的目标图 = 把价审套进这类通用模式**；现网 = **弱 session + 完整 HITL 主链**。

---

## 6.1 三种主流形态（A 平台级、B Orchestrator+Worker、自建 C 执行器）

你图里的 “WorkSession + HITL + checkpoint” 在业界通常落在三种实现形态：**A 平台级 durable 编排引擎**、**B Orchestrator+Worker**、**C Backend 直接执行**。

### 形态 A：平台级 Durable Workflow / 编排引擎（Temporal/类 Temporal）

**核心**：统一工作流引擎天然提供状态机、pause/resume、checkpoint、重试、观测与审计。  
**业务侧**：把每一步封装成引擎的节点/Activity（例如运行 CLI、组装价审包、回传产物）。

**优点**
- HITL 与长任务暂停/恢复/续跑更通用、成熟度更高
- 引擎层统一幂等、重试、可观测，减少业务侧工程量

**缺点**
- 需要适配你们 CLI/脚本成为引擎可执行节点
- 权限与写回规则仍要在业务侧严格定义（平台不会替你做治理）

### 形态 B：Orchestrator + Worker（你们当前更接近）

**核心**：Backend/Orchestrator 管任务生命周期与状态推进；Worker/Job Runner 执行重计算与产物生成。  
**HITL**：通过任务状态（例如 ready/paused）与 `confirm` 写回 API 实现“冻结 → 等人 → 恢复”。

**优点**
- 先把闭环跑通，MVP 成本低、业务可控
- Worker 隔离长任务计算，Backend 保持服务化
- 可在 backlog 里逐步补齐“引擎缺口”（checkpoint 语义、统一状态机、resume 细节）

**缺点**
- 需要你们持续工程化通用能力，否则会停留在“弱 session”
- 多步骤长任务的可观测性/幂等要持续完善

### 形态 C：Backend 直接执行（全部由 Backend 管）

**核心**：Orchestrator 兼任执行器，在 Backend 内部 spawn/运行 CLI，直到产物生成并完成写回或挂起。

**优点**
- 服务数量最少，实现看似简单

**缺点（工业上通常不推荐）**
- 长任务会显著放大 Backend 的超时/资源/扩容与运维复杂度
- HITL pause/resume 需要更多自研逻辑（状态一致性、续跑、幂等、重试都更难）

### 简记
- **A**：平台把通用能力尽量“开箱即用”
- **B**：你们先自建雏形（Orchestrator+Worker），再演进补齐通用能力
- **C**：可做但稳定性与工程代价通常更高

---

## 7. 与 JD / 智能体平台 · 就绪度

### 7.1 已对齐

- HITL、结构化 Skill/router、四场景边界、Admin↔Worker 主链（方案 C）

### 7.2 设计已定 · 工程待做（文档有 ≠ 现网齐）

| 项 | 设计 | 工程 | Agent 需 |
|----|------|------|----------|
| ② 上游调线 + 人闸 | ✅ | ❌ | tool: 倍率 + 保存线路 |
| L-01 V1/V2 + 写回闸 | ✅ | ⚠️ 闸部分有 | 解释 diff |
| C-01 Excel 进预览 | ✅ | ⚠️ | 稳定可读产物 |
| 三套 Tool 边界 | ✅ 规则 | ❌ API/权限 | 分 tool/token |
| 统一 ID | ⚠️ | ⚠️ taskId 有 | session ↔ task |

**清单补完 + 平台融合 → 定价 Agent 化 MVP 完成。**

### 7.3 LinkAI 类平台接入（示意）

```text
平台：WorkSession、HITL、多 Agent、Eval
    ↓ tool（只编排）
定价：Worker / Admin API / CLI / ops-scenario-router
```

Agent 拆分示意：

- **ListingAgent**（①）：trigger → HITL → confirmListing  
- **OnboardAgent**（④）：checklist + trigger(上新)  
- **RouteAgent**（②）：suggestRouteRate → saveRoute（≠ confirmListing）  
- **CommercialAgent**（⑤）：generateL3a（只读）

---

## 8. 就绪度总览（2026-08-11）

| 层级 | 状态 |
|------|------|
| 场景定义（四产物 + router） | ✅ 定稿 |
| Admin 场景枚举 | ✅ web 已改 |
| 价审主链（出包 → 人闸写价） | ✅ 已通 |
| ② / C-01 / L-01 / Tool 权限 / WorkSession 平台 | 📋 backlog |
| 图/视频 | ⚠️ 弱于生文 |
| 定时巡检 | 可选；并入 ① |

---

## 9. 建议实施顺序

1. **P0**：C-01 预览同步；L-01 确认单 V1/V2；Worker 按 scenario 分步  
2. **P1**：② 调线闭环；④ B1/B2  
3. **P2**：Tool 权限；taskId ↔ platform session；Agent 编排  
4. **P3**：Eval；定时 ①；图/视频

---

## 10. 术语表（学习笔记）

| 术语 | 含义 |
|------|------|
| **SOP** | 静态流程剧本：步骤顺序、分支、在哪等人 |
| **WorkSession** | 一次任务的运行容器：ID、状态、checkpoint、审计 |
| **HITL** | Human-in-the-loop：关键步骤必须人确认才继续 |
| **Checkpoint** | 快照：进度 + 产物；用于恢复，避免重跑 |
| **价审包** | draftPrices + diff；Admin 确认单数据源 |
| **弱 WorkSession** | 用价审 taskId + 任务表代替完整 session 平台 |
| **Agent** | 编排层：调 tool、解释、触发 HITL；不替算价 |
| **Tool** | 可调用的 API/CLI（triggerReview、confirmListing…） |
| **Eval** | 回归用例集（golden 价审包） |
| **①②④⑤** | 四产物场景（见 §1） |

---

## 11. 附录 · 写方案 / 述职可直接引用

> 价审采用 **「SOP 流程定义 + WorkSession 运行容器」** 分层：SOP（`ops-scenario-router`）描述官方锚跟刊例、上新、上游调线、商务出表四类产物及 HITL 拦截点；WorkSession 负责会话 ID、检查点、暂停恢复与审计。Trinity **先以业务闭环交付**（价审任务、CLI/Worker 出包、Admin 人闸写价），已满足核心 HITL；检查点恢复与智能体平台编排为演进方向，与 C-01、L-01、② 等 backlog 一并完成后，可对接企业级 Agent 平台。**Admin 确认单即 HITL 界面，不依赖对话框。**

---

## 12. 文档维护

| 变更 | 更新 |
|------|------|
| 场景 | §1 + `ops-scenario-router.md` |
| Admin 枚举 | §1.2 + web `priceReviewTypes.ts` |
| Worker | §2.2 + `pricing/worker/README.md` |
| Agent tool | 待建 `定价Agent-Tool契约.md` |
| 学习/术语 | §10 |

---

## 13. 接下来要补齐的清单（按优先级）

> 目标：先把 **DSL（SOP 剧本的结构化表示）** 在定价域里落地，再补齐定价域闭环产物与工程化接口，最后再做平台化/评测/编排增强。

### P0（立刻动手：把 DSL 跑起来 + 必要定价闭环）

1. **DSL 最小 Schema + 示例**
   - 定义字段：`scenario`、`modality`、`steps[]`、`hitlPausePoint`、`artifactMapping`
   - 位置：`pricing/worker/src/sopDsl/` 或 `pricing/docs/`（schema+样例）

2. **DSL Loader + Scenario→DSL 映射**
   - 将四产物场景（①②④⑤）映射到各自 DSL steps
   - 位置：Worker/编排层

3. **DSL 步骤执行器（把 DSL steps 映射到现有 CLI/函数）**
   - `type: npmScript` → 调 `runNpmScript`
   - `type: assemble/emit/deliver` → 调现有组装/emit/deliver
   - `type: hitl_pause` → 对等现网“到确认单就停”的状态输出

4. **把“停点/恢复/确认写回”语义接到现网能力**
   - DSL 控制“停在哪里、什么时候允许写回”；写回仍走现有 `confirm` API

5. **② 上游路线调价闭环（最小可用）**
   - 需要：抓上游 → 生成建议倍率/成本 → 人保存线路 → 审计/幂等
   - 关键要求：不写 `/v1/prices`（区别于①写刊例）

6. **C-01：价目预览自动同步（连接产物读链）**
   - 让 Worker/CLI 产物（对照 Excel 或其登记结果）进入价目预览 Tab 的稳定读取路径

7. **L-01：确认单 V1/V2 + 写回闸字段可读完整**
   - 验收：前端能解释“为何写回/为何只上浮/哪些模型可写回”，并与写回策略一致

8. **三套 Tool 边界在工程层落成（不是只靠文档禁用）**
   - 写刊例（confirm）/写线路（保存线路）/生成商务表（只读）三套权限/接口分离

### P1（让 DSL/任务运行更像“可持续的长任务系统”）

9. **Checkpoint 持久化最小版（恢复语义）**
   - CLI 出包后保存“流程到哪一步 + 关键产物”
   - 宕机重启可从快照继续，不必重算 upstream

10. **统一状态机（DSL 驱动）**
   - 至少包含：`queued / running / hitl_paused / completed / failed`
   - 并与现网任务状态对齐

11. **幂等与失败重试策略**
   - 同一 `(scenario, modality, contentHash)` 不重复空跑
   - 写回操作具备幂等键，避免重复写入

### P2（贴近 JD / 平台化后更稳）

12. **Eval：价审包回归测试集（评测集）**
   - golden case：价审包 JSON、diff rows、确认单关键字段
   - 验收：改 CLI/组装逻辑后 Admin 解析与 diff 汇总不回归

13. **平台对接增强（可选）**
   - WorkSession（sessionId 映射）、HITL 待办节点、工具注册（只编排不越权）

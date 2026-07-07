---
title: 能力地图
---

# AI API 聚合产品 · 能力地图

> **说明**：企业级 ToB **能力全景**——各能力域管什么、在租户控制台 / 平台 API / 运营后台如何落点、手册入口与当前状态。  
> **业务主流程** → [业务全景](./business-overview) · **工程/runtime** → [产品核心与架构](./product-core) · **进度** → [产品总览](./index.md)

---

## 1. 产品树主轴（L0）

本页是 **AI API 聚合产品** 的模块全景真源。AI 聚合在通用 ToB 底座上增加 **D（供给与定价）**、**E（统一 API 交付）**；其余域与典型 B2B API / SaaS 一致。

```text
ToB 能力域（L0 · 产品树主轴）
├── A. 身份与组织        Tenant / Workspace / 成员 / 角色
├── B. 商业化与合同      套餐 · 授信 · 合同 · 试用商用边界
├── C. 接入与安全        API Key · 限流 · 密钥治理 · 数据策略
├── D. AI 供给与定价     供应商 · 上架 · 线路 · 刊例 · 价目治理
├── E. 统一 API 交付     生文/图/视频 · 路由 · 协议兼容
├── F. 计量与财务        计量 · 扣费 · 充值 · 账单 · 对账 · 分摊
├── G. 可观测与风控      日志 · 监控 · 审计 · SLA
├── H. 发现与体验        官网 · 广场 · Chat（获客/转化）
├── I. 文档与支持        trinity-docs · FAQ · 法务
└── J. 扩展与集成        Webhook · 导出 · SSO/ERP（多为 P1/P2）
```

### 三面落点

每个能力域在 **租户控制台 / 平台 API / 运营后台** 的入口：

| 域 | 租户面 | API 面 | 运营面 |
|:--:|--------|--------|--------|
| **A** | [身份与组织 · 总览](./user/identity-org/) | IAM · Workspace 上下文 | [用户审核](./operations/users) · [客户与合同](./operations/customers) |
| **B** | 充值 · 账单（顶级） | 402 · 余额校验 | [customers](./operations/customers) · [billing](./operations/billing) |
| **C** | [API 密钥](./user/identity-org/api-keys) | [鉴权限流](./platform/auth-rate-quota) | [密钥管理](./operations/keys) |
| **D** | [模型域](./user/models/) | `GET /v1/models` · `/v1/prices` | [models-routes](./operations/models-routes) · [pricing-sources/](./pricing-sources/) |
| **E** | Chat 试玩 | [platform/](./platform/) | 线路 · 模板 |
| **F** | [配额](./user/identity-org/quota) · [用量](./user/identity-org/usage-logs) | [metering-billing](./platform/metering-billing) | [billing](./operations/billing) |
| **G** | 活动 · 调用日志 | Request ID · 错误体 | [monitoring-risk](./operations/monitoring-risk) · [access-audit](./operations/access-audit) |
| **H** | 官网 · [模型广场](./user/models/) · [Chat](./user/chat-experience) | — | — |
| **I** | [文档与支持 · 总览](./user/docs/) · [对外文档站](./user/developer-docs) · `trinity-docs` | OpenAPI 叙述 | [docs-publish](./operations/docs-publish) |
| **J** | SSO · 导出（规划） | Webhook（规划） | — |

**图例 · 文档成熟度**（1–5，月会刷新）：1 仅 roadmap · 2 有说明 · 3 有流程图 · 4 L2 规格 · 5 与业务/工程一致

---

## 2. 各域状态与手册入口

| 域 | 工程 | 文档 | 主链 | 手册 / 备注 |
|:--:|:----:|:----:|:----:|-------------|
| **A** | 🟡 | **4** | ★★★ | [identity-org/](./user/identity-org/) · 多工作区 · 配额分配已上线 |
| **B** | 🟡 | **4** | ★★★ | [commercial-billing/](./commercial-billing/) |
| **C** | 🟡 | **2** | ★★★ | keys 分散在 A 域与 ops |
| **D** | 🟡 | **4** | ★★★ | [models/](./user/models/) · [pricing-sources/](./pricing-sources/) |
| **E** | 🟡 | **2** | ★★★ | [platform/](./platform/) 叶子待 L2 |
| **F** | 🟡 | **3** | ★★★ | quota/usage L2 + commercial-billing |
| **G** | 🟡 | **2** | ★★ | 三面未串叙述 |
| **H** | 🟡 | **4** | ★★ | 模型域 L2 完成 |
| **I** | 🟡 | **4** | ★★★ | [docs/](./user/docs/) · [developer-docs](./user/developer-docs) L2 样本 |
| **J** | ⬜ | **1** | ★ | SSO · Webhook 未立项 |

---

## 3. 与业务主流程的对应

| 主流程（[业务全景 §4](./business-overview#4-五条主业务流程)） | 涉及能力域 |
|--------------------------------|----------------|
| 4.1 供给链 | **D** · G（价目） |
| 4.2 获客与开户 | **A** · **B** |
| 4.3 集成与调用 | **C** · **E** · **H** · **I** |
| 4.4 计量与收钱 | **F** · **B** |
| 4.5 治理与风控 | **G** · **C** · D（价目） |

---

## 4. 与用户侧 / 平台侧 / 运营侧导航的关系

侧栏 **用户侧 / 平台侧 / 运营后台** 按 **界面与工程** 组织；本页按 **ToB 能力** 组织。同一叶子可属多域（例：`api-keys` 属 **A + C**）。

查 **缺什么能力** → 本页。查 **具体页面与 ✅🟡⬜** → [user/](./user/) · [platform/](./platform/) · [operations/](./operations/)。

## 5. 维护

| 变更 | 改哪里 |
|------|--------|
| 新增 / 调整能力域（A–J） | **§1 产品树** + §2 状态表 |
| 新页面上线、手册入口 | §2 三面落点 · 域 L1/L2 · 子总览 **能力域** 列 |
| 工程 / 文档进度 | §2 工程 · 文档列；周计划见 [产品总览](./index.md) |

补充文档时先 **[产品手册文档规范 · AI API 能力树](../产品手册文档规范#ai-api-聚合--读与补能力树)**：归域 → L2 → 挂导航 → 进度。

---

## 6. 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | I 域 L2 样本 developer-docs |
| 2026-07-06 | §5 维护规则；产品树 A–J 标准树形 |
| 2026-07-06 | 初版：十域全景 · 三面落点 · 状态表 |

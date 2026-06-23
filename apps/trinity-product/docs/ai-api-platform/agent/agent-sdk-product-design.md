---
title: Agent SDK · 产品设计
---

# Agent SDK · 产品设计（v0.1）

> **状态**：讨论稿 · **未立项排期**  
> **对标**：友商 [OpenRouter Agent SDK](https://openrouter.ai/docs/agent-sdk/overview)（`@openrouter/agent`）  
> **读者**：产品 · 架构 · 网关 · SDK 研发  
> **对外**：本期仅产品手册；**未**写入 `trinity-docs`（见 [一期 MVP 文档清单](../../../../docs/04-工程与迁移/Trinity文档站-一期MVP文档清单.md) Agent SDK 边界）

## 1. 为什么要做

Trinity 已具备 **统一 HTTP API**（`POST /v1/chat/completions`、`tools` / `tool_choice`、流式等，见工程师 [API对外接口支持参数](../../../../docs/00-协作与工作流/工程师/API对外接口支持参数.md)）。开发者 today 需要**自己写**：

- 多轮 tool call 循环（model → execute tools → append messages → 再请求）
- 停止条件（步数、费用、指定 tool）
- 流式与最终态拼接

OpenRouter 将上述能力收敛为 **`@openrouter/agent` + `callModel()`**，并在 Quickstart 中与 **HTTP API / Client SDK** 并列三层选型。Trinity 若要对齐「开发者体验闭环」，需要同层 **Trinity Agent SDK**，而不是只提供裸 REST。

**与现有能力边界**

| 已有 | 本设计 |
|------|--------|
| [Cookbook](http://127.0.0.1:5205/docs/cookbook/) · IDE 配置 | **应用内** TypeScript/Python Agent 编排 |
| `apps/trinity-skills` · IDE Skill 协议 | **库/SDK**，供业务代码 `npm install` |
| `POST /chat/completions` | SDK 底层仍走网关，不新增平行协议 |

---

## 2. OpenRouter 三层接入（对齐参照）

| 层级 | OpenRouter | 适用场景 | Trinity 现状 | Trinity 目标 |
|------|------------|----------|--------------|--------------|
| **HTTP API** | REST `/chat/completions` 等 | 任意语言、零依赖 | ✅ 已开放 | 保持真源 |
| **Client SDK** | `@openrouter/sdk`（TS / Py / Go） | 类型安全单次/流式调用，自管会话 | ❌ 无官方包 | **P1** `@trinity/sdk`（可另立项） |
| **Agent SDK** | `@openrouter/agent` | `callModel` 多轮 + 自动执行 tools + stopWhen | ❌ | **本设计 · P0 聚焦 TS** |

OpenRouter Agent SDK 核心卖点（须在 Trinity v0.1 **语义对齐**，实现可渐进）：

| 能力 | OR 表现 | Trinity v0.1 要求 |
|------|---------|-------------------|
| 入口 | `callModel({ model, messages, tools, stopWhen })` | 同名或 `trinity.callModel` 等价 API |
| 工具 | `tool({ name, description, inputSchema: zod, execute })` | Zod 校验 + 本地 `execute` |
| 循环 | 自动：请求 → tool_calls → execute → 写回 messages → 再请求 | **SDK 内实现**，网关不新增 `/agent/run` |
| 停止 | `stepCountIs(n)`、`maxCost($)`、`hasToolCall(name)`、可组合 | P0：`stepCountIs`；P0.5：`maxCost`（依赖响应 `usage` / 结算） |
| 流式 | `getTextStream()` / `getToolCallsStream()` / `getReasoningStream()` | P0：`getTextStream`；tool/reasoning 流 P1 |
| 状态 | SDK 维护 messages + tool results | 同左 |
| 费用 | `result.getResponse()` 含 token / cost | 对齐网关 `usage`；**展示价**与 [计量与计费](../platform/metering-billing) 同源策略待定 |
| 人机 | `requireApproval`、HITL tools | **P2**；B2B 合规场景再定 |
| 语言 | Agent：**TypeScript**（ESM）；Client 多语言 | **v0.1 仅 TypeScript**；Python P1 |

参考链接（维护者）：[Agent SDK Overview](https://openrouter.ai/docs/agent-sdk/overview) · [callModel 教程](https://openrouter.ai/blog/tutorials/agent-sdk-with-callmodel/) · [npm @openrouter/agent](https://www.npmjs.org/package/@openrouter/agent)

---

## 3. 前沿 Agent SDK 一览（2026 Q2）

供 **API 形态与开发者预期** 对齐，非逐行抄功能。

| 项目 | 类型 | 核心抽象 | 与 Trinity 关系 |
|------|------|----------|----------------|
| **OpenRouter `@openrouter/agent`** | 网关配套 Agent 层 | `callModel` + `tool()` + `stopWhen` | **主对标** |
| **OpenRouter `@openrouter/sdk`** | 瘦客户端 | 镜像 REST，自管编排 | Client SDK 对标 |
| **OpenAI Agents SDK** | 厂商 Agent 框架 | Agent、Handoff、Guardrails、Tracing | 学 **handoff / trace** 产品叙事；模型走 Trinity `model` id |
| **Anthropic Messages + tools** | API + 官方 SDK | `tools` / `tool_use` 块 | 网关已兼容 OpenAI 形态；Claude 原生格式 **非** P0 |
| **Vercel AI SDK** | 应用层 TS | `streamText`、`tool`、`maxSteps` | 流行度高；Trinity 可提供 **adapter** 或文档「用 AI SDK + Trinity baseURL」 |
| **LangGraph / LangChain** | 编排框架 | Graph、State、Checkpoint | 客户自建编排；Trinity 保证 **OpenAI-compatible** 即可 |
| **Google ADK** | 云厂商 Agent 套件 | Agent/Tool/Session 服务端 | 参考 **Session** 命名；Trinity 不先做托管 Session 服务 |
| **Mastra / VoltAgent 等 TS Agent 框架** | 全栈 Agent 框架 | Workflow + Model Router | 可作为 **集成示例**，非竞品替换 |

**归纳（v0.1 产品原则）**

1. **薄 Agent SDK，厚网关**：循环在客户端（与 OR 一致），不把「Agent Runtime」做成重型托管服务。  
2. **OpenAI Chat Completions 真源**：`tools` / `tool_choice` / `messages` 与现有工程师表一致。  
3. **可插拔编排**：不阻止 LangGraph / AI SDK；官方包解决「80% 默认路径」。  
4. **TS 先行**：与 OR Agent SDK、国内 Node 生态一致；Python 跟 Client SDK 一起排。

---

## 4. Trinity Agent SDK 产品定义

### 4.1 一句话

**在 Trinity 网关之上，提供与 OpenRouter Agent SDK 同心智的 TypeScript 库：一个 `callModel` 完成多轮推理与工具执行，默认使用 `TRINITY_API_KEY` + `TRINITY_BASE_URL`。**

### 4.2 目标用户

| 用户 | 诉求 |
|------|------|
| 独立开发者 / 初创 | 快速搭 Research Agent、客服 Bot，不想写 while 循环 |
| 企业应用团队 | 统一 Key、统一计量，代码侧可控 stop / cost |
| Trinity 内部 | Dogfood、示例、与 [trinity-skills](../competitor-research/new-api-skill) 能力分层 |

### 4.3 非目标（v0.1）

- 托管 Agent 会话存储（云端 Session DB）
- 内置 Web Search / Code Interpreter 等**平台工具**（客户自研 `execute`）
- 替代 LangGraph / CrewAI 等完整框架
- 对外文档站大篇幅上线（先手册 + 内测 README）
- 多模态 Agent 工具（图/视频）— 依赖 [多模态 API](../platform/multimodal-api) 成熟后再开

### 4.4 包与工程（建议）

| 项 | 建议 |
|----|------|
| Monorepo 路径 | `apps/trinity-agent-sdk/` 或 `packages/agent/` |
| npm 名 | `@trinity/agent`（讨论稿） |
| 依赖 | `zod`；HTTP 用 `fetch` 或薄封装 `@trinity/sdk`（若已有） |
| 配置 | `TRINITY_API_KEY`、`TRINITY_BASE_URL`（含 `/v1`），与 Cookbook 一致 |
| 发布 | 独立 npm + 文档片段；版本 **pin**（OR Agent SDK 仍 beta） |

---

## 5. 核心 API 草案（对齐 OR）

```typescript
import { callModel, tool, stepCountIs, maxCost } from '@trinity/agent';
import { z } from 'zod';

const getTime = tool({
  name: 'get_time',
  description: 'Get current time in IANA timezone',
  inputSchema: z.object({ timezone: z.string() }),
  execute: async ({ timezone }) => ({ time: new Date().toLocaleString('en-US', { timeZone: timezone }) }),
});

const result = await callModel({
  model: 'gpt-5.5', // Trinity 模型广场 id
  messages: [{ role: 'user', content: 'What time is it in Tokyo?' }],
  tools: [getTime],
  stopWhen: [stepCountIs(5), maxCost(0.5)], // maxCost 需 usage/价目 · P0.5
});

const text = await result.getText();
const usage = result.getUsage(); // prompt/completion tokens · 累计多步
```

**`callModel` 行为契约**

1. 每步：`POST {TRINITY_BASE_URL}/chat/completions`（`stream` 可选）。  
2. 若 `finish_reason` / tool_calls：解析 → 执行本地 `execute` → append `role: tool` messages。  
3. 直至：无 tool_calls、或 `stopWhen` 命中、或网关错误。  
4. 透传请求头：`Authorization`、`X-Request-Id`、`X-Idempotency-Key`（文档与 [统一 API](../platform/unified-api) 一致）。  
5. **不在 SDK 内**调用 `/v1/app/chat/completions`（站内 JWT 接口不对客户开放）。

**工具类型（分期）**

| 类型 | OR | Trinity |
|------|-----|---------|
| 函数工具 | `tool()` + Zod | P0 |
| 需审批 | `requireApproval` | P2 |
| 仅模型侧（无 execute） | provider-defined | 不做了，除非工程师表扩展 |

---

## 6. 与网关能力对照（发布前 diff）

| SDK 能力 | 依赖网关字段/行为 | Trinity 工程师表 | v0.1 |
|----------|-------------------|------------------|------|
| 多轮 messages + tools | `messages`、`tools`、`tool_choice` | §一 生文 | ✅ 假定已支持 |
| 流式单步 | `stream: true`、SSE | §一 流式 | P0 可选 |
| 步数停止 | 纯客户端 | — | P0 |
| 费用停止 `maxCost` | 每步 `usage` + 单价 | `usage`、计量 | P0.5，需价目同源 |
| Reasoning 流 | 模型特定字段 | `thinking_*` 等 | P1，按模型 |
| 动态换模型 | 每步不同 `model` | 同端点 | P1 |
| Prompt Cache | `X-Conversation-Id` | §0 头 | P1 文档化，SDK 可选带头 |

**阻塞项**（进 roadmap 前须闭环）：`maxCost` 价目来源、流式下 tool_calls 增量解析、部分模型 `tools` 不支持时的错误 UX。

---

## 7. 文档与产品矩阵（建成后）

| 载体 | 内容 |
|------|------|
| **本手册 · Agent** | 产品设计、里程碑、与 Skill/Cookbook 边界 |
| **`trinity-docs` 新轨或 Guides** | Quickstart：`npm i @trinity/agent`、第一个 `callModel`（**二期对外**） |
| **Cookbook** | 「用 Vercel AI SDK + Trinity」「用 LangGraph + Trinity」集成篇 |
| **[开发者文档](../user/developer-docs) roadmap** | 增 Agent SDK 子项后再同步 YAML |

对外正文仍遵守：**不写 OpenRouter 字样**；可说「多轮工具调用 SDK」，对标结构仅在本手册与维护者文档出现。

---

## 8. 分阶段路线图（建议）

| 阶段 | 交付 | 验收 |
|------|------|------|
| **P0** | `@trinity/agent`：`callModel`、`tool()`、`stepCountIs`、非流式多步、单测 + 示例 repo | 3 个 tool 场景跑通；Key 仅环境变量 |
| **P0.5** | 流式 `getTextStream`；`maxCost`；累计 `getUsage()` | 与控制台用量可对账（抽样） |
| **P1** | Python 版或薄 `trinity` PyPI；`@trinity/sdk` Client 抽取；Cookbook 集成 2 例 | 文档站内测页 |
| **P2** | HITL、DevTools 遥测、动态 model/tools | 企业试点需求驱动 |

**与 [trinity-skills](../competitor-research/new-api-skill) 分工**

| | trinity-skills | Trinity Agent SDK |
|--|----------------|-------------------|
| 运行环境 | Cursor / Claude Code 对话 | 用户业务 Node 进程 |
| 配置 | Skill 协议、`/trinity models` | `import { callModel }` |
| 优先级 | IDE DX · P0 已部分落地 | **应用 Agent · 本设计** |

---

## 9. 开放问题（待评审）

1. **包名与仓库**：monorepo 内 `packages/agent` vs 独立 GitHub 仓？  
2. **maxCost 币种**：USD 展示价 vs 人民币账户余额是否统一换算？  
3. **是否提供「仅 Client」的 `@trinity/sdk`** 与 Agent 同发，还是 Agent 内嵌 fetch？  
4. **对外文档节奏**：是否与 6.30 商用打包，还是 Agent SDK 单独 Beta？  
5. **平台侧是否要 Agent 专用限额**（单 Key 最大 agent 步数 / 日工具调用次数）？  

---

## 10. 相关链接

| 主题 | 入口 |
|------|------|
| 行业背景（跨境 / 2026 周期） | [行业现状与跨境落地](./industry-cross-border) |
| 顶层定位与架构 | [产品定位与架构](./positioning-and-architecture) |
| OpenRouter 友商总览 | [OpenRouter](../competitor-research/openrouter) |
| 统一 API / tools | [生文 API](../platform/chat-completions) · [高级参数](../platform/chat-completions) |
| 文档站 IA（SDK 空 Tab） | [信息架构与顶栏设计](../../../../docs/04-工程与迁移/Trinity文档站-信息架构与顶栏设计.md) |
| IDE Skill | [newapi Skill 落地方案](../competitor-research/new-api-skill) · `apps/trinity-skills` |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-22 | v0.1：OR Agent SDK 对齐 + 前沿 SDK 一览 + P0–P2 草案 |

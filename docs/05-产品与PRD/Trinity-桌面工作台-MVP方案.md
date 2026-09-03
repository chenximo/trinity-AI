# Trinity 桌面工作台 · MVP 方案

> **文档类型**：产品 / 架构 · **内部评审用**  
> **版本**：v1.0 · 2026-09-02  
> **对标参考**：[WorkBuddy](https://www.workbuddy.ai) 桌面 Agent 工作台（**小型化**，非企业版全量）  
> **关联文档**：[SuperAgent-自建可行性评估与CowAgent集成](./SuperAgent-自建可行性评估与CowAgent集成.md) · [LinkAI-超级AI助理-产品分析](./LinkAI-超级AI助理-产品分析.md) · [AI-API聚合平台-产品全景与介绍](./AI-API聚合平台-产品全景与介绍.md) · [WorkBuddy 接入 Cookbook](../../apps/trinity-docs/docs/cookbook/agent-workbench/workbuddy.md) · [Agent SDK 产品设计（讨论稿）](../../apps/trinity-product/docs/ai-api-platform/agent/agent-sdk-product-design.md)  
> **说明**：定义「类似 WorkBuddy 的桌面端 + MCP 连接器」最小产品范围、难度与分期；**非**立项批复。

---

## 文档目录

| 章 | 内容 |
|----|------|
| [一、结论摘要](#一结论摘要) | 做什么、难度、周期、与 WorkBuddy 差异 |
| [二、WorkBuddy 桌面端在做什么](#二workbuddy-桌面端在做什么) | 连接器 / MCP / 与网页门户的区别 |
| [三、Trinity 桌面工作台定义](#三trinity-桌面工作台定义) | 产品名、边界、不做清单 |
| [四、逻辑架构](#四逻辑架构) | 模块图、与 Trinity API 分工 |
| [五、模块难度拆解](#五模块难度拆解) | 每项工作量与风险 |
| [六、连接器（MCP）设计](#六连接器mcp设计) | 配置、UI、预置与自定义 |
| [七、模型与 Agent Loop](#七模型与-agent-loop) | Trinity 接入、工具调用、步数上限 |
| [八、分期里程碑](#八分期里程碑) | P0～P4 交付与验收 |
| [九、团队与工期粗估](#九团队与工期粗估) | 人力假设 |
| [十、路线对比与选型](#十路线对比与选型) | vs WorkBuddy / CowAgent / SDK / 网页门户 |
| [十一、风险与评审清单](#十一风险与评审清单) | 安全、合规、技术 |
| [附录](#附录) | 配置示例、参考链接 |

---

## 一、结论摘要

### 1.1 我们要做的是什么

**Trinity 桌面工作台**（工作名）：一款 **轻量桌面 Agent 应用**（macOS / Windows），核心能力为：

1. **对话**：流式聊天，模型 **只走 Trinity API**  
2. **Agent Loop**：支持 `tools` 多轮调用（步数/费用可上限）  
3. **连接器**：以 **MCP（Model Context Protocol）** 接外部产品能力——与 WorkBuddy「连接器」同族，**不做**一排官方 OAuth 连接器  

**不是**：网页里放产品链接的门户；不是 LinkAI/CowAgent 级超级助理；不是 WorkBuddy Enterprise 全量。

### 1.2 难度与周期（小型版）

| 指标 | 评估 |
|------|------|
| **整体难度** | ⭐⭐⭐⭐ 中高（低于完整 WorkBuddy / SuperAgent） |
| **PoC**（对话 + Trinity + 1 个 MCP） | **6～8 周** |
| **可内测 MVP** | **3～5 个月**（约 2 前端 + 1 客户端/后端） |
| **与主航道关系** | API 聚合 **不变**；桌面是 **新交付形态 + MCP 扩展** |

### 1.3 与 WorkBuddy 的关系

| | **WorkBuddy（现成）** | **Trinity 桌面工作台（自建小型）** |
|--|----------------------|-----------------------------------|
| 模型 | 可配 Trinity（已有 Cookbook） | **默认仅 Trinity** |
| 连接器 | 官方 QQ 邮箱、腾讯文档、TAPD… + 自定义 MCP | **仅 MCP 框架** + 1～2 个开源预置 |
| 品牌 | 腾讯云 | **Trinity** |
| 工期 | 配置即用 | **3～5 月 MVP** |

**建议**：需求验证阶段可 **继续推 WorkBuddy + Trinity 模型**；自研桌面仅在 **必须自有品牌、与 Account 深度一体、定制连接器策略** 时立项。

---

## 二、WorkBuddy 桌面端在做什么

### 2.1 不是「链接集合页」

WorkBuddy 是 **本地运行的 Agent 工作台**：用户用自然语言下任务，Agent **规划并调用工具** 完成任务（读文件、调外部服务等）。见 [WorkBuddy 运行逻辑解读（博客园）](https://www.cnblogs.com/tgzhu/p/21629693) 与 [官方连接器文档](https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Connector)。

### 2.2 连接器 = MCP 为主

| 概念 | 说明 |
|------|------|
| **Connector（连接器）** | WorkBuddy 与外部服务的桥梁；UI 里启用/授权 |
| **MCP** | 底层协议；工具以标准方式暴露给 Agent |
| **Skill** | 流程/提示词封装（与 MCP 分工不同；MVP **可不做了**） |
| **配置** | 自定义 MCP 常写在 `~/.workbuddy/mcp.json`（stdio / HTTP / SSE） |

官方已支持 QQ 邮箱、腾讯文档、腾讯乐享、TAPD、微云等；**每一个都含 OAuth/联调/维护成本**——小型 Trinity 版 **不做** 这一层，只做 **「能接任意 MCP Server」**。

### 2.3 WorkBuddy 模块地图（对照用）

```text
WorkBuddy 完整版
├─ 模型层（内置 + 自定义 API）          → MVP：仅 Trinity
├─ Agent Loop + 工具呈现               → MVP：要有
├─ 连接器（MCP + 官方 OAuth 连接器）    → MVP：仅 MCP 通用 + 预置 1～2 个
├─ Skill / Expert / Memory              → MVP：不做
├─ 本地工作区 + 沙箱 + 用户确认          → MVP：工作目录 + 基础确认
└─ 打包 / 更新 / 多平台                  → MVP：P4 做
```

---

## 三、Trinity 桌面工作台定义

### 3.1 产品一句话

> **Trinity 牌桌面 Agent：用 Trinity 模型思考，用 MCP 连接器动手；轻量、可扩展，不重复造超级助理。**

### 3.2 MVP 范围（In Scope）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **桌面壳** | Tauri 2（推荐）或 Electron；macOS + Windows |
| 2 | **聊天 UI** | 流式、Markdown、中断生成 |
| 3 | **模型设置** | API Key（`xh-`）、Base URL、模型 ID；与 [Cookbook WorkBuddy 字段规则](../../apps/trinity-docs/docs/cookbook/agent-workbench/workbuddy.md) 对齐 |
| 4 | **Agent Loop** | `tools` 多轮；`max_steps`；失败可提示 |
| 5 | **连接器面板** | 列表、启用/禁用、添加自定义 MCP |
| 6 | **MCP Client** | 至少 **stdio** + **HTTP/SSE** 一种远程传输 |
| 7 | **预置 MCP** | 如 `@modelcontextprotocol/server-filesystem`（工作目录内）、可选 fetch |
| 8 | **首次连接确认** | 新 MCP 需用户批准 |
| 9 | **工作目录** | 用户指定文件夹；文件类 MCP 限制在此 |
| 10 | **本地会话历史** | 单机 SQLite 或 JSON；不要求云同步 |
| 11 | **用量提示** | 展示当轮/当次 `usage`（若网关返回） |

### 3.3 明确不做（Out of Scope · MVP）

| 不做 | 原因 |
|------|------|
| 官方 QQ 邮箱 / 腾讯文档 / TAPD 等 OAuth 连接器 | 每个都是独立集成项目 |
| Skill Hub / Expert 多 Agent | 复杂度接近另一产品 |
| 长期 Memory / 知识图谱 / 自进化 | 非 MVP 价值闭环 |
| 内置浏览器、全功能终端 | 安全面陡增 |
| IM 渠道（微信/飞书机器人） | 见 [SuperAgent 评估](./SuperAgent-自建可行性评估与CowAgent集成.md) |
| 云端托管 Runtime / 多租户 SaaS | 桌面本地优先 |
| 替代 Trinity Account 控制台 | 桌面是 **消费端**，密钥仍来自控制台 |

### 3.4 与内部架构框架对照

对照 [大模型训练三阶段与聚合平台定位 · §5.15](./大模型训练三阶段与聚合平台定位.md)：

- **不是** Multi-Agent / 多角色协作  
- **是** 单桌面 Agent + **MCP 连外部系统**（执行层 + MCP 的典型组合）  
- **治理**：MVP 做 **本地确认 + 工作目录边界**；企业审计二期与 Account 联动  

---

## 四、逻辑架构

### 4.1 架构图

```text
┌─────────────────────────────────────────────────────────────┐
│  Trinity 桌面工作台（Tauri / Vue）                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ 聊天 UI      │  │ 模型设置      │  │ 连接器面板          │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          ▼                                   │
│              ┌───────────────────────┐                         │
│              │  Agent Loop（本地）    │                         │
│              │  messages + tools     │                         │
│              └───────────┬───────────┘                         │
│                          │                                     │
│         ┌────────────────┼────────────────┐                    │
│         ▼                ▼                ▼                    │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐          │
│  │ MCP Client │  │ 工作目录     │  │ 会话存储      │          │
│  │ stdio/http │  │ 权限边界     │  │ （本地）      │          │
│  └─────┬──────┘  └─────────────┘  └──────────────┘          │
└────────┼────────────────────────────────────────────────────┘
         │ 子进程 / HTTP
         ▼
┌─────────────────┐     OpenAI-compatible      ┌──────────────┐
│  MCP Servers    │                              │ Trinity API  │
│  （用户/预置）   │                              │ chat + tools │
└─────────────────┘                              └──────────────┘
```

### 4.2 职责分工

| 层 | 负责方 | 说明 |
|----|--------|------|
| **推理与计量** | Trinity 网关 | 密钥、模型、usage、路由 |
| **Agent 编排** | 桌面 App 本地 | Loop、消息拼接、工具调度 |
| **外部能力** | MCP Server | 各产品/数据源自管协议与鉴权 |
| **连接器商店** | 不做（MVP） | 文档教用户配 MCP 或引用社区 Server |

### 4.3 推荐技术选型（讨论稿）

| 项 | 建议 | 备选 |
|----|------|------|
| 桌面框架 | **Tauri 2** + Vue 3 | Electron（人力熟悉度优先） |
| UI | 对齐 `trinity-base.css` / 现有 Vue 组件 | — |
| LLM 客户端 | OpenAI SDK 指 Trinity baseURL | Vercel AI SDK |
| MCP | `@modelcontextprotocol/sdk`（TS） | 自研最小客户端 |
| 本地存储 | SQLite | JSON 文件（PoC） |

---

## 五、模块难度拆解

| 模块 | 难度 | 说明 | MVP 必须 |
|------|------|------|----------|
| Tauri 打包 Win/Mac | ⭐⭐⭐ | 签名、更新、权限 | P4 |
| 聊天 + SSE 流式 | ⭐⭐⭐ | 中断、错误态 | P0 |
| Trinity API 对接 | ⭐⭐ | Cookbook 已有规则 | P0 |
| Agent Loop + tools | ⭐⭐⭐⭐ | 多轮、并行 tool、停止条件 | P1 |
| MCP Client（stdio） | ⭐⭐⭐ | 进程生命周期 | P1 |
| MCP Client（HTTP/SSE） | ⭐⭐⭐ | 远程 Server | P2 |
| 连接器 UI + mcp.json | ⭐⭐⭐ | 增删改、校验 | P2 |
| 连接审批 / 危险操作确认 | ⭐⭐⭐ | 安全底线 | P2 |
| 工作目录沙箱 | ⭐⭐⭐ | 与 filesystem MCP 一致 | P3 |
| 会话历史 | ⭐⭐ | — | P3 |
| 官方 SaaS 连接器 | ⭐⭐⭐⭐⭐ | **MVP 不做** | — |

---

## 六、连接器（MCP）设计

### 6.1 用户体验（对齐 WorkBuddy，做薄）

1. 左侧或设置中进入 **「连接器」**  
2. 卡片列表：**预置** + **已添加**  
3. 点击 **添加自定义连接器** → 表单或 JSON（高级）  
4. 首次启用 → **批准**（展示 Server 名称、权限说明）  
5. 对话中 Agent 自动发现 MCP 暴露的 **tools**  

### 6.2 配置文件（建议路径）

| 平台 | 路径 |
|------|------|
| macOS / Linux | `~/.trinity-workbench/mcp.json` |
| Windows | `%USERPROFILE%\.trinity-workbench\mcp.json` |

与 WorkBuddy 的 `~/.workbuddy/mcp.json` **分离**，避免冲突。

### 6.3 配置示例

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/workspace"]
    },
    "custom-http": {
      "type": "http",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${ENV:MY_TOKEN}"
      }
    }
  }
}
```

> MVP 可先支持 **stdio**；HTTP 按 `@modelcontextprotocol/sdk` 能力分期接入。环境变量替换规则在实现时写进文档。

### 6.4 预置连接器（MVP）

| 预置 | 用途 | 来源 |
|------|------|------|
| **工作区文件** | 读写在用户选定目录内 | 官方 MCP filesystem server |
| **（可选）Fetch** | 拉取 URL 内容 | 社区 MCP server |

**不做**腾讯文档/邮箱等——若客户需要，自行部署对应 MCP 或等 **P5+ 项目制**。

### 6.5 Skill vs MCP（产品话术）

| | **MCP（连接器）** | **Skill（不做 MVP）** |
|--|------------------|----------------------|
| 本质 | 标准化 **工具接口** | 提示词 + 流程封装 |
| 扩展 | 外部进程 / 服务 | 产品内安装包 |
| WorkBuddy | 连接器主通道 | 另有一套 Skill Hub |

---

## 七、模型与 Agent Loop

### 7.1 Trinity 接入（与 Cookbook 一致）

| 字段 | 值 |
|------|-----|
| **URL** | `https://api.trinitydesk.ai/v1/chat/completions`（须 **完整路径**） |
| **API Key** | `xh-...` |
| **model** | [模型广场](https://trinity.ai/models) ID，须 **支持 tools** 的型号 |

详见 [WorkBuddy 接入 Cookbook](../../apps/trinity-docs/docs/cookbook/agent-workbench/workbuddy.md)（字段规则通用）。

### 7.2 Agent Loop 行为

```text
用户消息
    ↓
追加 messages → POST Trinity（tools = 已启用 MCP 的工具集）
    ↓
有 tool_calls？ ──否──→ 流式输出最终回复
    │
   是
    ↓
执行 MCP tool（可弹确认）
    ↓
tool 结果写回 messages
    ↓
步数 < max_steps？ ──是──→ 再 POST Trinity
    │
   否 → 提示「已达步数上限」并汇总
```

### 7.3 控制参数（产品化）

| 参数 | 默认 | 说明 |
|------|------|------|
| `max_steps` | 10～15 | 单次任务最大 tool 轮数 |
| `max_context_turns` | 20 | 可选，防 Token 爆炸 |
| 固定 `X-Conversation-Id` | 建议 | 多轮 Agent 任务提高缓存命中（见 API 参数说明） |

### 7.4 与 Agent SDK 讨论稿关系

- **Agent SDK**：给 **开发者** 在自有代码里 `callModel` + tools  
- **桌面工作台**：给 **终端用户** 开箱 Chat + MCP UI  
- **底层**：均可复用同一套 Loop 逻辑（TS 包抽 `trinity-agent-core` 可选，P2 再议）

---

## 八、分期里程碑

### P0 · 能聊（2～3 周）

- [ ] Tauri 空壳 + 单会话聊天  
- [ ] Trinity 流式对话（无 tools）  
- [ ] 模型设置页（Key / URL / model id）  

**验收**：输入问题，Trinity 流式回复；usage 可选展示。

### P1 · 能动手（+3～4 周）

- [ ] Agent Loop + `supportsToolCall` 模型  
- [ ] MCP stdio：filesystem 预置  
- [ ] Tool 调用过程 UI（进行中 / 完成 / 失败）  

**验收**：「列出工作目录文件并总结」类任务跑通。

### P2 · 连接器（+4～6 周）

- [ ] 连接器管理页（列表、开关）  
- [ ] `mcp.json` 读写 + 表单添加  
- [ ] 新 MCP 首次批准  
- [ ] HTTP/SSE MCP（至少一种）  

**验收**：用户自行添加一个社区 MCP Server 并在对话中被调用。

### P3 · 可日用（+3～4 周）

- [ ] 工作目录设置与权限提示  
- [ ] 本地会话历史、多会话  
- [ ] 步数上限、错误降级文案  
- [ ] 写操作二次确认（删/覆盖文件类）  

**验收**：关闭重开保留历史；超步数有明确提示。

### P4 · 可分发（+3～4 周）

- [ ] macOS / Windows 签名打包  
- [ ] 自动更新（可选）  
- [ ] 内测渠道 + 崩溃日志（本地/可选上报）  
- [ ] 对外 **Cookbook：《Trinity 桌面工作台》**  

**验收**：非研发同事可安装并完成 P1 验收用例。

---

## 九、团队与工期粗估

### 9.1 人力假设（MVP = P0～P4）

| 角色 | 人数 | 主要职责 |
|------|------|----------|
| 客户端 / 前端 | 1～2 | Tauri、Vue、聊天、连接器 UI |
| 后端 / Agent | 1 | Loop、MCP Client、存储 |
| PM | 0.5 | 范围、验收、安全规则 |
| 设计 | 0.2 | 关键屏（可复用 Trinity token） |

**合计日历时间**：约 **3～5 个月** 到 P4；**6～8 周** 到 P1 可演示。

### 9.2 与 SuperAgent / CowAgent 文档的并列关系

| 文档路线 | 适用场景 |
|----------|----------|
| [SuperAgent + CowAgent](./SuperAgent-自建可行性评估与CowAgent集成.md) | IM 超级助理、Python 栈、LinkAI 对标 |
| **本文（桌面工作台）** | **桌面 + MCP + Trinity 品牌** |
| [Agent SDK 讨论稿](../../apps/trinity-product/docs/ai-api-platform/agent/agent-sdk-product-design.md) | 开发者库、无 UI |

三条可 **共存**：SDK 抽共用 Loop；桌面是 SDK 之上的产品壳。

---

## 十、路线对比与选型

```text
需求是什么？
├─ 只要验证「桌面 Agent + Trinity 模型」
│   └─ → 先用现成 WorkBuddy + Cookbook（零研发）
│
├─ 要 Trinity 品牌桌面 + MCP 扩展
│   └─ → 本文 MVP（3～5 月）
│
├─ 要 IM 机器人 / 记忆 / 超级助理
│   └─ → CowAgent 集成路线，不是桌面 MCP 轻量版
│
└─ 要开发者在自己代码里编排
    └─ → Agent SDK，不做桌面
```

| 方案 | 难度 | 周期 | Trinity 品牌 |
|------|------|------|-------------|
| WorkBuddy + Trinity 模型 | ⭐ | 天级 | 否 |
| **Trinity 桌面工作台 MVP** | ⭐⭐⭐⭐ | 3～5 月 | **是** |
| CowAgent + Trinity | ⭐⭐⭐ | 1～6 月 | 可 OEM |
| LinkAI 级 SuperAgent | ⭐⭐⭐⭐⭐ | 年级 | 可 |

---

## 十一、风险与评审清单

### 11.1 安全风险

| 风险 | 缓解 |
|------|------|
| MCP 恶意 Server | 首次批准 + 仅用户显式添加 |
| 文件误删 | 工作目录限制 + 写操作确认 |
| Key 泄露 | Keychain 存储；禁止写进日志 |
| 任意 HTTP MCP | 提示「仅信任来源」 |

### 11.2 产品 / 商业

| 问题 | 建议结论 |
|------|----------|
| 和 WorkBuddy 是否竞争？ | 对外：**Trinity 模型 + 可选自有/workbench 或第三方桌面** |
| 是否替代 API 主航道？ | **否**；桌面消费 API |
| 企业审计 | MVP 本地日志；二期对接 Account 审计 |

### 11.3 立项前 6 问

1. MVP 目标用户：**内部效率** 还是 **对外 SKU**？  
2. 是否 **必须** Win + Mac 同时首发？  
3. MCP 预置几个、是否允许用户任意 `npx`？  
4. 模型是否 **锁 Trinity**（不允许 Ollama）？  
5. 与 **Agent SDK** 是否同一团队、共用 npm 包？  
6. P4 前是否接受 **仅内测、不对外承诺 SLA**？  

---

## 附录

### A. 模型配置示例（App 内，非 WorkBuddy 路径）

```json
{
  "provider": "trinity",
  "baseUrl": "https://api.trinitydesk.ai/v1/chat/completions",
  "apiKey": "xh-***",
  "model": "gpt-5.5",
  "supportsToolCall": true,
  "maxSteps": 12
}
```

存储建议：`~/.trinity-workbench/settings.json`（Key 用系统密钥链，不落明文文件）。

### B. 参考链接

| 资源 | URL |
|------|-----|
| WorkBuddy 连接器 | https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Connector |
| WorkBuddy MCP 说明（腾讯云社区） | https://cloud.tencent.com/developer/article/2698011 |
| MCP 规范 | https://modelcontextprotocol.io/ |
| Trinity WorkBuddy Cookbook | [workbuddy.md](../../apps/trinity-docs/docs/cookbook/agent-workbench/workbuddy.md) |
| SuperAgent 可行性 | [SuperAgent-自建可行性评估与CowAgent集成.md](./SuperAgent-自建可行性评估与CowAgent集成.md) |

---

*维护：立项结论、技术栈选型或 P 阶段验收变更时更新本文。*

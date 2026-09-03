# Super Agent 自建可行性评估 · 与 CowAgent 集成方案

> **文档类型**：产品 / 架构 · **内部评审用**  
> **版本**：v1.0 · 2026-09-02  
> **关联文档**：[Trinity-桌面工作台-MVP方案](./Trinity-桌面工作台-MVP方案.md) · [LinkAI-超级AI助理-产品分析](./LinkAI-超级AI助理-产品分析.md) · [AI-API聚合平台-产品全景与介绍](./AI-API聚合平台-产品全景与介绍.md) · [大模型训练三阶段与聚合平台定位](./大模型训练三阶段与聚合平台定位.md) · [Agent SDK 产品设计（讨论稿）](../../apps/trinity-product/docs/ai-api-platform/agent/agent-sdk-product-design.md)  
> **说明**：评估「做类似 LinkAI 超级 AI 助理」的难度、路线与是否采用开源 CowAgent；**非**立项批复，工期为粗估。

---

## 文档目录

| 章 | 内容 |
|----|------|
| [一、结论摘要](#一结论摘要) | 难度分级、能否用 CowAgent、推荐路线 |
| [二、我们要做的是什么](#二我们要做的是什么) | 对标范围、与现产品边界 |
| [三、难度拆解](#三难度拆解) | 模块 × 难度 × 现能力复用 |
| [四、四条可选路线](#四四条可选路线) | 完整对标 / MVP / Agent SDK / CowAgent 集成 |
| [五、能否使用开源 CowAgent](#五能否使用开源-cowagent) | 协议、用法、限制、与 LinkAI 关系 |
| [六、推荐集成架构（Trinity + CowAgent）](#六推荐集成架构trinity--cowagent) | 分工、配置、仍须自建部分 |
| [七、分期里程碑与团队粗估](#七分期里程碑与团队粗估) | PoC → MVP → 增强 |
| [八、风险与决策清单](#八风险与决策清单) | PM / 法务 / 技术评审项 |
| [九、与 Agent SDK 讨论稿的关系](#九与-agent-sdk-讨论稿的关系) | 并行还是取舍 |
| [附录：参考链接](#附录参考链接) | CowAgent、LinkAI、内部文档 |

---

## 一、结论摘要

### 1.1 难度大不大？

| 目标 | 难度 | 粗周期（成熟团队） | 与现 Trinity 主航道关系 |
|------|------|-------------------|------------------------|
| **A. 完整对标 LinkAI**（云电脑 + 桌面 + 万级技能 + 全 IM + 自进化） | ⭐⭐⭐⭐⭐ 极高 | 2～3 年+ | **新产品线**，仅部分复用 API/计费 |
| **B. 可卖 MVP**（Web 助理 + 基础工具 + 记忆 + Trinity API） | ⭐⭐⭐⭐ 高 | 6～12 个月 | 增值 SKU / 演示，非主航道 |
| **C. Trinity Agent SDK**（多轮 tool loop，循环在客户端） | ⭐⭐⭐ 中高 | 3～6 个月 | **与现讨论稿一致**，赋能客户自建 Agent |
| **D. Trinity API + CowAgent 集成**（Harness 开源，模型/计量自建） | ⭐⭐ 中 | PoC 1～3 月；可演示 6 月 | **推荐优先评估** |

**一句话**：完整做成 LinkAI 那样 **很难**；**用 CowAgent 做 Harness、Trinity 做模型与计费** 是可行且 MIT 允许的商业路径，但 **托管、治理、品牌、IM 运维** 仍要自己做。

### 1.2 能不能用开源 CowAgent？

**可以。** CowAgent 在 GitHub 上声明为 [**MIT License**](https://github.com/zhayujie/CowAgent)（截至 2026-09 仓库 metadata），允许：

- 商业使用、修改、再分发  
- 集成进 Trinity 产品或交付给客户（含私有化）  
- Fork 后改 UI/渠道/模型接入  

**须遵守**：保留 MIT 版权声明与许可全文；**不能**暗示与 CowAgent/LinkAI 官方合作（商标与宣传需法务过目）。  
**须自建**：多租户托管、与 Trinity 计量/密钥打通、企业治理、SLA、部分渠道合规——**MIT 不包这些**。

### 1.3 推荐路线（内部建议）

```text
短期（评审用）
  └─ 路线 D：CowAgent + Trinity OpenAI-compatible API → 2～4 周 PoC

中期（若立项）
  ├─ 路线 C 与 D 可并行：SDK 服务开发者；CowAgent 服务「要开箱助理」的客户
  └─ 路线 B 仅当有明确 IM/助理 SKU 需求时再扩

长期
  └─ 路线 A 不建议作为 API 聚合主航道目标；除非单独立项、独立预算
```

---

## 二、我们要做的是什么

### 2.1 对标对象

[LinkAI 超级 AI 助理](https://link-ai.tech/product/agent) 详见 [LinkAI-超级AI助理-产品分析](./LinkAI-超级AI助理-产品分析.md)。其核心不是「又一个 Chat」，而是：

- **Agent Harness**：Plan → Tools/Skills → Memory/Knowledge → Channel  
- **双 Runtime**：云端托管 / 桌面客户端  
- **平台一体化**：Builder、知识库、工作流可「装成技能」  

### 2.2 Trinity 现产品边界

[AI-API聚合平台-产品全景与介绍](./AI-API聚合平台-产品全景与介绍.md) 明确：

- **主航道**：统一 API 网关、多模型路由、计量计费、密钥与租户治理  
- **不是**：自研大模型、完整 Agent 托管平台（边界说明中终端对话与 API 线可并列，但未定义 SuperAgent 规格）  

现工程与 **SuperAgent 重叠** 约 **20%～30%**：

| 已有或可复用 | 尚未具备 |
|-------------|----------|
| 多模型 API、OpenAI 兼容调用 | 托管 Agent Runtime（长驻进程 + 工作空间） |
| 密钥、计量、路由、运营后台 | OS 级 Tools（终端/浏览器/云电脑隔离） |
| 租户 Account 控制台 | Memory/Knowledge 产品化与 UI |
| `trinity-ai` 对话页（若启用） | IM 全渠道（微信等）长期运维 |
| Agent SDK **讨论稿**（薄 SDK） | Skills 市场 / 万级生态 |

### 2.3 战略要先答的一问

**客户要买的是「调 API 自己搭 Agent」，还是「买一个超级助理」？**

- 前者 → 路线 **C**（Agent SDK）+ 文档/Cookbook 即可，与 CowAgent **可选共存**（客户自部署 CowAgent + Trinity API）  
- 后者 → 路线 **D/B**，必须解决 **Runtime + 渠道 + 安全**  

---

## 三、难度拆解

> **图类型**：模块难度矩阵

```text
                    现 Trinity 复用度
                    低 ←──────────→ 高
              ┌─────────────────────────────┐
     极高     │ IM 渠道(微信等)  Skills 生态   │
              │ 云电脑隔离       Evolution    │
              ├─────────────────────────────┤
     高       │ 浏览器/终端 Tool  桌面客户端   │
              │ 托管多租户 Runtime            │
              ├─────────────────────────────┤
     中       │ Memory/Knowledge UI          │ Agent SDK
              │ 飞书/钉钉单渠道               │ 计量打通
              ├─────────────────────────────┤
     低       │                              │ 多模型 API
              │                              │ 密钥/路由/账单
              └─────────────────────────────┘
```

| 模块 | 难度 | 说明 | 现能力 |
|------|------|------|--------|
| **Model 层** | 低 | OpenAI-compatible 已有 | ✅ 核心卖点 |
| **Agent SDK（客户端 Loop）** | 中 | 与 OpenRouter 对齐 | 📋 讨论稿 |
| **CowAgent 集成（自部署 Harness）** | 中 | 配置 `open_ai_api_base` 指 Trinity | 🔶 未做 |
| **计量与 CowAgent 步数联动** | 中 | 按 usage 汇总；步数上限产品化 | 🔶 部分有 usage |
| **托管 Runtime（一租户一实例）** | 高 | K8s/VM、工作空间、扩缩容 | ❌ |
| **OS Tools + 沙箱** | 高 | 终端/文件/浏览器；安全隔离 | ❌ |
| **桌面客户端** | 高 | macOS/Windows 打包与更新 | ❌ |
| **IM 渠道** | 高～极高 | 微信等非标接口维护成本高 | ❌ |
| **Skills 生态** | 极高 | 时间 + 运营，非一次性工程 | ❌ |
| **企业治理（审计/HITL/条线）** | 中高 | B2B 必写；CowAgent 有权限档但不够政企 | 🔶 API 侧有 |

---

## 四、四条可选路线

### 4.1 路线 A — 完整对标 LinkAI

**包含**：云电脑、桌面、全渠道、Skill 广场、Evolution、Builder 一体。  

**难度**：⭐⭐⭐⭐⭐  
**结论**：仅当 **单独立项、明确 ToC/小 B IM 市场** 时考虑；与 API 聚合 **组织与商业模式** 差异大。

### 4.2 路线 B — Trinity Assistant MVP（自研 Harness）

**最小集合**：

1. Web 对话 + Agent Loop  
2. 3～5 个 Tools（HTTP、文档 RAG、**不上终端**）  
3. 会话记忆 + 步数/费用上限  
4. 接 Trinity 计量  

**不含**：微信、云电脑、Evolution、Skill 市场。  

**难度**：⭐⭐⭐⭐ · **6～12 月** · 后端 Agent 2～3 + 前端 1 + PM 1  

**与 CowAgent 关系**：自研 Harness 与 CowAgent **二选一**，除非只做极薄外壳。

### 4.3 路线 C — Trinity Agent SDK（现讨论稿方向）

**原则**（见 [Agent SDK 产品设计](../../apps/trinity-product/docs/ai-api-platform/agent/agent-sdk-product-design.md)）：

- **薄 Agent SDK，厚网关**  
- `callModel` + tools 循环在 **客户端**  
- 网关 **不** 新增 `/agent/run`  

**难度**：⭐⭐⭐ · **3～6 月**  
**与 LinkAI**：不正面竞争；**赋能** ISV 与客户自建 Agent。  

**文档可写**：「使用 CowAgent 自部署 + Trinity API 作为模型后端」作为 **集成示例**。

### 4.4 路线 D — Trinity API + CowAgent 集成（推荐 PoC）

**分工**：

| 层 | 负责方 |
|----|--------|
| 模型、密钥、计量、路由 | **Trinity** |
| Harness（Plan/Memory/Tools/Skills/Channel） | **CowAgent**（部署形态可选） |
| 多租户控制台、企业审计 | **Trinity 定制**（增量开发） |

**难度**：⭐⭐ · PoC **2～4 周**；可演示 **3～6 月**  

---

## 五、能否使用开源 CowAgent

### 5.1 许可证结论（PM / 法务速读）

| 项 | 说明 |
|----|------|
| **许可证** | **MIT License**（[CowAgent 仓库](https://github.com/zhayujie/CowAgent)） |
| **商业使用** | ✅ 允许 |
| **修改与私有化交付** | ✅ 允许 |
| **闭源二次开发** | ✅ 允许（须在发行物中保留 MIT 声明） |
| **义务** | 保留版权与许可声明；**无**强制开源你的改动 |
| **商标** | 「CowAgent」「LinkAI」为对方品牌；对外产品应使用 **Trinity 品牌**，避免「官方合作」未授权表述 |
| **建议** | 立项前法务 **书面确认** 一次；升级 CowAgent 版本时核对 LICENSE 未变更 |

> MIT 是商业友好协议；LinkAI 本身即基于 CowAgent 开源做商业托管，从协议角度 **不阻止** Trinity 走类似「开源 Harness + 自有 API/计费」路径。

### 5.2 CowAgent 是什么、不是什么

| 是 | 不是 |
|----|------|
| 完整 **Agent Harness** 参考实现 | LinkAI 云端 **多租户 SaaS 控制台** 的开源等价物 |
| 支持 **OpenAI 兼容** 自定义 `api_base` | Trinity **计量/租户** 的即插即用插件（需集成） |
| 多渠道（微信/飞书/钉钉等）适配代码 | 微信等渠道的 **合规授权** 保证 |
| Memory / Knowledge / Skills / Tools 文件体系 | 企业级 **审计/HITL/FinOps** 完整产品 |

### 5.3 与 LinkAI 的商业关系

- CowAgent README 中 **推荐 LinkAI 托管**——这是社区导流，**不限制** 你改用 Trinity API。  
- LinkAI **企业版/私有化** 与「自部署 CowAgent + 自接 API」是 **竞品关系**，不是法律限制。  
- 若客户已买 LinkAI，再卖 Trinity API，是 **模型层竞合**；若卖「Trinity 私有化部署 CowAgent 版助理」，需差异化 **治理、集采、线路、政企服务**。

### 5.4 三种使用方式（由浅到深）

| 方式 | 做法 | 工作量 | 适用 |
|------|------|--------|------|
| **① 文档/integration** | 客户自装 CowAgent，`api_base` 指向 Trinity | 很小 | 开发者生态、售前 Demo |
| **② 镜像/Helm 交付** | 维护 Trinity 定制 Docker/配置模板 + CowAgent 上游 | 中 | 私有化招标、POC |
| **③ Fork 深度定制** | Fork 改 UI、渠道、鉴权、审计钩子 | 大 |  OEM / 行业助理 SKU |

**不必从零重写 Harness**；深度定制时建议 **跟踪上游版本**，避免 fork 漂太远无法合并安全补丁。

### 5.5 接 Trinity API 的配置要点

CowAgent 支持 OpenAI 兼容接入（[模型概览](https://docs.cowagent.ai/zh/models)）：

```json
{
  "bot_type": "openai",
  "model": "trinity-上登记的-model-id",
  "open_ai_api_base": "https://<trinity-gateway>/v1",
  "open_ai_api_key": "xh-..."
}
```

**集成检查项**：

- [ ] `tools` / `tool_choice` / 流式与 Trinity 网关行为一致  
- [ ] `usage` 回传可用于 CowAgent 侧 **步数/费用展示**（与 Agent SDK `maxCost` 同源策略）  
- [ ] `X-Conversation-Id` 等多轮键在 Agent 长任务中 **固定传递**（见工程师 API 参数说明）  
- [ ] 模型 ID 与运营后台 **上下架** 同步  

### 5.6 用 CowAgent 仍绕不开的工作

即使 **100% 采用 CowAgent 代码**，Trinity 若要以 **自己的品牌** 卖「超级助理」，仍须建设：

| 类别 | 内容 |
|------|------|
| **产品** | Trinity 控制台创建助理、选模型、看用量；与 Account 租户体系统一 |
| **托管** | 若做「云端助理」：每实例隔离、资源配额、7×24 运维（CowAgent 开源不管 SaaS） |
| **安全** | 行动护栏、HITL、审计日志入库；政企方案见 [§4.7 护栏专节](./大模型训练三阶段与聚合平台定位.md#47-安全护栏-guardrails-pm-专节) |
| **计费** | 云电脑（若有）+ Token 双计费；与现有套餐/积分对齐 |
| **渠道** | 选用 1～2 个渠道深度支持即可；微信需单独评估合规 |
| **支持** | 版本升级、Skill 兼容、故障排查 |

**CowAgent 解决的是「Agent 怎么跑」；Trinity 仍要解决「怎么卖、怎么管、怎么合规」**。

### 5.7 不适用 CowAgent 的情况

- 只要 **API + SDK**，客户自己编排 → **路线 C** 即可，无需引入 CowAgent 依赖  
- 要求 **纯 Web Workflow、无 OS Tool** 的政企审核链 → [Agentic Workflow + RAG + HITL](./大模型训练三阶段与聚合平台定位.md) 可能更合适，CowAgent 偏「开放 Loop」  
- 无法接受 **Python 技术栈**（CowAgent 主栈）与 **上游发版节奏** → 考虑自研薄 Harness 或换 TS 系框架（Mastra 等），但失去 IM 与 Skills 现成实现  

---

## 六、推荐集成架构（Trinity + CowAgent）

### 6.1 逻辑架构

```text
┌────────────────────────────────────────────────────────────┐
│  Trinity 产品层（待建 / 增量）                               │
│  · 租户控制台：创建助理、选模型、配额、账单                    │
│  · 企业治理：审计、HITL 策略（可选 webhook 进 CowAgent）     │
└───────────────────────────┬────────────────────────────────┘
                            │  provisioning / API Key
                            ▼
┌────────────────────────────────────────────────────────────┐
│  CowAgent Runtime（开源 · 自部署 / 托管）                    │
│  Channel → Plan → Tools/Skills → Memory/Knowledge          │
└───────────────────────────┬────────────────────────────────┘
                            │ OpenAI-compatible
                            ▼
┌────────────────────────────────────────────────────────────┐
│  Trinity API 网关（已有）                                    │
│  鉴权 · 路由 · 计量 · 线路 · 审计（调用侧）                   │
└────────────────────────────────────────────────────────────┘
```

### 6.2 与 LinkAI 模式的差异（刻意选择）

| LinkAI | Trinity + CowAgent（建议） |
|--------|---------------------------|
| 模型 + Harness + 托管一体 | **模型/计费强**，Harness **开源集成** |
| C 端 / 小 B 助理为主 | **B2B API 客户** + 可选助理 SKU |
| 100+ 模型 + LinkAI 积分 | Trinity 线路/集采/企业合同 |
| 全渠道 | **先 Web + 可选飞书**，不追求 10+ 渠道首发 |

### 6.3 PoC 验收标准（路线 D · 2～4 周）

1. 单机 Docker 跑 CowAgent，`open_ai_api_base` → Trinity 测试环境  
2. Web 或 CLI 完成一条 **多步 tool** 任务（如：搜索 → 写文件 → 总结）  
3. Trinity 后台可见 **该 Key 的 usage 增长**  
4. 文档一页：《客户如何用 CowAgent + Trinity API》  

---

## 七、分期里程碑与团队粗估

### 7.1 路线 D + C 并行（推荐）

| 阶段 | 交付 | 周期 | 人力（粗估） |
|------|------|------|-------------|
| **P0 PoC** | CowAgent + Trinity API 打通 + 内部 Demo | 2～4 周 | 后端 1 + 运维 0.5 |
| **P1 集成包** | Helm/Docker、配置模板、Cookbook、计量说明 | 1～2 月 | 后端 1 + 技术写作 0.5 |
| **P1 SDK** | `@trinity/agent` v0.1（`callModel` + `stepCountIs`） | 2～4 月 | 后端 1～2 |
| **P2 控制台** | 租户侧「创建助理」壳 + 用量看板（可不托管） | 3～6 月 | 全栈 2 + PM 1 |
| **P3 托管** | 单租户单容器、配额、基础审计 | 6～12 月 | 平台 2～3 + SRE |

### 7.2 路线 B 自研 MVP（若不采用 CowAgent）

在 P2 之后若仍要 **完全自有 Harness**，工期在 P3 基础上 **+6 月+**，且 IM/Tools 能力仍落后于 CowAgent 社区。**除非有强合规或技术栈硬约束，一般不优先**。

---

## 八、风险与决策清单

### 8.1 决策树：要不要上 CowAgent？

```text
问：我们卖的是「API」还是「开箱助理 SKU」？
├─  primarily API / ISV 自建
│   └─ → 路线 C（Agent SDK）+ 文档示例「可选 CowAgent」
│
└─  要明确卖「助理 / IM 机器人 / 私有化 Harness」
    ├─ 能接受 Python 栈 + 跟踪上游
    │   └─ → ✅ 路线 D（CowAgent 集成）
    └─  必须全栈 TS / 完全自控 IP
        └─ → 路线 B 或换 TS Agent 框架（成本高）
```

### 8.2 风险表

| 风险 | 等级 | 缓解 |
|------|------|------|
| CowAgent 上游 Breaking Change | 中 | 锁定版本；CI 冒烟；留集成测试 |
| MIT 合规遗漏声明 | 低 | 法务清单；关于页/NOTICE 文件 |
| 商标/宣传碰瓷 LinkAI | 中 | 统一 Trinity 品牌话术 |
| OS Tool 安全事故 | 高 | 默认只读/工作区可写；容器；HITL |
| 微信等渠道封号 | 高 | 首发不做；或仅企业合规接口 |
| 与「薄 SDK」战略冲突 | 中 | 定位清晰：SDK=开发者；CowAgent=交付/演示/私有化 |
| 托管成本超预期 | 高 | P0～P2 不做云电脑；仅客户自部署或私有化项目制 |

### 8.3 评审会必问 6 题

1. 助理 SKU 的 **目标客户** 是谁？与 API 客户重叠度？  
2. **谁运维** CowAgent 实例（客户 / Trinity / 集成商）？  
3. 计费模型：**纯 Token** 还是 **Token + Runtime**？  
4. 政企是否要求 **行动护栏 + 审计**？CowAgent 默认权限是否收紧？  
5. 是否 **Fork** 还是 **纯配置集成**？  
6. 与 LinkAI 的 **市场话术**：打「可私有化 Harness + Trinity 模型与集采」？  

---

## 九、与 Agent SDK 讨论稿的关系

| 维度 | Agent SDK（路线 C） | CowAgent 集成（路线 D） |
|------|---------------------|-------------------------|
| **Runtime 位置** | 客户进程 / 应用内 | CowAgent 独立进程 |
| **网关新增接口** | 否 | 否（仍 chat/completions） |
| **目标用户** | 开发者写代码 | 运维部署、私有化交付、Demo |
| **冲突** | 无 | 无——**互补** |

**建议表述**：

> Trinity **官方开发者路径**：Agent SDK + HTTP API。  
> Trinity **官方交付/私有化路径（可选）**：CowAgent + Trinity API + 集成文档/Helm。  
> 二者共用同一套 **密钥、计量、模型目录**。

---

## 附录：参考链接

| 资源 | URL |
|------|-----|
| CowAgent GitHub（MIT） | https://github.com/zhayujie/CowAgent |
| CowAgent 架构文档 | https://docs.cowagent.ai/zh/intro/architecture |
| CowAgent 模型 / OpenAI 兼容配置 | https://docs.cowagent.ai/zh/models |
| LinkAI 超级 AI 助理 | https://link-ai.tech/product/agent |
| 内部分析：LinkAI 产品 | [LinkAI-超级AI助理-产品分析](./LinkAI-超级AI助理-产品分析.md) |
| 内部：Agent SDK 讨论稿 | [agent-sdk-product-design.md](../../apps/trinity-product/docs/ai-api-platform/agent/agent-sdk-product-design.md) |
| 内部：API 参数（Conversation-Id 等） | [API对外接口支持参数.md](../00-协作与工作流/工程师/API对外接口支持参数.md) |

---

*维护：CowAgent 大版本升级、Trinity 网关兼容变更或立项结论变化时更新本文；MIT 与商标结论以法务复核为准。*

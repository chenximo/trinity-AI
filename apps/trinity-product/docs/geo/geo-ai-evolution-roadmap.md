---
title: GEO AI 演进路线图
---

# GEO · AI 演进路线图

> **文档类型**：产品规划真源——从「零 LLM 产品能力」到 **C 类 Agent 写稿执行** 的分阶段路径。  
> **读者**：产品、架构、研发负责人；与 [大模型训练三阶段与聚合平台定位](../../../docs/05-产品与PRD/大模型训练三阶段与聚合平台定位.md) 对照阅读。  
> **关联**：[大模型训练三阶段 · §5.16 GEO 场景对照](../../../docs/05-产品与PRD/大模型训练三阶段与聚合平台定位.md#516-垂直-saas-案例对照geo生成式引擎优化) · [产品设计分析 · §0.7 业界 AI 应用](./product-design-analysis#industry-ai-in-geo) · [业务全景 · 程序化 vs AI](./business-landscape#哪些环节是程序化哪些常接-ai) · [业界计费与套餐](./geo-billing-industry) · [Agent 多平台发文](./agent-multi-platform-publishing) · [Tier 1 · Agents](./competitor-research/tier1-deep-dive#profound)  
> **状态**：草案 · 2026-09-02  
> **工程现状**：控制台 Vue 已迁入（`apps/trinity-geo`）；**规则与采集 API 未接**；**geo-intelligence（LLM）未建**

---

## 1. 终局与边界

### 1.1 终局（C 类）

对齐 [产品设计分析 · §0.7.2](./product-design-analysis#industry-ai-in-geo) 与 [Profound · F8 Agents](./competitor-research/tier1-deep-dive#profound)：

| 能力 | 说明 |
|------|------|
| **监测 + Opportunities** | 规则发现缺口（D\*+S\*+信源盘），非 LLM 打分 |
| **创生 Agent** | 简报 / FAQ / doc 大纲 / 证据块草稿 |
| **执行** | 发布到 doc/CMS + 可选一级 API 分发（见 [agent-multi-platform-publishing](./agent-multi-platform-publishing)） |
| **验证闭环** | 自动 R2 采集 → 信源盘 Δ → SOA Δ → 回写策略 |

**原则**（§0.7.6）：测量与 D/S 标签 **永不由 LLM 改写**；LLM 输出默认 **草稿态 + HITL**；验收看 **指标 Δ**。

### 1.2 不是什么

- 不做预训练 / SFT / 对齐（见 [训练三阶段文档](../../../docs/05-产品与PRD/大模型训练三阶段与聚合平台定位.md) §三）
- 不把「企业 RAG 知识库」当 GEO 主产品（玩法 3，P1/P2 延伸）
- 不在专业版默认宣传「无人值守全自动发稿」

---

## 2. B / C 类与套餐：文档真源（必读）

> **纠偏**：**B 类对齐专业版 $79，不是企业版。** 上一轮讨论中「B、C 都放企业版」**不符合现有手册**；以下引用为准。

| 概念 | 文档出处 | 原文要点 |
|------|----------|----------|
| **A/B/C 三类 SaaS 形态** | [product-design-analysis · §0.7.2](./product-design-analysis#industry-ai-in-geo) | A 监测型 · **B 监测+机会（Peec）** · **C 监测+机会+执行（Profound Agents）** |
| **$79 = B 类全功能** | 同上 §0.7.2 | 「Trinity 目标带 **$79/月** 应对齐 **B 类全功能 + 双市场**」 |
| **C 类价位带** | 同上 §0.7.2、§0.7.4 | 「**C 类** 真实起点多在 **$300+/月**」；Agent 执行标 **P2 · 企业版** |
| **Profound Agents 仅在高档** | [tier1-deep-dive · Profound F8](./competitor-research/tier1-deep-dive#profound) | 企业版 Agent 写简报→文章→着陆页；Starter $99 实用不足，**$399** 起 |
| **Trinity Agents 优先级** | [tier1-deep-dive · 策略表](./competitor-research/tier1-deep-dive) | Agents 自动内容生成 = **P2**，研发成本高 |
| **专业版 / 企业版配额** | [geo-billing-industry · §8.2](./geo-billing-industry#82-建议套餐矩阵示例) | 专业版：日采、10 平台目录、100 题上限等；企业版：**定制**（未逐条写 Agent，需本路线图补） |

### 2.1 建议套餐与 AI 深度（本路线图拍板草案）

| 套餐 | 产品形态 | AI 演进阶段（见 §3） | 说明 |
|------|----------|----------------------|------|
| **试用** | 监测样本 | 阶段 0→1 部分 | 5 平台启用；无 Agent |
| **专业版 $79/月** | **B 类全功能** | 阶段 **1 完整** + 阶段 **2 轻量** | 日采 + 规则诊断 + **AI 草稿/解读**（HITL） |
| **企业版**（定价待拍板，对标 $300–400+） | **C 类** | 阶段 **3–4** | Workflow 发布 + **GEO Agent 包**；可调 HITL / 全自动 |

商用定价以 [geo-billing-industry](./geo-billing-industry) 与财务确认为准；**企业版 Agent 能力需在定价页单独列出**（当前 §8.2 矩阵仅写配额，未写 AI 功能行——待补）。

---

## 3. 演进阶段 0 → 4

```text
阶段 0  现在          UI + Mock，无真采集、无 LLM 产品能力
阶段 1  消耗 AI       监测采集（调各平台模型，走 Trinity 网关）
阶段 2  生成 AI       解读 + 草稿（单次 LLM，HITL）
阶段 3  流程 AI       草稿 → 审批 → 发布 → 预约 R2
阶段 4  闭环 Agent    Observe → Plan → Act → Verify → 再 Observe
```

| 阶段 | 交付物 | 用户感知 | 套餐 |
|:----:|--------|----------|------|
| **0** | `trinity-geo` 控制台五件套、Q00 走查 | 演示可用 | 当前 |
| **1** | `collection_jobs`、`raw_answers`、`cited_urls`、规则 SOA/D/S、`GET /diagnosis` | 「数据是真的」 | 专业版 P0 |
| **2** | `geo-intelligence` 三 Skill + 草稿表 + 优化侧栏 | 「一键出大纲/草稿」 | 专业版 P1 |
| **3** | CMS/doc 连接器、任务状态机、自动 R2 调度 | 「点发布就能验」 | 企业入门 |
| **4** | Agent Orchestrator、分发连接器、治理护栏 | 「包一条优化闭环」 | 企业版 C 类 |

**关键依赖**：阶段 2 以前必须完成阶段 1；否则 LLM 只能生成空泛 FAQ。

---

## 4. 阶段 1：真数据（几乎无「产品 AI」）

### 4.1 后端

| 模块 | 职责 |
|------|------|
| `geo-collector` | 日采调度；消费 **Trinity API 网关** 调海外模型；豆包等国内通道按采集方案 |
| `geo-annotator` | 别名库 + 规则引擎 → `annotations`（SOA、CCR、情感、D\*） |
| `geo-citation-parser` | `cited_urls[]`、域分类、M/N |
| `geo-diagnosis` | D1–D5 + S1–S6；真源对齐 [diagnosis.json](../../../trinity-geo-prototype/mvp/data/r1/diagnosis.json) |
| `geo-core-api` | 控制台 CRUD、指标查询 |

### 4.2 里程碑

- Q00 · 豆包 · R1：规则产出 **D1+S1+S2+S3**，与原型一致  
- 控制台 `mock.ts` 逐步换 API  
- **第一类「AI」**：被监测对象（各平台大模型），不计入「AI 功能」营销

---

## 5. 阶段 2：生成 AI（专业版 P1）

### 5.1 服务：`geo-intelligence`

所有 LLM 调用统一经 **Trinity 网关**（计量、审计、路由、护栏）。

| Skill ID | 触发位置 | 输入（结构化） | 输出 |
|----------|----------|----------------|------|
| `interpret-diagnosis` | 诊断详情侧栏 | `diagnosis_ids[]`, `gap_ids[]`, `cited_urls` 分类, 竞品 SOA | 解读短文 + 优先动作（**不改 D/S**） |
| `draft-doc-outline` | optimize-detail | 对标 URL、S\*、audit 因子 | H2/H3 目录、证据块占位 |
| `draft-evidence-block` | audit 明细 | 页面 URL、因子分、缺口类型 | 3 条可引用事实句 |

### 5.2 数据模型

```text
optimize_task
  ├─ rule_snapshot     # D*+S*+benchmark_urls（只读）
  ├─ draft_content     # LLM 输出
  ├─ status            # draft | approved | published | verify_scheduled
  └─ publish_target    # doc_path | cms_id | ...
```

### 5.3 里程碑

- opt-s1s2：一键目录草稿 → 人改 → 手工发布（仍可无连接器）  
- 网关账单可归因到 `brand_id` / `task_id`

---

## 6. 阶段 3：执行 Workflow（企业版入门）

| 能力 | 说明 |
|------|------|
| **发布连接器** | doc 站 / Git / Headless CMS Webhook |
| **审批流** | 专业版默认「发布前必审」；企业版可配置自动发布 |
| **验证调度** | 发布后 T+N 自动 R2；结果写 verify |
| **分发（可选）** | [agent-multi-platform-publishing](./agent-multi-platform-publishing) Tier1 API 平台 |

形态：**Agentic Workflow**（固定步骤，LLM 只负责「写」步），不是开放域 Agent。

---

## 7. 阶段 4：GEO Agent 包（企业版 C 类）

### 7.1 四子 Agent（对内架构名）

```text
监测 Agent ──► 决策 Agent ──► 创生 Agent ──► 验证 Agent
   │              │              │              │
   └──────────────┴──────────────┴──────────────┘
                    治理层（HITL · 品牌护栏 · 成本上限 · 审计）
```

| Agent | 职责 | 阶段 4 前是否已有 |
|-------|------|-------------------|
| 监测 | 调度、失败告警、异常 SOA | 阶段 1 |
| 决策 | Opportunities 排序（规则+ROI 启发式，可选 LLM 文案） | 阶段 1 规则 |
| 创生 | 调用 §5 Skill 写稿 | 阶段 2 |
| 验证 | R2 + Δ 报告 + 回写下一任务 | 阶段 3 |

### 7.2 「全自动」的产品定义

| 可自动 | 默认需策略/人审 |
|--------|----------------|
| 日采、Opportunities 生成 | 品牌禁区、法务 |
| 按模板生成稿 | 发布（专业版强制 HITL） |
| 触发 R2、Δ 报告 | 是否自动接下一优化项 |
| 一级 API 平台发文 | 微信/知乎等人工渠道 |

企业版可提供 **「自动发布 + 自动 R2 + 自动下一任务」** 开关；专业版仅 **自动起草**。

---

## 8. 与 Trinity 聚合平台的关系

```text
┌─────────────────────────────────────────┐
│  GEO 控制台（六环）                       │
├─────────────────────────────────────────┤
│  geo-core-api（规则·指标·任务）           │
│  geo-collector（采集）                    │
│  geo-intelligence（LLM Skills·Orchestrator）│
├─────────────────────────────────────────┤
│  Trinity API 聚合（密钥·计量·审计·路由）   │
└─────────────────────────────────────────┘
```

叙事：**客户用 Trinity 调模型做应用；GEO 帮客户在这些模型的公域答案里被看见；Agent 写稿仍走同一网关。**

---

## 9. 研发优先级（建议）

| 顺序 | 项 | 阻塞关系 |
|:----:|-----|----------|
| 1 | 采集 + 标注 + 诊断 API | 阻塞一切 AI |
| 2 | 控制台接 API（替换 mock） | 阻塞对外试用 |
| 3 | `geo-intelligence` 三 Skill | 阻塞专业版 AI 卖点 |
| 4 | 优化任务状态机 + 草稿表 | 阻塞 Workflow |
| 5 | 发布连接器 + R2 调度 | 阻塞企业版 |
| 6 | Agent Orchestrator | C 类终局 |

---

## 10. 文档与工程对齐 checklist

- [x] [训练三阶段 · §5.16](../../../docs/05-产品与PRD/大模型训练三阶段与聚合平台定位.md#516-垂直-saas-案例对照geo生成式引擎优化) GEO 场景对照表  
- [ ] [geo-billing-industry §8.2](./geo-billing-industry#82-建议套餐矩阵示例) 增加 **AI 能力行**（草稿 / Agent / HITL）  
- [ ] [product-design-analysis §0.7.6](./product-design-analysis#industry-ai-in-geo) 与本文阶段号互链  
- [ ] [index.md](./index) 注册本文  
- [ ] `apps/trinity-geo` 各模块 README「接 API 时」指向阶段 1 接口  
- [ ] 企业版定价页与 Profound $399 对标表述经商务确认  

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-09-02 | 初稿：阶段 0–4、B/C 与套餐真源、Skill 表、Agent 包、纠偏「B 类不在企业版」 |

---

*C 类终局不变；落地顺序强制「先规则数据闭环，再 LLM，再 Agent」。*

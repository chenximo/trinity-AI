# GEO R1 演示叙事 · Trinity × 豆包

> **用途**：对内汇报 / 对外演示「GEO 系统是什么」——基于真实豆包 App 回答。  
> **原问题**：推荐两款 API 聚合平台  
> **采集渠道**：豆包 App（路径 B · 用户实测）  
> **轮次**：R1

---

## 1. 我们在做什么（30 秒）

[Trinity Desk](https://trinitydesk.ai/) 是 **AI API 聚合平台**。GEO 要回答的不是「网站排第几」，而是：

> 当用户在 **豆包** 里问「该用哪个 API 聚合平台」时，**Trinity 有没有进答案、谁占住了叙事、我们该改什么**。

本次 R1 用 **1 条真实品类问法** 跑通六环中的 **规划 → 采集 → 测量 → 诊断 → 优化（待执行）→ 验证（R2）**。

---

## 2. 测量结果（R1）

| 指标 | 结果 |
|------|------|
| 问题 | 推荐两款 API 聚合平台 |
| 品牌 Trinity | **未出现** |
| SOA（进答案正文） | **0%**（0/1） |
| 首推平台 | **OpenRouter**（海外通用聚合首选） |
| 第二推荐 | **腾讯云 TokenHub**（国内企业级） |
| 备选提及 | LiteLLM / One API、硅基流动、Portkey |

**结论一句话**：在豆包这条高价值品类问法上，Trinity **完全失声**；叙事被 OpenRouter + 腾讯云 TokenHub 占据。

---

## 3. 证据摘录（来自豆包回答）

豆包将答案结构化为「两款主推 + 备选」：

1. **OpenRouter** — 「全球最成熟的公有云 LLM 统一 API 网关」「300+ 主流大模型」  
2. **腾讯云 TokenHub** — 「国内大厂官方出品」「合规可开票」  
3. 备选：LiteLLM/One API、硅基流动、Portkey  

全文 **未出现** Trinity、trinitydesk、Trinity AI 等任一别名。

完整原文：`data/r1/Q00-doubao-app.md`

---

## 4. 诊断（规则 D1 · 品类失声 · P0）

| 项 | 内容 |
|----|------|
| 规则 | **D1**：品牌未提及，竞品已进入答案正文 |
| 根因假设 | 公开语料中「API 聚合平台」选型内容以 OpenRouter / 大厂方案为主；Trinity 官网 SPA 正文薄、文档缺「选型/对比」证据块，豆包无法安全引用 |
| 业务影响 | 用户在豆包完成「选型认知」时，**在触达 Trinity 之前已形成首选印象** |

---

## 5. 优化动作（阶段 ⑤ · 待执行）

| ID | 动作 | 负责内容 |
|----|------|----------|
| **A-D1** | 文档 FAQ | 在 [doc.trinitydesk.ai](https://doc.trinitydesk.ai) 新增「API 聚合平台怎么选」：首段定义 + 3 条事实（模型数、协议、计费） |
| **A-D1b** | 对比证据块 | Trinity vs OpenRouter vs 企业级方案（延迟、发票、模型覆盖、服务费）对比表 |
| **A-D2** | 官网可引用性 | 按 [网页测评报告](../../../docs/08-方法论与汇报/trinitydesk-ai-网页测评报告.md)：补 meta description、可抓取 H1/正文，减少纯 SPA 壳 |
| **A-D2b** | 品牌实体 | 全站统一 **Trinity AI / Trinity Desk** + 别名表 |

完成后进入 **R2**：同一问法再采一次，看 SOA 是否从 0% 上升。

---

## 6. 六环闭环示意（本案例）

```
① 规划    Q00 录入问题集（品类词）
② 采集    豆包 App 提问 → 存档 Q00-doubao-app.md
③ 测量    SOA=0%；竞品 OpenRouter+TokenHub
④ 诊断    D1 品类失声 P0
⑤ 优化    A-D1 / A-D2 待办（文档+官网）
⑥ 验证    R2 待跑（优化后 24–72h 再问同一问题）
```

---

## 7. 演示话术（收尾）

> 这不是单次 SEO，而是 **答案经营**：我们先用自家产品 Trinity 在豆包上做了 GEO 体检，发现品类问法上完全失声。系统给出可执行建议，改完文档和证据块后再测一轮，用 SOA 验证有没有进答案。这套能力就是未来 GEO SaaS 的核心——**测得到、说得清、改得了、验得了**。

---

## 8. 工程产物位置

| 文件 | 说明 |
|------|------|
| `config/questions.json` | 含 Q00 及全量 13 题 |
| `data/r1/records.json` | 结构化采集记录 |
| `data/r1/actions.json` | 待办优化项 |
| `reports/r1-summary.md` | 机器生成指标报告 |
| `scripts/collect.mjs` | 批量采集（Trinity API → 豆包模型） |
| `scripts/analyze.mjs` | SOA + 诊断 |

**扩展 R1**：在本地配置 `TRINITY_API_KEY` 后执行：

```bash
node apps/trinity-geo/mvp/scripts/collect.mjs --round R1
node apps/trinity-geo/mvp/scripts/analyze.mjs --round R1
```

---

*R1 基准日：2026-06-16 · 样本 1/13（其余问题待采集）*

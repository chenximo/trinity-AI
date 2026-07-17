---
title: 计费与定价策略 · 目录树与通用流程
---

# 计费与定价策略 · 目录树与通用流程

> **文档类型**：商用计费 **导航真源**——目录树、通用决策流程、业界选型一页、现有文档映射、缺口清单。  
> **读者**：产品、商务、财务、销售、运营（先读本文，再下钻专文）。  
> **关联**：[商用计费总览](./) · [定价策略与证据链](./pricing-strategy-evidence-chain) · [场景 Playlist](./marketing-scene-playlist) · [新人体验](./new-user-trial-scheme) · [PM 手册 · §1.1](../../产品经理工作手册#11-商业化与计费pm-必备模块)  
> **状态**：**已启用 · 导航收敛**（数字以证据链 / Excel 为准；本文不改折数）  
> **日期**：2026-07-16

---

## 0. 怎么用本文

| 你想… | 去哪 |
|-------|------|
| 一眼看「业界几类、我们走哪种」 | **[§1](#industry-choice)** |
| 按通用流程做事（新线可复用） | **[§2](#universal-process)** |
| 找该读哪篇专文 | **[§3 目录树](#doc-tree)** · **[§4 映射表](#doc-map)** |
| 看还缺什么 | **[§5 缺口](#gaps)** |
| 改门槛/折数 | **只改** [证据链](./pricing-strategy-evidence-chain) → 回灌 [Excel SOP](./discount-tier-workbook-sop) |

**两层不要混：**

| 层 | 问的是 | Trinity 主答 |
|----|--------|--------------|
| **A. 结算（Settlement）** | 钱怎么进、调用怎么扣 | **预充值 Credits → 按量扣费** |
| **B. 定价（Pricing）** | 刊例多少、打几折、谁可谈深折 | **刊例按量 + 月消耗用量阶梯**；深折 = 销售/年框 |

---

## 1. 业界有哪几类 · 我们走哪种 {#industry-choice}

### 1.1 结算形态（怎么付 / 怎么扣）

| # | 业界类型 | 代表倾向 | Trinity |
|---|---------|----------|---------|
| A1 | **预充值 + 按量扣费**（Credits / Balance） | OpenRouter、多数 API 聚合 | **✅ 主路径（6.30）** |
| A2 | **后付 / 月结 Invoice** | 云大客、部分企业 API | P1 企业；MVP 可人工调账 |
| A3 | **订阅包月 / 额度包** | ChatGPT Plus、国内 Coding Plan | **暂不做主卖**；场景包另议 |
| A4 | **按 Key / 席位月租** | 少数 B2B 网关 | 不做默认 |

真源：[商用计费总览 §3](./#3-业界怎么做api-聚合--2026-共识) · [行业支付报告](./industry-billing-payment-report)

### 1.2 定价 / 让利形态（怎么定折）

| # | 业界类型 | 交换物 | Trinity |
|---|---------|--------|---------|
| B1 | **刊例 + 纯按量** | 用多少付多少 | **✅ Standard 锚**（原价） |
| B2 | **用量阶梯 / 月耗达档** | 当月消耗 \(Q\) 越大折越深 | **✅ 主路径**（商务六档；对外浅阶梯） |
| B3 | **预承诺 / 年框 / CUD** | 承诺量或预存换深折 | **✅ 大客合同 / 点名包**（不进自助浅表） |
| B4 | **名单价 + 销售议价带** | 带内谈 | **✅ Scale 等操作带** |
| B5 | **在网时长折 / 连续包月越久越便宜** | 用时长换留存 | **❌ 暂不做**（2026-07-16 拍） |
| B6 | **充值加赠叠罗汉** | 充越多送越多 | **❌ 不做**（让利走用量折） |

真源：[证据链 §8.2](./pricing-strategy-evidence-chain#book-and-industry) · 档名 [§3.0](./pricing-strategy-evidence-chain#tier-naming)

### 1.3 一句话选型

```text
结算：预充值 Credits + 按量扣费
定价：刊例按量 + 月消耗用量阶梯（主）
      + 销售议价带 / 年框承诺（深）
不做：订阅主卖、在网时长自动折、充值加赠叠折
对外：浅阶梯公开；深阶梯仅销售卡 / Excel
```

---

## 2. 通用流程（可复用到其他 API / 产品线） {#universal-process}

按顺序走；跳步会导致「页上有折、账上算不清」。

```text
① 主体与合规前提
    → 谁收款、哪里接入、ICP/支付资质是否成立
② 结算主路径拍板
    → 预充 / 后付 / 订阅 三选一作默认（可并行企业例外）
③ 成本真源
    → 上游进价 / 成本折族；多线路 mix 规则
④ 定价护栏
    → 单位 GM 底线、单户月利 Π、最深折天花板
⑤ 用量阶梯设计
    → 达档主体、门槛 Q、档名、对客折、操作带
⑥ 包装切分
    → 自助浅公开  vs  商务深卡  vs  点名包/年框  vs  试用
⑦ 副杆（可选）
    → 缓存命中计价、路由加价等（与账号阶梯拆开核算）
⑧ 支付与账户体验
    → 充值、402、对账、退款政策
⑨ 验证与回灌
    → 样本验证 → 商务 Excel → 控制台/对外页
⑩ 对外叙事
    → Pricing / docs / 销售话术同一套单位与口径
```

| 步 | 产出物（通用） | Trinity 落点 |
|----|----------------|--------------|
| ① | 主体与接入结论 | [总览 §2](./#2-主体接入与-icp计费方案的前置条件) |
| ② | 结算主路径一页 | [总览 §3–4](./#3-业界怎么做api-聚合--2026-共识) · [MVP PRD](./commercial-billing-mvp-prd) |
| ③ | 成本折台账 | [供应商成本折](../pricing-sources/supplier-cost-discounts) · Excel `src_*` |
| ④⑤ | 门槛 × 折 × GM 真源 | **[证据链](./pricing-strategy-evidence-chain)** |
| ⑥ | 浅/深/试用/点名切分 | [Playlist](./marketing-scene-playlist) · [方案卡](./pricing-scenarios-scheme) · [试用](./new-user-trial-scheme) |
| ⑦ | 副杆专文 | [缓存盈利](./cache-billing-profit) |
| ⑧ | 支付/UI/二期 KYC | [MVP 支付](./mvp-openrouter-payment) · [行业报告](./industry-billing-payment-report) · [global-payment](./global-payment) |
| ⑨ | 验证表 + 回灌 SOP | [验证表](./pricing-validation-v1) · [Excel SOP](./discount-tier-workbook-sop) |
| ⑩ | 对外页与 docs | [Playlist](./marketing-scene-playlist) · 官网 Pricing · trinity-docs |

---

## 3. 目录树（应有内容） {#doc-tree}

> 树 = **应有模块**（通用）；括号内 = Trinity 当前文件。缺则见 §5。

```text
commercial-billing/                          ← 产品线商用计费根
│
├── 00 导航与选型
│   ├── billing-strategy-map.md              ← 【本文】目录树 · 流程 · 选型
│   └── index.md                             ← 总览：合规 · 结算 · 6.30 范围 · 总链
│
├── 01 结算与支付（Settlement）
│   ├── commercial-billing-mvp-prd.md        ← MVP 规则真源
│   ├── mvp-openrouter-payment.md            ← 充值 UI / Stripe
│   ├── industry-billing-payment-report.md   ← 业界支付/退款
│   ├── openrouter-payment-evidence.md       ← 竞品实勘
│   ├── global-payment.md                    ← 二期 KYC / Wire
│   └── Antom商户审核补充材料.md             ← 通道审核材料
│
├── 02 定价策略真源（Pricing strategy）
│   ├── pricing-strategy-evidence-chain.md   ← 【数字真源】门槛·折·GM·业界对照
│   ├── discount-spread-tier-pricing.md      ← 方法论文：差价·量价·多线路形态
│   ├── pricing-scenarios-scheme.md          ← 自助 × 点名包方案卡
│   ├── pricing-validation-v1.md             ← Step2 样本验证
│   └── pricing-tier-threshold-card-v1.md    ← 细档测算底稿（部分过时，以证据链为准）
│
├── 03 成本族与商务卡（Cost × Sales）
│   ├── discount-tier-matrix.md              ← 洽谈总表说明
│   ├── discount-tier-workbook-sop.md        ← Excel 回灌流程
│   ├── 商务洽谈折扣总表.xlsx                 ← 销售操作真源
│   └── scripts/rebuild_…py                 ← 一键重生成
│
├── 04 包装与获客（Packaging）
│   ├── pricing-marketing-strategy.md        ← 【营销总册】Pricing IA · 爆款 · 新老客
│   ├── marketing-scene-playlist.md          ← 场景精选 + 浅公开价原则
│   ├── new-user-trial-scheme.md             ← 试用 / Trial Credits
│   └── （缺口）年框/承诺合同话术卡            ← 见 §5
│
├── 05 副杆（Secondary levers）
│   └── cache-billing-profit.md              ← 缓存命中 δ（与账号阶梯拆开）
│
└── 06 对外落点（Outside this folder）
    ├── 官网 Pricing 页                      ← TrinityAI-web `/pricing`
    ├── 对外 docs 计费说明                   ← trinity-docs
    ├── 控制台 #credits / 运营 billing       ← platform / operations
    └── 供应商成本折台账                     ← pricing-sources/
```

### 3.1 模块职责（写什么 / 不写什么）

| 模块 | 写 | 不写 |
|------|----|------|
| **00 导航** | 选型、流程、链接、缺口 | 具体折数表 |
| **01 结算** | 充值、扣费、402、支付通道、退款 | 商务六档折数 |
| **02 策略** | 门槛、折、GM、为什么这样拍 | Stripe 集成细节 |
| **03 商务卡** | 成本族 × 档位 × 模型清单 | 对外营销话术长文 |
| **04 包装** | 营销页 IA、浅公开、试用、场景、爆款 | 进货成本测算过程；商务深折表 |
| **05 副杆** | 缓存/路由等独立盈利杆 | 替代主阶梯 |
| **06 对外** | 用户可见价与文案 | 内部 GM / 最深合同价 |

---

## 4. 现有文档映射 {#doc-map}

| 文件 | 角色 | 数字是否真源 |
|------|------|:------------:|
| [billing-strategy-map.md](./billing-strategy-map)（本文） | 导航 · 选型 · 流程 | — |
| [pricing-marketing-strategy.md](./pricing-marketing-strategy) | **官网营销总册** · IA · 爆款 | 浅折/文案；深折否 |
| [index.md](./) | 总览 · 合规 · 结算 · 6.30 | 结算已拍；定价链出 |
| [pricing-strategy-evidence-chain.md](./pricing-strategy-evidence-chain) | **定价数字真源** | ✅ |
| [discount-tier-matrix.md](./discount-tier-matrix) + Excel | **商务操作真源** | ✅（从证据链回灌） |
| [discount-spread-tier-pricing.md](./discount-spread-tier-pricing) | 方法论 / 早期草案 | ⚠️ 门槛表述可能旧；**以证据链为准** |
| [pricing-scenarios-scheme.md](./pricing-scenarios-scheme) | 自助×点名作战卡 | 验证中 |
| [pricing-validation-v1.md](./pricing-validation-v1) | 样本验证 | 过程稿 |
| [pricing-tier-threshold-card-v1.md](./pricing-tier-threshold-card-v1) | 细扫底稿 | ⚠️ 部分过时 |
| [marketing-scene-playlist.md](./marketing-scene-playlist) | 对外浅公开原则 | 文案原则 |
| [new-user-trial-scheme.md](./new-user-trial-scheme) | 试用 | 额度待拍 |
| [cache-billing-profit.md](./cache-billing-profit) | 缓存副杆 | 测评中 |
| [commercial-billing-mvp-prd.md](./commercial-billing-mvp-prd) | 结算 MVP | ✅ 结算 |
| 支付/行业/Antom/global-* | 支付与合规 | 各文为准 |

**改数顺序（强制）：** 证据链 §3/§5 → `FAMILY_TIERS` / Excel SOP → 矩阵说明 → 方案卡/对外浅文案。

---

## 5. 缺口与补齐优先级 {#gaps}

| # | 缺口 | 建议内容 | 优先级 | 状态 |
|---|------|----------|:------:|:----:|
| G1 | **本文（导航收敛）** | 目录树 + 选型 + 流程 | P0 | ✅ 本文 |
| G2 | **明确排除 B5 在网时长折** | 写入选型表（已含） | P0 | ✅ 2026-07-16 |
| G3 | **年框 / 承诺合同一页卡** | 承诺量、回溯、与用量档关系、话术 | P1 | ⬜ 待补 |
| G4 | **对外浅阶梯数字卡** | 与官网 Pricing 对齐的 9.9/9.8/9.7 定稿表 | P1 | ✅ 见 [营销总册 §2.5](./pricing-marketing-strategy#page-ia) |
| G4b | **官网 Pricing 营销总册** | IA · 爆款三席 · 新老客 | P0 | ✅ [pricing-marketing-strategy](./pricing-marketing-strategy) |
| G5 | **discount-spread 文首加「以证据链为准」横幅** | 防旧门槛误用 | P1 | ✅ 2026-07-16 |
| G6 | **销售 GTM 最小包** | 谁买单、试用标准、何时转年框 | P2 | ⬜（手册已标待补充） |
| G7 | **控制台档位展示 PRD** | 用户可见档名/进度 | P2 | ⬜ |

---

## 6. 阅读路径（按角色）

| 角色 | 建议顺序 |
|------|----------|
| **新人 PM** | §1 选型 → §2 流程 → 证据链开篇 → Playlist → 试用方案 |
| **商务 / 销售** | 证据链 §3 骨架 → Excel 总表 → 矩阵 →（深谈）点名/年框 |
| **财务** | 证据链 GM 护栏 → 差价专文口径 → 缓存副杆边界 |
| **研发** | MVP PRD → 计量 billing → 支付 UI →（档位）达档结算口径 |
| **运营 / 市场** | Playlist → 试用 → 官网 Pricing；深折不写进投放页 |

---

## 7. 修订

| 日期 | 说明 |
|------|------|
| 2026-07-16 | 初稿：通用流程 · 目录树 · 业界选型（含暂不做在网时长折）· 文档映射 · 缺口清单 |
| 2026-07-16 | 挂入 [官网 Pricing 营销总册](./pricing-marketing-strategy)（爆款三席 · 页面 IA） |

---

*改折/改门槛请改证据链；改导航/选型/流程请改本文。*

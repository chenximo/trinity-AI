---
title: 商用计费与充值
---

# AI API 聚合 · 商用计费与充值

> **文档类型**：**AI API 聚合产品** 商业化真源——**主体与接入合规前提**、**计费模式**、**付款/充值方式**、**6.30 商用范围** 与 **三处口径对齐**。  
> **读者**：产品、运营、商务、研发（计量/控制台/运营 billing）、法务（复核合规节）。  
> **关联**：[商用计费 MVP PRD（6.30）](./commercial-billing-mvp-prd) · [MVP 支付 UI 详规](./mvp-openrouter-payment) · [定价场景方案卡（自助·点名包）](./pricing-scenarios-scheme) · [定价策略与证据链](./pricing-strategy-evidence-chain) · [折扣与梯度总表](./discount-tier-matrix) · [缓存计费盈利（δ 测评）](./cache-billing-profit) · [新人体验方案](./new-user-trial-scheme) · [折扣差价与阶梯定价](./discount-spread-tier-pricing) · [Antom 商户审核补充材料](./Antom商户审核补充材料) · [全球化计费与退款行业报告](./industry-billing-payment-report) · [OpenRouter 支付调研与佐证](./openrouter-payment-evidence) · [全球化美金支付与 KYC（二期）](./global-payment) · [产品总览](../) · [计量与计费](../platform/metering-billing) · [运营 · 用量与计费](../operations/billing) · [用户控制台](../user/account-console) · [OpenRouter 对标](../competitor-research/openrouter) · [产品经理工作手册 · §1.1 商业化](../../产品经理工作手册#11-商业化与计费pm-必备模块) · [隐私政策](../../legal/privacy-policy)  
> **状态**：**草案 · 待拍板**（合规节为产品理解稿，**非法律意见**；价格与通道以法务/财务/支付服务商为准）  
> **日期**：2026-06-08

## 文档树

```
commercial-billing/
├── index.md                             ← 本页（ICP · 计量 · 6.30 商用范围）
├── commercial-billing-mvp-prd.md        ← 6.30 MVP PRD 真源（规则 · 落地步骤 · 已/待办）
├── mvp-openrouter-payment.md            ← 支付 UI / Stripe 弹窗详规
├── pricing-scenarios-scheme.md          ← 定价场景方案卡（自助 · 点名包）
├── pricing-validation-v1.md             ← Step2 样本验证表 v1
├── pricing-tier-threshold-card-v1.md    ← 企业户用量门槛费率卡 v1（门槛Q测算）
├── pricing-strategy-evidence-chain.md   ← 定价底层逻辑·策略与证据链（商务骨架真源）
├── discount-tier-matrix.md              ← 商务洽谈折扣总表（成本族 · 梯度 · 模型）
├── discount-tier-workbook-sop.md        ← 总表 Excel 回灌流程（新增成本折按此走）
├── scripts/rebuild_discount_tier_workbook.py ← 一键重生成 Excel
├── 商务洽谈折扣总表.xlsx                  ← 同上 · 销售/内部 Excel 导出
├── cache-billing-profit.md              ← 缓存计费盈利（命中少报 δ · 测评与推算）
├── new-user-trial-scheme.md           ← 新人体验方案（业界对照 · Trial Credits 草案）
├── discount-spread-tier-pricing.md      ← 折扣差价 · 阶梯定价 · 量价总利润（草案）
├── industry-billing-payment-report.md   ← 全球化计费/支付/退款 · 行业报告
├── openrouter-payment-evidence.md       ← OpenRouter 实勘 · 佐证
├── Antom商户审核补充材料.md             ← Antom 商户审核 · 可直贴材料
└── global-payment.md                    ← 二期 KYC / Wire / OFAC
```

---

## 1. 为什么需要本文

AI API 聚合的 **可变成本 = 上游模型调用**（token / 张 / 秒）。若 **计费单位、充值方式、计量真源、对外文案** 不一致，会出现：

- 用户充值成功但控制台余额不同步  
- 对外 docs 写 Credits、控制台写「元」、运营后台写 USD  
- 6.30 承诺「可商用付费」但 **402/扣费/对账** 未闭环  
- 误办国内 ICP 或误在页脚展示备案号，与 **美国主体 + 海外部署** 战略冲突  

本文统一 **合规前提 → 怎么卖 → 怎么付 → 怎么量 → 6.30 卖什么**，供后续 PRD、控制台 `#credits`、运营 `/billing`、对外 Quickstart **共用口径**。

---

## 2. 主体、接入与 ICP（计费方案的前置条件）

::: warning 非法律意见
本节为 **产品/商务决策参考**；对外承诺、合同、页脚展示 **须法务复核**。法规以中国大陆现行有效文本为准。
:::

### 2.1 两套「ICP」不要混淆

**ICP** 在中国监管语境下通常指两类 **独立** 资质（法规来源：国务院令第292号《互联网信息服务管理办法》等）：

| 类型 | 全称 | 性质 | 典型触发 |
|------|------|------|----------|
| **ICP备案** | 非经营性互联网信息服务备案 | **登记**（告知） | **源站/接入在中华人民共和国境内** |
| **ICP许可证** | 第二类增值电信业务中的互联网信息服务（经营性） | **行政许可** | **境内接入** + **经营性**（付费、会员、API 有偿调用等） |

### 2.2 属地原则（决定要不要办）

| 条件 | ICP备案 | ICP经营许可证 |
|------|:-------:|:-------------:|
| 服务器/主要接入在 **境外**（如美国） | **不需要** | **不需要**（且美国主体 **无国内申请资格**） |
| 源站或 CDN **接入在境内** | **需要** | 若同时 **经营性收费** → **通常需要**（须 **内资主体** 等门槛） |
| 访客在中国 | **不单独触发** | **不单独触发** |

**常见误区**：

- ❌ 「有国内用户就必须备案」→ ✅ 看 **服务器/接入位置**，不是访客 IP  
- ❌ 「.cn 域名必须备案」→ ✅ .cn 需 **域名实名**；解析到 **境外源站** 通常 **不按境内建站备案**（绑定 **大陆服务器** 才涉及备案）  
- ❌ 「海外公司做付费 API 要办国内 ICP 证」→ ✅ 海外主体 **无国内 ICP 证申请通道**；当前路径是 **海外主体 + 海外 API 接入 + 国际收款**

### 2.3 Trinity AI（美国主体）当前结论

| 项 | 结论 | 对产品/计费的含义 |
|----|------|-------------------|
| **ICP备案** | **不需要**（源站/deploy 在美国，不使用大陆源站/大陆 CDN 节点） | 官网/API **页脚不展示** `粤ICP备`；展示 Privacy / Terms、公司名（见 [legal](../../legal/)） |
| **ICP经营许可证** | **无法办理、当前不需要** | 6.30 **不设计**「国内经营性 ICP 网站充值闭环」为默认路径 |
| **仍须单独评估** | 个保法/跨境数据、税务、外汇、出口管制、上游模型 ToS | 见 §2.4；**不办 ICP ≠ 合规做完** |

### 2.4 触发重新评估的变更（例外）

若未来出现以下任一情况，**必须单独立项**（合规 + 产品 + 计费重做）：

1. 网站/API **源站迁到中国大陆** 或接入 **大陆 CDN 加速节点**（云厂商常要求备案）  
2. 设立 **内资子公司** 对国内个人/企业提供 **境内经营性** 收费 API  
3. 使用 **国内支付收单主体** 作为主要 ToC 充值通道（与 §4 付款方式联动）  

### 2.5 与计费文档的关系

**付款方式、收款主体、API Base URL 区域** 必须与本节一致：

```text
美国主体 + 海外 API  endpoint + 美元（或等值）预充值
        ↓
默认路径：Stripe 等国际通道 · 控制台 Credits · 不对国内 ICP 路径做默认假设
```

---

## 3. 业界怎么做（API 聚合 · 2026 共识）

| 模式 | 代表 | Trinity 倾向 |
|------|------|--------------|
| **预充值 + 按量扣费（Credits / Balance）** | OpenRouter、多数聚合 | **6.30 主路径** |
| **纯后付 / 月结账单** | 企业合同 | **P1 企业**，6.30 可选「运营人工调账」 |
| **月费订阅包额度** | 部分国内聚合 | **P1**，6.30 不阻塞 |
| **按 Key 固定月租** | 少数 B2B | 不作为 6.30 默认 |

**OpenRouter 对齐点**：Account 充值 → 调用扣减 → Usage 可查；Trinity 差异在 **+ B2B 运营后台**（上架、线路、折扣、对账）。

---

## 4. 付款与充值方式（6.30 MVP · 已拍板）

> **6.30 PRD 真源** → **[商用计费 MVP PRD](./commercial-billing-mvp-prd)**  
> **支付 UI 详规** → **[MVP 支付（OpenRouter 对齐）](./mvp-openrouter-payment)**  
> **二期增强** → **[全球化美金支付与 KYC](./global-payment)**

**路径摘要**：**个人** = 邮箱注册 → 自助充值（Stripe 卡/Link + 支付宝 + 微信）；**充 $N 到账 $N**，无充值费行（Stripe 成本平台吸收）；**企业** = Contact Sales → 邮件，**无**对公 Tab。

### 4.1 原则

1. **6.30 默认一种主路径**：**美元预充值 → 钱包余额 → 按调用扣费**（与 [metering-billing](../platform/metering-billing) 同源）  
2. **一种主货币展示**：控制台、运营后台、对外 docs **统一 USD（或统一符号 `$`）**，避免多币种无换算混展示  
3. **失败语义统一**：余额不足 → **402** + 固定文案（与 [developer-docs](../user/developer-docs) roadmap「402/429 文案」一致）  
4. **合规轻量化**：与 OpenRouter 一致——**仅 Stripe 支付环节**采集账单地址；**无**注册/充值前置证件、短信实名  

### 4.2 6.30 建议支持的付款方式

| 方式 | 用户 | 6.30 | 实现落点 | 备注 |
|------|------|:----:|----------|------|
| **Stripe 卡 / Link** | 个人 | **P0** | `#credits` Purchase Credits | 充 $N 到账 $N · [Stripe Pricing](https://stripe.com/pricing) |
| **支付宝 / 微信** | 国内个人 | **P0** | Stripe `alipay` / `wechat_pay` | 同上 |
| **充值费** | — | **吸收通道费** | — | 方案 A 已拍板；见 [MVP PRD §3.2](./commercial-billing-mvp-prd) |
| **注册赠送试用额度** | 新用户 | **P0** | 运营配置 | 不绑卡；额度待拍板 |
| **Stripe Invoice / 收据 / 支付中心** | 个人 | **待拍板** | Stripe Customer Portal 等待定 | 见 [MVP PRD §3.5](./commercial-billing-mvp-prd)；对外文档 **待补充** |
| **运营后台手动充值/调账** | 内测、线下企业 | **P0 兜底** | [运营 billing](../operations/billing) | |
| **Contact Sales 企业线索** | 企业对公/月结/大额 | **P0 导流** | 表单 → 商务邮件 | **无**前端自助对公入口 |
| **对公 Fedwire/SWIFT 自助 Tab** | 企业 | **不做（MVP）** | — | 二期见 [global-payment](./global-payment) |
| **前置 Sumsub KYC / 证件实名** | — | **不做（MVP）** | — | 二期按需 |
| **国内主体 ToC 直连收单** | — | **不做** | — | 与 §2 美国主体路径不一致 |
| **加密货币** | — | **不做** | — | OR 有 USDC；Trinity MVP 不做 |

### 4.3 充值 → 扣费 → 对账闭环（6.30 验收句）

> **注册（或登录）→ 充值入账 → 创建 Key → 调用 `chat/completions` 成功 → 控制台余额/用量减少 → 运营后台可查到同一笔 usage 与扣费记录**

各步真源：

| 步 | 用户可见 | 工程/手册真源 |
|----|----------|---------------|
| 充值 | `#credits` 余额增加 | 支付 webhook · 钱包表 |
| 调用 | `#activity` / `#logs` | `usage_event` · [chat-completions](../platform/chat-completions) |
| 扣费 | 余额减少或用量累计 | [metering-billing](../platform/metering-billing) |
| 对账 | — | [operations/billing](../operations/billing) |

### 4.4 试用与免费档（待拍板）

> **方案真源**：[新人体验方案（业界对照 · Trial Credits）](./new-user-trial-scheme)

| 项 | 建议选项 | 状态 |
|----|----------|:----:|
| 是否绑卡才送试用 | 6.30 建议 **不绑卡** + 低额度 | 待拍板 |
| 试用额度 | 草案 **$3**（备选 $2/$5）；见专文 | 待拍板 |
| 有效期 | 草案 **30 天** | 待拍板 |
| 用尽后 | 停止调用（402）+ 引导充值 | 建议默认 |
| 多模态（生图/视频） | 6.30 **不纳入试用** | 草案 |
| 模型范围 | 上游厚利白名单（≤6.5 折族） | 见专文 |

---

## 5. 计费模式与计量维度

### 5.1 主模式：按上游用量加价（Pay-as-you-go）

```text
用户支付 USD → 平台钱包 Credits
        ↓
每次 API 成功 → 按 model 价目 × 倍率（markup）扣减
        ↓
usage_event 记录 token/张/秒 + 展示价 + 上游成本（运营可见）
```

### 5.2 计量维度表（三处口径对齐 · PM 维护）

| 维度 | 用户可见文案 | 控制台/日志字段 | 成本来源 | 备注 |
|------|--------------|-----------------|----------|------|
| 生文 | 按 token / 次 | `prompt_tokens` · `completion_tokens` · `model` | 上游 API 账单 | 主路径 |
| 生图 | 按张 / 次 | `image` 相关字段 | 上游按张 | 6.30 视多模态范围 |
| 生视频 | 按秒 / 次 | video job 字段 | 上游按秒 | 6.30 视范围 |
| 余额 | Credits / Balance | `wallet_balance` | — | 与充值同源 |
| 限流 | RPM / TPM | 429 | 平台策略 | [auth-rate-quota](../platform/auth-rate-quota) |

**禁止**：对外 docs 写「按次」、控制台写「按 token」、运营写另一套单位 **且无换算说明**。

### 5.3 与限流、配额关系

| 能力 | 模块 | 关系 |
|------|------|------|
| 鉴权 | API Key | 无 Key 不调用 |
| 限流 | 429 | 与余额无关，防滥用 |
| 配额 | 企业工作区 | 6.30 原型中；可与余额 **叠加** |
| 余额不足 | 402 | **先于** 或 **与** 配额独立判断 |

---

## 6. COGS 与定价（粗算占位）

> 商用前须用 **真实上游价目 + 实际 markup** 替换下表；季度复核。  
> **折扣差价、企业阶梯、量价总利润** → 专文 **[折扣差价与阶梯定价](./discount-spread-tier-pricing)**。

| 项 | 说明 | 状态 |
|----|------|:----:|
| 上游成本 | 各供应商/model 进价（成本折见 [商务原底](../pricing-sources/supplier-cost-discounts)） | 运营 [models-routes](../operations/models-routes) |
| 展示价 | 价目表 × markup | **【待拍板：如 cost × 1.2】** |
| 折扣差价 / 阶梯 | 销售折 − 成本折；档位与 GM≥20% 底线 | **[专文](./discount-spread-tier-pricing)** · 场景与落地步骤见 [方案卡 §0.1](./pricing-scenarios-scheme#01-通往可营销阶梯的步骤--文档) |
| 定价场景 / 营销阶梯 | 自助×点名包；ToB 感知与作战 | **[方案卡](./pricing-scenarios-scheme)** · **当前 Step 2 样本验证** |
| 支付通道费 | Stripe 等 % | 财务填 |
| 单用户获客试用成本 | 试用额度 × 滥用率 | PM + 运营 |

**毛利粗算公式（示意）**：

```text
单次调用毛利 ≈ 用户扣费（展示价）− 上游成本 − 分摊支付手续费
```

折扣维度（与专文一致）：

```text
单位毛利 m = L × (d_sell − d_cost)
总毛利   Π = m × Q（Q 随折扣加深可能上升 → 存在量价平衡点）
```

---

## 7. 6.30 商用范围（卖什么 / 不卖什么）

> 与 [产品总览 · 6.30 主链](../#630-能力主链) 一致；**须管理层拍板**后改「待拍板」为「已确认」。

### 7.1 建议纳入 6.30

| 能力 | 说明 |
|------|------|
| 生文 API + 流式 | 主链 |
| Key 创建与调用 | 主链 |
| 美元（或统一货币）**预充值** | 本文 §4 |
| 控制台用量/余额可见 | `#credits` · `#activity` |
| 运营上架 ≥1 模型 + 对账可查 | 运营侧 |
| 对外 Quickstart + 核心 docs | trinity-docs |
| Privacy / Terms 可访问 | [legal](../../legal/) · [页面清单](../../legal/pages-and-content) |

### 7.2 建议不纳入 6.30（明确写「不卖」）

| 能力 | 原因 |
|------|------|
| 国内 ICP 路径下的 ToC 国内收单 | §2 战略不一致 |
| Agent SDK 对外商用 | [Agent 二期](../agent/) 规划期 |
| 自助对公 Wire / 企业 Tab | MVP 走 Contact Sales；Wire 二期 |
| 完整企业合同/Invoice 自动化 | P1（线下企业可先人工） |
| 全部多模态生产级 SLA | 视 W24–W26 进度 **待拍板** |

---

## 8. 页面与文档落点

| 内容 | 落点 |
|------|------|
| 6.30 MVP 规则 · 落地步骤 | [商用计费 MVP PRD](./commercial-billing-mvp-prd) |
| 充值 UI · Stripe 弹窗 | [MVP 支付 UI 详规](./mvp-openrouter-payment) |
| 定价场景 · 自助 / 点名包方案卡 | [定价场景方案卡](./pricing-scenarios-scheme) |
| Step2 样本验证 | [定价验证表 v1](./pricing-validation-v1) |
| 企业户门槛 ↔ 折 · 单户月利测算 | [用量门槛费率卡 v1](./pricing-tier-threshold-card-v1) |
| **定价底层逻辑 · 策略与证据链** | **[定价策略与证据链](./pricing-strategy-evidence-chain)** |
| **商务洽谈折扣总表 · 模型清单** | **[商务洽谈折扣总表](./discount-tier-matrix)** · [Excel](./商务洽谈折扣总表.xlsx) · [回灌 SOP](./discount-tier-workbook-sop) |
| **缓存计费盈利 · δ 测评** | **[缓存计费盈利](./cache-billing-profit)** |
| **新人体验 · 业界对照与 Trial 草案** | **[新人体验方案](./new-user-trial-scheme)** |
| 折扣差价 · 阶梯定价 · 量价最优 | [折扣差价与阶梯定价](./discount-spread-tier-pricing) |
| 行业计费/支付/退款 · 竞品对照 | [全球化计费与退款行业报告](./industry-billing-payment-report) |
| OpenRouter 实勘 · 佐证 · invoice | [OpenRouter 支付调研与佐证](./openrouter-payment-evidence) |
| 分层 KYC · 对公 Wire · 前置 OFAC（二期） | [全球化美金支付与 KYC](./global-payment) |
| 价目、充值说明 | 对外 [计费与 Credits](https://trinitydesk.ai/docs/guides/billing-and-credits)（`trinity-docs`） |
| 充值 UI、余额 | [用户控制台](../user/account-console) `#credits` |
| 用量、日志 | `#activity` · `#logs` |
| 扣费策略、调账 | [运营 billing](../operations/billing) |
| 计量真源 | [platform/metering-billing](../platform/metering-billing) |
| L0 商业假设摘要 | 未来 `product-design-analysis.md` §0.3 链本文 |

---

## 9. PM / 研发 / 运营 / 法务 checklist

### 9.1 商用前（产品）

- [ ] §2 主体与接入 **未变更** 或已重新评估  
- [ ] §4.2 付款方式 **6.30 列表** 已拍板  
- [ ] [商用计费 MVP PRD](./commercial-billing-mvp-prd) 已评审（方案 A 吸收通道费 · 永久余额 Terms）  
- [ ] 前端充值对接与说明文案（§12 落地步骤）  
- [ ] §5.2 计量维度表 **三列对齐**  
- [ ] §7 商用范围 **已确认**  
- [ ] 402/429 文案与 docs 一致  
- [ ] 页脚 **无虚假 ICP 备案号**；Privacy/Terms 可点  

### 9.2 研发

- [ ] `usage_event` 写入完整（[roadmap](../platform/metering-billing.roadmap.yml)）  
- [ ] 充值回调 → 钱包 → 402 链路可测  
- [ ] 控制台余额与运营 billing **同一用户同一数字**  
- [ ] Request-Id / 结算键可追踪（见工程师 API 契约）  

### 9.3 运营

- [ ] 手动调账有审计日志  
- [ ] 模型价目变更与扣费策略同步  
- [ ] 对账：支付渠道 ↔ 钱包 ↔ usage 可抽样  

### 9.4 法务 / 财务

- [ ] 支付服务商与收款主体合同  
- [ ] 服务条款含 **付费、退款、责任限制**  
- [ ] 复核 §2（**非律师替代本 checklist**）  

---

## 10. 开放问题（上会勾选）

| # | 问题 | 建议 Owner |
|---|------|------------|
| 1 | 6.30 支付通道具体选型（Stripe?） | 财务 + 研发 |
| 2 | 试用赠送额度 | PM |
| 3 | 默认 markup 倍率 | PM + 运营 |
| 4 | 生图/生视频是否 6.30 可付费调用 | PM |
| 5 | 企业工作区与个人账户钱包是否分离 | PM |
| 6 | 退款/争议政策对外文案 | 法务 |
| 7 | 折扣差价阶梯门槛与各成本折族销售折（见 [专文](./discount-spread-tier-pricing) · [方案卡](./pricing-scenarios-scheme)） | PM + 商务 + 财务 |
| 8 | 样本验证回填矩阵与销售算账表（方案卡 Step 2） | PM + 运营 |

---

## 11. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-08 | 迁入 `commercial-billing/` 子目录；全球支付 → `global-payment.md` |
| 2026-06-08 | 链入全球化美金支付专文；§4.2 按分层重排 |
| 2026-06-08 | **战略调整**：6.30 MVP 对齐 OpenRouter → `mvp-openrouter-payment.md`；§4 重写 |
| 2026-06-08 | 新增 `commercial-billing-mvp-prd.md`：一页纸拍板 · 0 平台费 · 后端完成/前端待办 |
| 2026-07-14 | 新增 `discount-spread-tier-pricing.md`：折扣差价口径 · 阶梯 · 量价总利润；§6/§8/§10 挂链 |
| 2026-07-14 | 新增 `pricing-scenarios-scheme.md`：自助 × 系数档 · 点名包分行报价方案卡 |
| 2026-07-15 | 新增 `cache-billing-profit.md`：缓存命中少报 δ · 单日样本测评 · 按模型反推 |
| 2026-07-16 | 新增 `new-user-trial-scheme.md`：百炼/TokenHub/OpenRouter 业界整理 + Trial Credits 草案 |
| 2026-07-16 | 新增 `discount-tier-matrix.md`：共用梯度 + 商务主折矩阵 + 公开折/模型清单占位 |
| 2026-07-16 | 商务洽谈总表 v0.2：去掉公开折；导入 0.65 共 22 模型；生成 `discount-tier-commercial.xlsx` |
| 2026-07-16 | 总表 v0.3：定稿列序（一行一成本折；模型格 `；`+换行）；Excel 仅 `00_readme` / `01_summary` / `src_065` |
| 2026-07-16 | 总表 v0.4：档位格内嵌 GM；口径改表头；`src_065`=原「线路管理」整表拷贝 |
| 2026-07-16 | Excel 更名 `商务洽谈折扣总表.xlsx`：去掉顶栏；说明挪表末；无筛选 |
| 2026-07-16 | 导入 0.70（7折）19 模型 + `src_070`（源文件 (3).xlsx） |
| 2026-07-16 | 档名已拍：Standard→Plus→Mid→Growth→Scale→Enterprise；证据链新增 §3.0 中英对照与业界参考 |
| 2026-07-16 | 新增折扣总表回灌 SOP + `scripts/rebuild_discount_tier_workbook.py`（后续新成本折按此走） |

---

*商用定价、付款通道与合规结论以法务、财务及支付服务商协议为准；竞品与上游价格请定期复核。*

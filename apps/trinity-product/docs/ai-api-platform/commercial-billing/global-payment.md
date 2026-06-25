---
title: 全球化美金支付与 KYC
---

# Trinity AI · 全球化美金支付（个人 / 企业 · 二期增强）

> **文档类型**：**商用计费子专文（二期）**——流水上涨或企业 Wire 需求明确后，在 [MVP OpenRouter 支付](./mvp-openrouter-payment) 之上的 **分层 KYC/KYB · 对公 Wire · 前置 OFAC** 增强方案。  
> **6.30 MVP 真源**：[MVP 计费支付（OpenRouter 对齐）](./mvp-openrouter-payment)（个人自助 + Contact Sales，**无**前置 KYC、**无**对公 Tab）  
> **上级真源**：[商用计费与充值 · 总览](./)（计费模式 · 计量 · 6.30 范围）  
> **读者**：产品（PRD / 控制台 `#credits`）、商务答疑、支付/风控、法务/财务（**须复核**）  
> **状态**：**草案 · 待法务/财务/支付服务商确认**（**非法律意见**）  
> **日期**：2026-06-08

---

## 0. 有效性评估（产品手册 · 2026-06-08）

::: info 与 MVP 文档关系
**6.30 不采用本文作为默认路径。** MVP 按 [OpenRouter 对齐方案](./mvp-openrouter-payment) 落地；本文保留为 **P1/P2 增强** 参考（企业 Wire、Sumsub KYC、前置 OFAC 等）。
:::

> 本节为 **产品侧评审结论**，供是否采纳为 **二期 PRD** 依据；**不可替代** 美国持牌律师、合规顾问、Stripe/银行通道合同审查。

### 0.1 总体结论

| 维度 | 评分 | 说明 |
|------|:----:|------|
| **合规框架方向** | **8 / 10** | 个人 vs 企业分层、OFAC/CDD、对公 Wire 前置 KYB — 与美国主体 SaaS **主流做法一致** |
| **链接与法规引用** | **7.5 / 10** | FinCEN / OFAC / eCFR / Stripe Docs 等 **权威来源有效**；部分解读 **偏严**，须法务收窄表述 |
| **产品可落地性** | **6.5 / 10** | 四层权限 + 双 Tab 充值 **可做成 PRD**；Wire 分户、万里汇/扫码、Net30、双资金池 **工程与通道成本高**，须分期 |
| **作为 6.30 依据** | **—** | **MVP 改用** [mvp-openrouter-payment](./mvp-openrouter-payment)；本文 **P1+** |

**综合：7.5 / 10** — 适合作为 **支付模块 PRD 与商务话术真源**；对外法律承诺、罚款数额、通道能力 **须删减或法务改写** 后再发布。

### 0.2 采纳建议（分期）

| 阶段 | 建议纳入 | 暂缓 / 单独立项 |
|------|----------|-----------------|
| **6.30 MVP** | 见 [mvp-openrouter-payment](./mvp-openrouter-payment)：Stripe + 扫码 + Contact Sales | 本文双 Tab / Sumsub / 前置 OFAC |
| **P1** | 分层 1–2 增强 KYC；企业 KYB（Sumsub）；对公 Wire + 水单核销；企业 Invoice | Net30/Net60 授信 |
| **P2** | 集团子账号分权、业务空间分账、ERP 对账单 | 万里汇/Wise→支付宝微信 **须支付伙伴尽调** |
| **架构** | 账本层 **个人/企业钱包隔离**（必做） | 「物理双银行账户」按财务/银行实际能力设计，**不必在 PRD 写死 Mercury/Relay** |

### 0.3 需法务/财务收窄的表述

1. **罚款上限、「无主观过错同样处罚」** — 不宜写入对外材料；内部可保留「存在监管风险」  
2. **CTA / BOI** — 联邦要求 **动态变化**（含司法挑战与豁免修订），以 [FinCEN 现行 BOI 指南](https://www.fincen.gov/boi) **当日有效版** 为准，勿写死「2024 起一律……」  
3. **「不存在先转账后补认证」** — 产品侧 **应禁止**；银行侧也可能拒收 — **方向正确**  
4. **Stripe 对公 Wire** — 依赖 **Stripe 产品与账户类型**（Connect / Treasury 等），以 [Stripe 验证文档](https://docs.stripe.com/connect/required-verification-information?country=US) 及 **已签商户协议** 为准  
5. **IRS §6050I（现金 ≥$10k）** — 与 **线上卡/Wire** 场景关联有限，不宜作为控制台主叙事  
6. **链接时效** — 官方 PDF/FAQ 会更新；维护者 **每季度抽查** §六链接

### 0.4 与 [商用计费总览](./) 的关系

| 总览 § | 本专文承接 |
|--------|------------|
| §2 ICP / 美国主体 | 全球化 **收款** 合规（美国法），与 ICP **互补** |
| §4 付款与充值 | **完整分层、通道、UI、KYC** 真源 |
| §9 checklist | 增补 KYC/OFAC/对公门控项 |

---

## 1. 文档基础信息

| 项 | 内容 |
|----|------|
| **主体** | Trinity AI **美国注册法人**，全球客户 **美元统一结算** |
| **产品** | AI API 聚合 · Agent SaaS · 自研 Agent SDK 私有化交付 |
| **客户** | 全球自然人；跨境/本土 **企业对公**（含中国跨境卖家、美国本土、欧盟/东南亚） |
| **合规前提** | 美国 FinCEN BSA/CDD、OFAC、IRS 凭证规则、SWIFT Travel Rule（适用时）、Stripe 商户协议 — **以签署协议与现行法规为准** |
| **用途** | 产品 PRD · 商务答疑 · 支付/风控落地 · 审计备查（**经法务定稿后**） |

::: warning 非法律意见
下文法规解读为 **产品理解**；链接供复核，**不构成法律建议**。
:::

---

## 2. 顶层合规约束总览

### 2.1 适用范围（U.S. Person）

Trinity AI 作为 **美国境内法人**，美元收款、跨境电汇、企业对公往来通常需满足：

1. 《银行保密法 BSA》31 U.S.C. § 5311–5336 · 31 CFR Part 1010（含 CDD）  
2. OFAC：IEEPA / TWEA · 31 CFR Chapter V  
3. 企业透明度 / 受益所有人：**以 FinCEN 现行 BOI 规则为准**  
4. 跨境电汇信息留存：31 CFR § 1010.410（Travel Rule，适用阈值与场景以法规为准）  
5. IRS 企业支出凭证：26 USC / 26 CFR（如 §1.274-5）  
6. **Stripe（及合作银行）** 商户 KYC/KYB 与可用产品条款  

### 2.2 核心刚性结论（产品必须遵守）

| # | 结论 | 产品含义 |
|---|------|----------|
| 1 | **个人实名 ≠ 企业资质**，不可互替 | 两套 KYC 档案与钱包 |
| 2 | **对公经营性资金** 需 **法人 KYB**（注册文件、税号、受益所有人等） | 未认证 **不开** Wire/对公 Invoice |
| 3 | **不应设计「先对公入账、后补认证」** | 审核通过 **后** 展示收款账号与备注码 |
| 4 | **个人 / 企业资金与账单隔离**；留存满足 BSA/IRS **最低年限**（通常 ≥5 年，以顾问为准） | 账本分池 + 审计日志 |

---

## 3. 客户分层与权限（四层）

### 分层 1 · 仅注册（纯试用）

| 开放 | 限制 |
|------|------|
| 免费 SDK/平台试用额度、演示 | **隐藏** 对公 Wire Tab；**不可付费充值**；不出凭证 |

**依据（方向）**：31 CFR Part 1020 CIP — 付费资金流入前需身份识别（产品侧：未 KYC 不收钱）。

### 分层 2 · 个人实名（自然人 / 个体户小额）

| 项 | 内容 |
|----|------|
| **客群** | 全球个人开发者、小微个体 |
| **KYC** | 护照/政府 ID、地址、手机；**Sumsub（或同类）** + OFAC 筛查 |
| **支付** | Stripe：Visa/Master、Link；**P2 可选** 万里汇/Wise 等桥接华人扫码 → **须通道尽调** |
| **能力** | 小额充值（**待拍板：最低 $50**）；**个人消费收据**（无企业税号） |
| **锁定** | 对公 Wire Tab 隐藏/置灰；**无** 企业 Invoice；无集团分账、账期授信 |

**依据（方向）**：[FinCEN CDD FAQ](https://www.fincen.gov/resources/statutes-and-regulations/cdd-rule-faqs) — 法人客户与自然人为不同尽调路径。

### 分层 3 · 企业认证审核中

| 表现 | 说明 |
|------|------|
| 对公 Tab **可见** | 收款账号、核销备注、提交转账 **锁定** |
| 可预填 | 开票主体、对公银行资料 — 通过后生效 |

### 分层 4 · 企业认证通过（ToB 全量）

#### 3.4.1 分区域 KYB 材料（清单 · 实施以 Sumsub/Stripe 要求为准）

| 区域 | 典型材料 |
|------|----------|
| **美国** | Articles of Incorporation、EIN、≥25% 受益所有人 ID+地址、经营地址 |
| **中国大陆** | 营业执照、统一社会信用代码、法人证件、对公账户信息 |
| **香港/欧盟/东南亚** | BR/VAT/当地注册文件、法人证件、地址证明 |

**依据（方向）**：[31 CFR § 1010.230](https://www.federalreserve.gov/frrs/regulations/section-1010230-beneficial-ownership-requirements-for-legal-entity-customers.htm)

#### 3.4.2 解锁能力（分期）

| 能力 | 阶段 |
|------|:----:|
| Fedwire/ABA（美国企业）、SWIFT Wire（海外企业） | P1 |
| 专属 **汇款备注码** + 水单上传人工核销 | P1 |
| 企业 **Commercial Invoice**（含 EIN/VAT/统一社会信用代码） | P1 |
| 阶梯预存（**待拍板：对公最低 $1000**） | P1 |
| 集团子账号、业务空间分账 | P2 |
| Net30/Net60 授信 | P2 · 高风险 |

**税务（方向）**：企业税前抵扣需 **合规商业 Invoice** — [26 CFR 1.274-5](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFR67a5482dcf53efe/section-1.274-5A)

---

## 4. 支付通道架构

### 4.1 线上（个人主力 · 6.30 P0）

- **Stripe 美国商户账户**：卡、Link  
- **准入**：个人 KYC + OFAC；**未企业 KYB 不开放** Stripe 侧对公 Wire 能力（以 [Stripe 验证要求](https://docs.stripe.com/connect/required-verification-information?country=US) 为准）

### 4.2 线下对公（企业 · P1）

| 通道 | 客群 |
|------|------|
| **Fedwire / ABA** | 美国本土企业 |
| **SWIFT Wire** | 中国/欧盟/东南亚等企业 |

**Travel Rule（方向）**：大额跨境 Wire 需完整对手方信息 — [31 CFR § 1010.410](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1010/subpart-D/section-1010.410)

### 4.3 资金与账本（产品必做 · 银行架构财务定）

```text
Stripe 入账 ─┐
             ├──► 美国主体银行账户（具体开户行：财务选型）
Wire 入账  ─┘
        ↓
系统账本：个人钱包池 ∥ 企业钱包池（不可互转）
        ↓
usage 扣费 · Invoice · 对账单（分池存档 ≥5 年，以合规顾问为准）
```

---

## 5. 充值弹窗交互（`#credits` · PRD 真源）

### 5.1 双 Tab 隔离

| Tab | 可见条件 | 内容 |
|-----|----------|------|
| **Individual 个人** | 个人 KYC 后 | 卡/Link；（P2）扫码；自由金额 **≥$50**；个人收据 |
| **Enterprise 企业对公** | 见分层 3–4 | 未认证：置灰 + 引导 KYB；审核中：锁定账号；通过：Wire 信息 + 备注码 + 水单上传 |

### 5.2 对公 Tab 必展示要素

1. Trinity AI **Legal Name**、ABA、账号、SWIFT  
2. **唯一汇款备注码**（强制填写）  
3. 最低充值、阶梯赠额（待拍板）  
4. 到账时效：Fedwire 当日 / SWIFT 3–5 工作日（示意）  
5. 中转费说明、水单上传  

---

## 6. OFAC 筛查（强制流程）

| 节点 | 动作 |
|------|------|
| 注册 / KYC / KYB | 自然人、企业、受益所有人 SDN 筛查 |
| 充值 / Wire 发起前 | 二次筛查 |
| 存量 | 定期复筛 |

- 检索工具：[OFAC Sanctions Search](https://sanctionssearch.ofac.treasury.gov)  
- 手册：[OFAC 合规手册（FRB）](https://ofac.treasury.gov/system/files/126/ofac_sec_frb.pdf)

**产品规则**：信息不足以筛查的 **对公交易拦截**。

---

## 7. 官方依据链接索引

### FinCEN / CDD

- [31 CFR § 1010.230 受益所有人](https://www.federalreserve.gov/frrs/regulations/section-1010230-beneficial-ownership-requirements-for-legal-entity-customers.htm)  
- [CDD Rule FAQs（FinCEN）](https://www.fincen.gov/resources/statutes-and-regulations/cdd-rule-faqs)  
- [CDD 认证表（PDF）](https://www.fincen.gov/sites/default/files/shared/CDD_Rev6.7_Sept_2017_Certificate.pdf)  
- [BOI 合规指南（中英 PDF · 以官网最新版为准）](https://www.fincen.gov/boi)

### OFAC

- [OFAC 官网](https://ofac.treasury.gov/)  
- [Sanctions Search](https://sanctionssearch.ofac.treasury.gov)

### Travel Rule

- [31 CFR § 1010.410](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1010/subpart-D/section-1010.410)

### Stripe

- [美国 Connect 验证信息](https://docs.stripe.com/connect/required-verification-information?country=US)  
- [企业核验文件清单](https://docs.stripe.com/acceptable-verification-documents?document-type=entity)

### IRS

- [26 CFR 1.274-5 企业支出凭证](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFR67a5482dcf53efe/section-1.274-5A)

### 产品对标（非法规）

- [腾讯云国际 · 企业认证](https://console.intl.cloud.tencent.com/#/account/verify)  
- [腾讯云 · Bank Transfer 说明](https://www.tencentcloud.com/zh/document/product/555/11319)

---

## 8. 方案总结

1. **合规底线**：对公美金 **必须 KYB**；个人 KYC **不能** 替代；产品 **禁止**「先入账后补证」。  
2. **双轨产品**：个人 — 线上小额 + 个人收据；企业 — Wire/Invoice/分账/授信（分期）。  
3. **落地路径**：MVP → [OpenRouter 对齐](./mvp-openrouter-payment)；本文 **P1+** 再引入双 Tab + 认证状态机 + 前置 OFAC + Wire。

---

## 9. PRD / 研发 checklist（摘自 §0 分期）

### 6.30 MVP（见 mvp-openrouter-payment）

- [ ] 不在 MVP 范围：Sumsub KYC、企业 Wire Tab、前置 OFAC API

### P1（本文）

- [ ] 企业 KYB 材料流 + 审核后台  
- [ ] Wire 收款信息 + **唯一备注码** + 水单 OCR/人工核销  
- [ ] 企业 Invoice PDF 模板  

---

## 10. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-08 | 迁入 `commercial-billing/global-payment.md` 子目录 |
| 2026-06-08 | 初稿：全球化美金支付方案；§0 有效性评估 |
| 2026-06-08 | 降级为 **二期增强**；6.30 MVP 真源 → `mvp-openrouter-payment.md` |

---

*对外口径、罚款描述、通道能力以法务、财务、Stripe/银行协议为准；链接请定期复核。*

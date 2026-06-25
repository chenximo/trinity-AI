---
title: MVP 计费支付（OpenRouter 对齐）
---

# Trinity AI · MVP 计费支付方案（OpenRouter 对齐）

> **文档类型**：**6.30 支付 UI / Stripe 交互详规**——弹窗结构、Stripe 组件、OR 实勘对齐；**商业规则真源** → **[商用计费 MVP PRD](./commercial-billing-mvp-prd)**。  
> **上级真源**：[商用计费与充值 · 总览](./)  
> **增强路径**（分层 KYC/KYB · 对公 Wire · 前置 OFAC）→ [全球化美金支付与 KYC](./global-payment)（**二期 / 流水上涨后**）  
> **对标参考**：[行业报告 · 全球化计费与退款](./industry-billing-payment-report) · [OpenRouter 支付调研与佐证](./openrouter-payment-evidence) · [OpenRouter 友商调研](../competitor-research/openrouter) · [OpenRouter FAQ](https://openrouter.ai/docs/faq) · [OpenRouter Terms](https://openrouter.ai/terms)  
> **状态**：**UI 详规 · 待前端落地**（商业规则见 [commercial-billing-mvp-prd](./commercial-billing-mvp-prd)）  
> **日期**：2026-06-08

---

## 0. 评审结论（能否对齐 OpenRouter？）

**可以。** 个人走线上自助充值（Stripe 收据 / Invoice）；企业大额、对公、月结 **不开放前端入口**，统一 **Contact Sales → 邮件/表单线索 → 线下签约**。这与 OpenRouter 当前 **轻量合规 + Credits 预充值 + Activity 明细** 的产品形态一致，也符合美国主体 SaaS 在 **小规模 MVP 阶段** 的常见路径。

| 维度 | 结论 |
|------|------|
| **产品路径** | ✅ 采纳：Credits / Activity / Models 三页 + 充值弹窗 + Stripe 托管收银 |
| **个人支付** | ✅ 邮箱注册即可充值，**无前置证件/短信实名**；支付环节采集账单地址 |
| **企业对公** | ✅ MVP **无自助 Tab / 无 Wire 页**；页脚 Contact Sales 导流 |
| **合规强度** | ✅ MVP 与 OpenRouter 同级：Stripe Radar + 账单地址 + 交易归档 |
| **须拍板差异** | 见 §0.1（最低充值、费率；通道选型以 Stripe 统一收银为主） |

### 0.1 与 OpenRouter 实际产品的差异（拍板前必读）

> **界面实勘（2026-06）**  
> - **Purchase Credits**：微信/支付宝/卡/Link 图标切换；底部 **Use one-time payment methods** 默认 **ON**；费用行 `Service fees: $0.80`。  
> - **Add a Payment Method**：Tab **银行卡 · 银行 · Cash App Pay**；银行 Tab 含搜索 + 美国银行九宫格；主按钮 **Save payment method**；页脚 *You may enable invoices after saving your payment method*；底部同样有 **Use one-time payment methods** Toggle（绑卡场景下通常为 **OFF**）。  
> Trinity MVP **两弹窗结构 1:1 复刻**。

| 项 | OpenRouter 现状（实勘 + 公开文档） | 本文 Trinity MVP | 建议 |
|----|-----------------------------------|------------------|------|
| **一次性支付开关** | ✅ 充值弹窗底部 **Use one-time payment methods**，默认 **ON** | **P0 不做**（与绑卡/Auto top-up 同批；要做则 UI 分岔） | P0.5 与 Add Payment Method 一并评估 |
| **微信 / 支付宝** | ✅ 与卡支付 **同一 Purchase Credits 弹窗**内图标切换；微信展示扫码说明 | 同左 | **优先 Stripe 统一收银**（与 OR 同路径），非独立跨境聚合 |
| **最低充值** | Terms：**$5** / 笔；实勘示例 **$10** | **$10**（已拍板） | **$10** |
| **充值费** | OR：**5.5%+$0.80** Service fees 行 | **Trinity 方案 A**：充 $N 到账 $N，**无 fee 行**（见 [MVP PRD §3.2](./commercial-billing-mvp-prd)） | 对齐 OpenAI/Together，不对齐 OR 费用行 |
| **Invoice** | 页脚 *create invoices after buying credits* + Stripe 门户 | 同 Stripe 能力 | ✅ 对齐 |
| **企业自助** | Organization 共享额度 | MVP **仅 Contact Sales** | P1 再评估 |
| **退款** | 24h 内未用可退；OR platform fee 不退；24h 后不退；**自助 Refund** | **规则同 OR**；Trinity **实付全额**可退；**邮件 Support** | 法务复核 Terms |

---

## 1. 前置统一约定

1. **MVP 仅线上个人自助充值**：无自助对公 Tab、无线上美金对公电汇；企业大额/对公/月结全部走 **「联系销售」** 线下签约，前端 **不开放** 对公支付入口。  
2. **产品交互 1:1 复刻 OpenRouter**：支付流程、页面弹窗、Stripe 开关、账单地址表单字段与提示文案。  
3. **统一 Stripe 收银**：微信 / 支付宝 / 卡 / Link **同一 Purchase Credits 弹窗**（与 OpenRouter 实勘一致）；在 Stripe Dashboard 开通对应 Payment Method Types，**非**自建聚合中转（除非 Stripe 不可用再备选）。  
4. **合规基线对齐 OpenRouter**：**仅支付环节** 强制采集账单地址；**不新增** 注册/充值前置证件、短信实名拦截。  
5. **风险留存**：轻量化路径与 OpenRouter 同级；月流水显著上涨或监管抽查时，再迭代 [global-payment](./global-payment) 中的分层 KYC/OFAC。

---

## 2. 整体产品架构

### 2.1 支付路径（OpenRouter 实勘 · 单一弹窗）

OpenRouter **不是**「扫码走聚合、卡走 Stripe」两套系统，而是 **Purchase Credits 弹窗内统一选支付方式**：

| 支付方式 | 弹窗内行为 |
|----------|------------|
| **微信支付** | 图标选中 → 展示「请用微信扫描二维码」→ Purchase |
| **支付宝** | 同上，支付宝扫码 |
| **银行卡 / Link** | 卡表单或 Link 快捷支付 |
| **Use one-time payment methods** | 弹窗 **底部 Toggle**，默认 **ON** = 不保存支付方式；OFF = 可绑卡、自动续费 |

底层：**Stripe 托管**（Checkout / Payment Element / Financial Connections）；Trinity MVP **按此架构实现**。

### 2.2 两个弹窗的分工（OR 实勘 · Trinity 照抄）

```text
Credits 页
  │
  ├─► 【弹窗 A】Purchase Credits          ← 立刻充值（一次性默认）
  │     · 微信 / 支付宝 / 卡 / Link
  │     · Use one-time payment methods 默认 ON
  │
  └─► 【弹窗 B】Add a Payment Method      ← 留存支付方式（关 one-time 或点「添加支付方式」）
        · Tab：银行卡 | 银行 | Cash App Pay
        · Save payment method
        · 页脚：enable invoices after saving
        · Use one-time payment methods 通常 OFF
```

| 弹窗 | 何时出现 | 用户意图 |
|------|----------|----------|
| **A · Purchase Credits** | 点 Add Credits / Purchase | 这次充多少钱、用什么付 |
| **B · Add a Payment Method** | one-time **关闭**，或 Credits 页「Manage payment methods」 | 绑卡/绑银行，供后续自动续费 |

**Toggle 联动**：全局同一偏好——**ON** 走弹窗 A 单次付；**OFF** 允许弹窗 B 保存方式 + Auto top-up。

### 2.3 三大核心计费页面

| 页面 | 路由/入口 | 能力 |
|------|-----------|------|
| **Credits** | 右上角余额 + `/credits` | 充值、余额、Payment History |
| **Activity** | `/activity` | 时间、模型、Token、扣费、筛选、CSV 导出 |
| **Models** | `/models` 或定价区 | 含平台费 **一口价** 千 Token 单价；按上游真实 Token 扣费 |

---

## 3. 充值弹窗（`#credits` · 1:1 复刻 OpenRouter Purchase Credits）

**标题**：Purchase Credits / 充值

### 3.1 费用明细区

> Trinity **方案 A（已拍板）**：弹窗 **无** Service fees / Processing fee 行；**Total due = Amount**。  
> 支付栈与 OR 相同（Stripe 卡/Alipay/微信），**费用 UI 对齐 OpenAI/Together**，非 OR 实勘费用行。

| 行 | OpenRouter 实勘 | **Trinity MVP（方案 A）** |
|----|-----------------|---------------------------|
| Amount / Credits | $10 | 用户输入 = **到账 Credits** |
| Service fees | **$0.80**（含 OR 平台费） | **不展示** |
| Sales Tax / VAT | N/A | N/A 或 Stripe Tax |
| **Total due** | **$10.80** | **= Amount**（如 **$10.00**） |

**Stripe 侧**：Checkout/Payment Element 仍向 Stripe 扣款 **Amount**；通道成本由 Trinity 平台吸收（[MVP PRD §3.2](./commercial-billing-mvp-prd) 内部成本表）。

### 3.2 支付方式图标行

横向图标切换（选中高亮 + 勾）：

**微信支付** · **支付宝** · **银行转账**（MVP 可隐藏）· **银行卡** · **更多 ▾**

选中微信/支付宝时，下方展示渠道说明（如：*已选择用微信支付结账 · 您将看到一个二维码，请使用微信支付扫描*）。

### 3.3 主操作区

| 元素 | 规则 |
|------|------|
| 金额输入 | **USD**；最低 **$10** |
| **Purchase** 主按钮 | 按所选方式进入 Stripe 收银 / 展示二维码 |
| 账户标识 | 如 `Personal Account: user@email.com` |
| **Pay with Link** | 次要入口（绿色 Link 按钮，与 OR 一致） |
| 页脚说明 | *You may create invoices after buying credits.* |
| **Use one-time payment methods** | 弹窗 **底部 Toggle**，默认 **ON** | **6.30 P0 不展示**；P0.5 与绑卡弹窗联动时再上 |

---

## 4. 添加支付方式弹窗（Add a Payment Method · 1:1 复刻 OR）

**标题**：Add a Payment Method / 添加支付方式

**入口**：Credits 页「Manage payment methods」；或 Purchase Credits 内 one-time **关闭** 后引导添加。

### 4.1 Tab 结构

| Tab | 内容 | Stripe 能力 |
|-----|------|-------------|
| **银行卡** | 卡号 / 有效期 / CVC（托管表单） | Payment Element · `card` |
| **银行** | 搜索框「搜索您的银行」+ 美国银行 Logo 九宫格（Chase、BoA、Wells Fargo 等） | Financial Connections · US bank debit |
| **Cash App Pay** | Cash App 授权绑定的 | Stripe · `cashapp` |

选中银行 Tab 时展示银行搜索与网格；选中银行卡 Tab 时展示卡表单。**全部 Stripe 托管，不自建 PCI 表单。**

### 4.2 主操作与文案

| 元素 | 规则 |
|------|------|
| 主按钮 | **Save payment method** / 保存支付方式 |
| 页脚说明 | *You may **enable invoices** after saving your payment method.* |
| **Use one-time payment methods** | 弹窗 **最底部 Toggle**；绑卡场景下通常 **OFF**（与 OR 实勘一致） |

保存成功后：该方式出现在已保存列表，可用于 **Purchase Credits** 快捷支付与 **Auto top-up**。

---

## 5. Stripe 托管能力（弹窗背后）

### 5.1 Use one-time payment methods（两弹窗共用）

- **默认开启（弹窗 A）**：单次支付、不保存微信/支付宝/卡/银行账户。  
- **关闭**：允许弹窗 B 绑卡/绑银行，支持 **Auto top-up**。

### 5.2 Add a Billing Address

支付前 **必填**（地址第 2 行可选）：

- 全名  
- 国家或地区  
- 邮编  
- 省  
- 城市  
- 地址第 1 行  

**提示文案**（与 OR 一致）：

> A billing address is required to verify your identity and help prevent fraud.

### 5.3 工程约束

- **全部使用 Stripe 托管 UI**：卡、银行、Cash App、微信、支付宝均走 Stripe；不自行接收卡号/CVV。  
- 依赖 Stripe Radar、AVS、3DS；银行 Tab 依赖 **Financial Connections**（与 OR 银行九宫格一致）。  
- **分期建议**（若 6.30 工期紧）：弹窗 B **结构先齐**；Tab **银行卡 P0**，**银行 + Cash App P0.5**（Stripe 开通周期可能更长）。

### 5.4 个人发票 / 收据

- 购前在 Stripe Customer Portal / Checkout 更新账单姓名与地址。  
- 开启 **Send me Invoices**（或等价配置）以接收 Stripe Invoice。  
- Payment History 链出 Stripe 收据与 Invoice History。

---

## 6. 计费与钱包规则

| 规则 | 说明 |
|------|------|
| **计价（调用）** | 模型底价 + **usage markup**；Models 页含费一口价 |
| **充值费** | **无**（充 $N 到账 $N；Stripe 成本平台吸收） |
| **扣费** | 以上游返回 `prompt_tokens` / `completion_tokens` 为准，不预估 |
| **本位币** | **USD**；可选展示人民币参考换算；充值日锁定汇率（若展示 CNY） |
| **余额** | **永久有效**（政策变更提前 30 天公告 · [MVP PRD §4.1](./commercial-billing-mvp-prd)） |
| **流水** | Payment History 永久可查、支持 CSV 导出 |

### 6.1 防超支风控（对齐 OpenRouter）

- API Key **单日/月度消费上限**，达上限拦截调用。  
- 余额 **自定义阈值** → 站内信 + 邮件预警。  
- 异常批量、高频失败 → 自动冻结 Key 并通知用户。

---

## 7. 企业客户导流（不对公自助）

**Credits / Activity 页脚固定文案**（中英）：

> 需要企业大额预存、定制阶梯折扣、私有化 SDK、月结方案？请联系销售部门。

- 点击 → **Contact Sales** 线索表单（公司、月度消耗、合规诉求）。  
- 对公结算、企业资质核验、大额优惠：**线下商务**；前端 **无任何** 对公 Wire/Tab 入口。

---

## 8. 合规配套（MVP = OpenRouter 同级）

### 8.1 身份采集

- **仅** 支付流程内账单地址；无注册/充值前置证件、短信实名。  
- 不拦截未「实名」用户进入充值流程。

### 8.2 筛查与归档

- Stripe 内置基础 OFAC 筛查。  
- 账单地址、充值订单、消费流水、Stripe 收据归档 **≥5 年**（IRS 方向，以合规顾问为准）。  
- 页脚：**Privacy · Refund · Terms**（Stripe 商户准入）。

### 8.3 内部风险说明（备查）

MVP 产品形态、KYC 强度、交易规模与 OpenRouter 对齐；流水上涨后启用 [global-payment](./global-payment) 二期能力。

---

## 9. 分阶段落地

### 9.1 MVP 一期（6.30）

> **后端账单/计量/Activity 已完成**；以下为 **前端与充值对接** 清单。完整步骤见 [commercial-billing-mvp-prd §12](./commercial-billing-mvp-prd)。

- [ ] **P0** Purchase Credits 弹窗 + Stripe（卡/Alipay/WeChat）对接  
- [ ] **P0** Payment History · **退款说明（邮件售后）** · 说明文案  
- [ ] **P0** Contact Sales 表单 → 邮件  
- [ ] **P0.5** Add a Payment Method · Auto top-up · one-time Toggle  
- [ ] **P1** 银行 Tab / Cash App · CSV 导出  

### 9.2 二期（流水上涨 · 见 global-payment）

- [ ] 分层实名：大额充值触发证件核验  
- [ ] 独立前置 OFAC 接口  
- [ ] 企业后台对公额度、分账、企业 Invoice  
- [ ] ACH / Wire **对公自助**（企业 Tab · 见 global-payment）

---

## 10. GWT 核心用例

```gherkin
# 场景1：普通注册，打开充值弹窗
Given 用户仅邮箱注册，无前置实名
When 用户点击 Add Credits
Then 展示微信/支付宝/卡/Link 支付方式图标，无拦截
And 弹窗底部展示 Use one-time payment methods，默认开启

# 场景2：Stripe 托管收银
Given 用户选择任一支付方式
When 在 Purchase Credits 弹窗完成支付
Then Use one-time payment methods 开关可见，默认 ON
And 未填账单地址时无法完成支付，弹出地址表单
And 主字段必填，地址第2行选填

# 场景3：企业咨询
Given 用户在 Credits 或 Activity 页脚
When 点击「联系销售」
Then 跳转 Contact Sales 表单
And 前端不解锁任何对公自助充值入口

# 场景4：绑卡并开启自动续费
Given 用户关闭 Use one-time payment methods
When 打开 Add a Payment Method
Then 展示 银行卡 / 银行 / Cash App Pay 三 Tab
And 页脚为 enable invoices after saving your payment method
When 用户 Save payment method 成功
Then 支付方式可用于 Purchase Credits 与 Auto top-up
```

---

## 11. 与 global-payment 文档关系

```text
commercial-billing-mvp-prd.md     ← 6.30 商业规则 · 落地步骤 · 已/待办（真源）
mvp-openrouter-payment.md         ← UI/弹窗/Stripe 交互详规
openrouter-payment-evidence.md    ← OR 实勘 · 佐证
industry-billing-payment-report.md
```

---

## 12. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-08 | 实勘修正：OR 充值弹窗含微信/支付宝 + 底部 one-time Toggle；通道改为 Stripe 统一收银 |
| 2026-06-08 | 商业规则迁至 `commercial-billing-mvp-prd.md` |
| 2026-06-08 | **方案 A**：吸收通道费；弹窗无 fee 行（支付 UI 仍参考 OR 渠道切换） |
| 2026-06-08 | **P0 不做** Use one-time payment methods Toggle（待 P0.5 与绑卡/Auto top-up 一并设计） |

---

*最低充值、费率、聚合通道以财务与支付服务商合同为准。*

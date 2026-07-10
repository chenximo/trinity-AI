---
title: 商用计费 MVP PRD（6.30）
---

# Trinity AI · 商用计费 MVP PRD（6.30）

> **文档类型**：**6.30 商用计费落地 PRD 真源**——已拍板商业规则、页面范围、费用结构、退款与对账；**后端账单/计量已完成**，剩余 **控制台充值对接 + 文案/说明**。  
> **上级真源**：[商用计费与充值 · 总览](./)  
> **UI/支付交互详规**：[MVP 支付（OpenRouter 对齐）](./mvp-openrouter-payment)（弹窗字段、Stripe 组件）  
> **行业/竞品**：[全球化计费与退款行业报告](./industry-billing-payment-report) · [OpenRouter 支付调研与佐证](./openrouter-payment-evidence)  
> **状态**：**已拍板 · 待落地（前端充值）**  
> **日期**：2026-06-08

---

## 0. 一页纸（Executive Summary · 已确认）

```text
Trinity AI · 商用计费 MVP（6.30）

【谁】个人邮箱注册即充；企业 Contact Sales → 邮件

【怎么付】ToC：Stripe（卡/Link）+ 支付宝 + 微信；ToB：无自助对公

【怎么卖】USD 预充值 Credits；最低 $10/笔；
         充 $N 到账 $N（无充值平台费、无通道费行；Stripe 成本平台吸收，见 usage markup）

【怎么用】Chat + API Key 共用余额；成功请求后扣费；Activity 可查

【余额】永久有效；政策变更提前 30 天官网/邮件公告（Terms 法务过）

【怎么退】24h 内未使用可申请退该笔实付金额（邮件联系售后）；24h 后不退；无提现

【怎么停】余额不足 402；Key/账户限额；低余额预警

【怎么对账】usage_event ↔ 钱包 ↔ 运营 billing 同一数字

【页面】Credits / Activity / Models + Contact Sales 页脚

【不做】Wire Tab、crypto、前置 KYC、通用 withdraw
```

---

## 1. 实施状态（2026-06-08）

### 1.1 已完成（后端 / 账单）

| 能力 | 状态 | 说明 |
|------|:----:|------|
| 钱包 / Credits 账本 | ✅ | 充值入账、扣费、余额查询 |
| `usage_event` 计量写入 | ✅ | token / 模型 / 扣费 |
| Chat + API Key 共用余额扣减 | ✅ | 成功请求后扣费 |
| Activity 数据与查询 | ✅ | 消耗明细 |
| 运营 billing 对账 | ✅ | 与控制台同源 |
| 402 / 限额 / 预警（后端） | ✅ | 按 PRD 规则可配置 |

### 1.2 待完成（6.30 前端与产品）

| 能力 | 优先级 | 说明 |
|------|:------:|------|
| **Credits 页 · 充值弹窗对接 Stripe** | **P0** | Purchase Credits + 支付渠道 UI |
| **Add a Payment Method**（绑卡 / Auto top-up） | P0.5 | 见 [mvp-openrouter-payment §3–4](./mvp-openrouter-payment) |
| **Payment History**（充值记录列表） | P0 | Credits 页展示时间 / 金额 / 方式 / 状态 |
| **发票 / 收据 / 支付中心** | **待拍板** | Stripe receipt、Customer Portal、Invoice、账单地址；对外文档 **待补充**（见 §3.5） |
| **Models 含费价目展示** | P0 | 一口价千 Token |
| **Contact Sales 表单 + 发邮件** | P0 | 企业线索 |
| **充值/退款/余额政策说明文案** | P0 | Credits 页、FAQ、Terms、Refund Policy 链出 |
| **退款申请指引（邮件售后）** | P0 | Credits 页说明 + 售后邮箱；**无**自助 Refund 按钮 |
| **运营侧 · 24h 退款 SOP** | P0 | 校验未使用 → Stripe 全额退该笔实付 |
| CSV 导出（Activity / Payment） | P1 | |

---

## 2. 用户与入口

| 用户 | 充值 | 企业方案 |
|------|------|----------|
| **个人（ToC）** | 邮箱注册 → `#credits` 自助充值 | — |
| **企业（ToB）** | **无**自助对公 Tab | Credits/Activity 页脚 **Contact Sales** → 表单 → **商务邮箱** |

---

## 3. 支付（ToC）

### 3.1 通道（MVP · Stripe 统一）

| 渠道 | MVP | 底层 |
|------|:---:|------|
| **Stripe 银行卡 / Link** | P0 | [Stripe Pricing](https://stripe.com/pricing) |
| **支付宝（Alipay）** | P0 | Stripe `alipay` · [Local PM](https://stripe.com/pricing/local-payment-methods) |
| **微信支付（WeChat Pay）** | P0 | Stripe `wechat_pay` · 同上 |

Plan B：若 Stripe 某渠道未开通，再评估独立 ACQP/聚合商（费率以合同为准，**不写死进 Terms**）。

### 3.2 费用结构（已拍板 · 方案 A：吸收通道费）

| 费用类型 | Trinity | OpenRouter（对照） |
|----------|---------|-------------------|
| **充值平台费** | **$0** | 5.5% + $0.80 最低（UI：Service fees） |
| **支付通道费（Stripe 等）** | **平台吸收**；用户 **不另付** | 含在 Service fees 内 |
| **用户实付 vs 到账** | **充 $N → 到账 $N Credits** | 充 $10 → 实付 ~$10.80 → 到账 $10 |

**充值弹窗（对齐 OpenAI / Together · 非 OpenRouter 费用行）**：

| 行 | 含义 | 示例（$10） |
|----|------|-------------|
| **Amount / Credits** | 用户输入且 **到账** 的金额 | $10.00 |
| Sales Tax / VAT | 视 Stripe Tax 与属地 | N/A 或税额 |
| **Total due** | 用户实付（**= Amount**，无 Processing fee 行） | **$10.00** |

> **UI 不展示** Processing fee / Service fees 行。  
> **内部财务**：Stripe 约 **2.9% + $0.30**/笔（Alipay/微信同档；换汇可能 +1%）由平台承担，计入 **usage markup / CAC**，不对用户单列。

**内部通道成本参考（Stripe 美国公开价 · 不对用户展示）**：

| 渠道 | 参考费率 | $5 充值平台成本 | $100 充值平台成本 |
|------|----------|-----------------|-------------------|
| 美国本土卡 | 2.9% + $0.30 | ~$0.45 (~9%) | ~$3.20 (~3.2%) |
| Alipay / WeChat Pay | 2.9% + $0.30（换汇 +1%） | ~$0.45–0.50 | ~$3.20–4.20 |

**与 OpenRouter 差异（对外 FAQ）**：OR 另收 **5.5%+$0.80** 平台充值费；Trinity **充多少到账多少**，无额外充值费行。

### 3.3 最低充值

| 规则 | 值 | 依据 |
|------|:--:|------|
| 单笔最低 | **$10** | 对齐 OR 实勘默认 $10；高于 OR Terms $5 下限，降低 Stripe **$0.30** 固定费在小额占比 |

### 3.4 合规（MVP）

- **仅支付环节**采集账单地址（Stripe 托管）；**无**注册/充值前置证件、短信实名。  
- 页脚链出 **Privacy · Refund Policy · Terms**。

### 3.5 发票与收据（待拍板）

| 项 | 状态 | 说明 |
|----|:----:|------|
| **Payment History** | P0 | Credits 页列出充值记录（时间、金额、方式、状态） |
| **收据下载** | **待拍板** | 是否在列表链出 Stripe receipt — **未定** |
| **Stripe Customer Portal（支付中心）** | **待拍板** | Manage Billing、账单地址维护 — **方案未定** |
| **Stripe Invoice** | **待拍板** | 个人消费收据 / Invoice 开关与流程 — **未定** |
| **企业 Commercial Invoice** | P1 | 含税号等企业抬头 → **Contact Sales** 线下 |

> **对外文档**：trinity-docs 计费页 / FAQ 已标注 **待补充**；定稿后同步更新公开说明与 Credits 页 UI。

---

## 4. 钱包与 Credits 规则

### 4.1 余额有效期（已拍板）

| 规则 | 说明 |
|------|------|
| **默认** | Credits **永久有效**，无账户管理费 |
| **政策变更** | 保留调整权利；**至少提前 30 天**官网 + 邮件公告；**不追溯**已购余额（Terms 须法务审定） |

> 对照：OpenRouter Terms **365 天**可过期；OpenAI/Replicate **12 个月** — Trinity 选 **不过期** 作差异化。

### 4.2 扣费场景（已拍板 · 后端已实现）

| 场景 | 入口 | 扣费时机 |
|------|------|----------|
| **网页 Chat** | 控制台对话 | 请求 **成功完成** 后，按 model 价目扣减 |
| **开发者 API** | API Key | 同上；生图 / 长文本 / 流式 **以最终 usage 为准** |

**统一规则**：

- Chat 与 API **同一钱包、同一价目表**  
- 扣费依据上游 **`prompt_tokens` / `completion_tokens`**（或张/秒），**不预估**  
- **失败请求不扣费**（与上游成功语义一致；402 在余额不足时拦截）

### 4.3 Activity 页（已实现 · 前端对齐字段）

每笔消耗展示：

| 字段 | 说明 |
|------|------|
| 时间 | UTC 或用户时区 |
| 来源 | Chat / API Key（可脱敏 id） |
| 模型 | `model` slug |
| Token | prompt + completion |
| 扣费 | USD Credits |
| 筛选 / 导出 | 时间、模型、Key；**CSV P1** |

---

## 5. 定价展示（Models）

| 规则 | 说明 |
|------|------|
| 展示 | **含 markup 一口价**（千 Token / 张 / 秒）；**不展示**加价公式 |
| 扣费 | 模型官方成本 + Trinity **usage markup**（含吸收 Stripe 通道成本的定价空间） |
| 页面 | `#models` 或定价区 + docs 链出 |

---

## 6. 退款（已拍板 · 规则对齐 OpenRouter · 渠道为邮件售后）

### 6.1 用户规则（与 OpenRouter Terms 一致）

| 项 | 规则 |
|----|------|
| 时间窗 | 交易完成后 **24 小时内** 可 **申请**；**超过 24 小时不支持退款** |
| 可退 | **未使用**的该笔充值：**实付金额全额**（= 到账 Credits 本金） |
| 不退 | **超过 24h** 或 **已消费** 部分 |
| **申请方式** | **邮件联系售后**（Support）；Credits 页展示邮箱与所需信息；**MVP 不做** Recent Transactions 自助 **Refund** 按钮 |
| 审核 | 售后核对：交易时间 ≤24h、该笔对应 Credits **未被消费**、账户无异常 |
| 处理 | 通过后 **Stripe 原路退本金**；约 **5–10 工作日**（与 OR 公开说明一致） |
| _crypto_ | MVP 不做 |
| **提现** | **不做** general withdraw |

### 6.2 与 OpenRouter 差异（仅渠道，规则相同）

| 项 | OpenRouter | Trinity |
|----|------------|---------|
| 24h 窗 / 仅未使用 / 24h 后不退 | ✅ | ✅ 相同 |
| 退款金额 | unused Credits；OR **platform fees 不退** | **实付全额**（无单独充值费行） |
| 用户操作 | Credits 页 **Recent Transactions → Refund**（自助） | **发邮件至 Support**（人工审核 + Stripe 退款） |

### 6.3 用户邮件须包含（Credits 页模板）

- 注册邮箱（与账户一致）  
- Payment History 中的 **交易 ID / Stripe Payment Intent / 充值时间**  
- 退款原因（可选）  

售后邮箱：**TrinityAIInc@outlook.com**（与官网 Contact 一致）

### 6.4 运营 SOP（摘要）

```text
收到邮件 → 确认 ≤24h → 查该笔充值 unused 且未消费
  → 通过：Stripe Refund **该笔实付全额** → 扣回钱包 Credits → 回邮用户
  → 超窗 / 已消费 / 信息不全：回邮说明政策，引导 Terms
  → 内部：Stripe 原交易 processing fee 不退还商户（平台成本，不对用户单列）
```

---

## 7. 风控与停服

| 能力 | 行为 |
|------|------|
| 余额不足 | **402** + 固定文案 → 引导 `#credits` |
| 限流 | **429**（与 402 文案分离） |
| Key 限额 | 单日 / 月度消费上限 → 拦截 |
| 低余额预警 | **暂不支持**控制台自定义阈值；消耗 **80%** / **100%** 各发 **一次** 预警邮件至注册邮箱 |
| 异常调用 | 高频失败 / 批量异常 → 冻结 Key + 通知 |

---

## 8. 对账闭环（验收句）

> **注册 → 充值入账 → Chat 或 API 调用成功 → 控制台余额减少 → Activity 有记录 → 运营 billing 同一 usage 与数字**

| 步 | 真源 |
|----|------|
| 充值 | Stripe webhook → 钱包 |
| 扣费 | `usage_event` · [metering-billing](../platform/metering-billing) |
| 402 | [auth-rate-quota](../platform/auth-rate-quota) |
| 运营 | [operations/billing](../operations/billing) |

---

## 9. 页面清单

| 页面 | 路由 | MVP 范围 |
|------|------|----------|
| **Credits** | `/account/workspace/default/balance` | 余额、Add Credits、Payment History（列表）、**退款说明（邮件售后）**；**收据 / 支付中心：待拍板**；Auto top-up（P0.5） |
| **Activity** | `#activity` | 消耗明细、筛选、CSV（P1） |
| **Models** | `#models` | 含费价目 |
| **Contact Sales** | 表单页或 Modal | 公司、邮箱、月消耗、需求 → **商务邮件** |

页脚（Credits / Activity）：

> 需要企业大额预存、定制阶梯折扣、私有化 SDK、月结方案？请联系销售部门。

---

## 10. 明确不做（6.30）

| 项 | 原因 |
|----|------|
| 对公 Wire / 企业 Tab | ToB 走 Contact Sales |
| 加密货币 | 非 MVP |
| 前置 Sumsub KYC / 短信实名 | 轻量化，对齐 OR MVP |
| 通用 **withdraw / 提现** | 行业惯例：Credits 为消费金 |
| Trinity **充值平台费** | 已拍板：0 |

---

## 11. 用户可见说明文案（待上线）

### 11.1 Credits 页 · 充值说明（中英摘要）

**充值**

- 充值金额以 **USD** 计；单笔最低 **$10**。  
- **充多少，到账多少 Credits** — Trinity **不收取**充值平台费，**不向用户另收**支付通道费（与 OpenAI、Together 等一致）。  
- 实付金额 = 到账 Credits 金额（Sales Tax / VAT 若适用由 Stripe Tax 另计）。  

**余额**

- Credits 购买后 **长期有效**（无账户管理费）。我们保留未来调整余额政策的权利，并将 **至少提前 30 天** 通知。  

**退款**

- 购买后 **24 小时内**，若该笔充值对应的 Credits **尚未使用**，可 **邮件联系售后** 申请 **全额退款**（退该笔实付金额）。  
- **超过 24 小时** 或 Credits **已使用**，**不支持退款**（与 OpenRouter Terms 一致）。  
- 邮件请提供：账户邮箱、**交易 ID / 充值时间**（见 Payment History）。  
- 不支持余额 **提现**。  
- MVP **不提供** 控制台自助 Refund 按钮；审核通过后原路退回，约 **5–10 工作日**。

链出：Refund Policy · Terms · FAQ · Support 邮箱

### 11.2 与 OpenRouter 差异（对外 FAQ 可选）

| 项 | Trinity | OpenRouter |
|----|---------|------------|
| 充值体验 | **充 $N 到账 $N**；无 Service/Processing fee 行 | 另收 **5.5%+$0.80** Service fees |
| 余额过期 | **永久（含变更提前通知）** | Terms 365 天 |
| 退款规则 | 24h · 未使用 · 24h 后不退 | 相同（OR platform fee 不退） |
| 退款渠道 | **邮件售后**（无自助 Refund 按钮） | Credits 页 **Refund** 按钮 |

---

## 12. 落地步骤（6.30 剩余工作）

```text
Phase A · 充值闭环（P0）
  1. Credits 页接入 Purchase Credits 弹窗（Amount = Total due，无 fee 行）
  2. Stripe Checkout 或 Payment Element：卡 + Alipay + WeChat
  3. Webhook 入账 → 刷新余额（后端已有则仅联调）
  4. Payment History 列表（充值记录；**收据链接 / 支付中心：待拍板**，见 §3.5）
  5. Credits 页退款说明 + Support 邮箱（无自助 Refund 按钮）
  6. 运营 24h 退款 SOP + Stripe 部分退款联调
  7. 充值/退款/余额说明文案 + Refund Policy 页上线

Phase B · 体验补齐（P0.5）
  8. Add a Payment Method + Auto top-up + **Use one-time payment methods**（P0.5 · 与绑卡 UI 分岔，P0 不做）
  9. Auto top-up 设置
  10. Contact Sales 表单 → 邮件

Phase C ·  polish（P1）
  11. Activity CSV · Payment CSV
  12. 银行 Tab / Cash App（视 Stripe 开通）
  13. （可选）自助 Refund 按钮 — 非 6.30 MVP
```

---

## 13. GWT 验收用例

```gherkin
# 充值 · 吸收通道费
Given 用户在 Credits 页输入 $10
When 选择 Stripe 卡支付并完成
Then 实付 $10.00 且到账 $10.00 Credits
And 弹窗无 Processing fee / Service fees 行
And Total due 等于 Amount

# 扣费 · Chat 与 API 同源
Given 用户余额 $10
When Chat 成功完成一次 gpt-4o 调用
Then Activity 有一条记录且余额减少
When 同一用户用 API Key 成功调用
Then 同一钱包扣费且 Activity 标注来源

# 退款 · 邮件售后
Given 用户 24h 内充值 $10 且该笔 Credits 未消费
When 按 Credits 页指引邮件 Support 并提供交易 ID
Then 售后审核通过后在 Stripe 退 $10 实付全额并扣回钱包 Credits

Given 用户充值已超过 24h 或 Credits 已使用
When 用户申请退款
Then 按政策拒绝并指向 Refund Policy

# 企业
When 用户点击 Contact Sales
Then 打开表单且前端无对公 Wire 入口
```

---

## 14. 文档关系

```text
commercial-billing-mvp-prd.md     ← 本页（6.30 商业规则 · 落地步骤 · 已/待办）
mvp-openrouter-payment.md         ← UI/弹窗/Stripe 交互详规
openrouter-payment-evidence.md    ← OR 实勘与链接
industry-billing-payment-report.md← 竞品与行业
global-payment.md                 ← 二期 KYC/Wire
```

---

## 15. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-08 | 初稿：一页纸拍板；后端已完成/前端待办；落地步骤 |
| 2026-06-08 | 退款：规则对齐 OR（24h·未使用·24h 后不退）；**邮件售后**，MVP 无自助 Refund 按钮 |
| 2026-06-08 | **充值费方案 A**：吸收 Stripe 通道费；充 $N 到账 $N；无 Processing fee 行 |
| 2026-06-08 | P0 充值弹窗不含 **Use one-time payment methods**（P0.5 与绑卡/Auto top-up 同批） |
| 2026-07-10 | 对外 Support 邮箱以官网 Contact 为准（TrinityAIInc@outlook.com）；Refund Policy 写入 Terms §5 |

---

*Stripe 通道成本以 Dashboard 为准，平台内部吸收；Terms/Refund 文案须法务审定。*

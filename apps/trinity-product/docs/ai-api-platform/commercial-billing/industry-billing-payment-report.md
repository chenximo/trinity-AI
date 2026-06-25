---
title: 全球化计费与退款行业报告
---

# 全球化 AI/API 产品 · 计费、支付与退款行业报告

> **文档类型**：**商用计费 · 行业调研报告**——预充值 Credits 类产品的支付通道、退款政策、过期规则与 Trinity 对标建议；含公开文档链接索引。  
> **关联**：[商用计费总览](./) · [MVP 支付（OpenRouter 对齐）](./mvp-openrouter-payment) · [OpenRouter 支付调研与佐证](./openrouter-payment-evidence) · [OpenRouter 友商调研](../competitor-research/openrouter) · [New API 友商调研](../competitor-research/new-api)  
> **状态**：**调研稿 · 2026-06-08**（竞品条款与链接须定期复核）  
> **读者**：产品、商务、法务、财务、研发

---

## 0. Executive Summary

| 发现 | 对 Trinity 的含义 |
|------|-------------------|
| **预充值 Credits + 按量扣费** 是 AI/API 聚合与推理平台 **主流** | MVP 路径正确 |
| **Stripe 统一收单**（卡 + 本地钱包 + Invoicing）为美国主体 **默认方案** | 优先 Stripe + 自研充值 UI |
| **退款分三档**：24h 短窗退未使用（OpenRouter）/ 售出不退（OpenAI 等）/ 后付无「充值退」概念（Groq） | Trinity **规则对齐 OR**；**渠道**为邮件售后（非自助按钮） |
| **无行业通用的「余额提现」** | Trinity 不做 withdraw |
| **Credits 过期**：12 个月常见；OpenRouter Terms 365 天；Together 文档称不过期 | **须拍板** Trinity Terms 过期策略 |
| **充值费行业分三档**：OR **显式收 5.5% 平台费** / 主流 **充值面额=到账 Credits（平台吸收 Stripe）** / 后付 **无预充值费** | Trinity **已拍板方案 A**：吸收通道费，充 $N 到账 $N |
| **支付方式**：美国主体竞品多为 **Stripe 卡**；**Alipay** 在直连 API 平台中 **仅 OR 等少数公开支持** | Trinity MVP：Stripe 卡 + Alipay + 微信；与 OR 支付栈类似，**费用策略可不同** |

---

## 1. 产品地图：谁在玩「充值使用」

```text
                    预充值 Credits / 余额 → 按用量扣费
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   API 聚合 / 路由          推理平台              模型托管 / 多模态
   OpenRouter              Together AI           Replicate
   New API（开源）          Fireworks AI          Modal / fal.ai 等
                            Groq（混合）
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
              直连模型 API（同样大量采用预付费 Credits）
                    OpenAI API · Anthropic API
```

| 类型 | 代表 | 与 Trinity 关系 |
|------|------|-----------------|
| **API 聚合** | OpenRouter | **主对标** |
| **开源聚合台** | New API | 运营后台 + 自配支付；国内场景 |
| **推理 SaaS** | Together、Fireworks、Groq | 计费形态可参考 |
| **模型运行** | Replicate | 2025 起新户默认预付费 |
| **模型原厂 API** | OpenAI、Anthropic | 预付费 + 1 年过期 + 不退 |

---

## 2. 业界四种支付玩法

### 2.1 预充值 Credits（Trinity / OpenRouter 主路径）

| 要素 | 业界常见做法 |
|------|--------------|
| 货币 | **USD** 标价；华人用户可选 Alipay/WeChat（多经 Stripe） |
| 充值 | 自助购 Credits；多数 **充值金额 = 到账 Credits**（通道成本平台吸收）；OR 等少数 **另收充值费** |
| 消费 | 按 token / 次 / 秒从余额扣 |
| 补款 | **Auto recharge / Auto reload / Auto top-up** |
| 发票 | Stripe Invoice、`invoice.stripe.com`、Billing Portal |
| 企业 | **Contact Sales** → Wire / 合同 / Net30；前端无自助对公 Tab |

### 2.2 绑卡后付 / 月结（B2B / 部分遗留账户）

| 代表 | 说明 |
|------|------|
| AWS / Azure / GCP | 先用后付 + 月 Invoice |
| Groq Developer | 绑卡 **按量后付** |
| Replicate 老账户 | 2025-07 前注册可 **月结** |
| Fireworks 老账户 / Enterprise | **Postpaid** 合同 |

### 2.3 订阅包月（非 API 聚合主形态）

ChatGPT Plus、Copilot 等——固定月费 + 额度包，退款按 **订阅周期**，不适合 token 单价频繁变动的纯 API 聚合。

### 2.4 Merchant of Record（MoR）

Paddle、Lemon Squeezy 等代征 VAT——中小 SaaS 常见；**高流量 API 平台较少**作为主通道。

---

## 3. 竞品计费与退款详表

> 以下为 **2026-06 公开文档** 摘要；具体以各平台最新 Terms 为准。

### 3.1 横向对比（含支付方式 · 充值费）

> **读表说明**  
> - **支付方式**：公开文档/实勘可确认项；底层多为 **Stripe**（除 OR crypto、企业 Wire/ACH）。  
> - **用户可见充值费**：充值 UI/Terms 是否 **单独一行**向用户收取（不含 API 用量 markup）。  
> - **费用性质**：`平台费` = 高于支付通道成本的加价；`通道透传` = 约等于 Stripe 2.9%+$0.30；`无` = 用户实付 ≈ 到账 Credits。

| 产品 | 计费模式 | 支付方式（MVP 相关） | 最低充值 | Auto 补款 | Credits 过期 | 用户可见充值费 | 费用性质 | 退款 | 提现 |
|------|----------|----------------------|:--------:|:---------:|:------------:|----------------|----------|------|:----:|
| **[OpenRouter](https://openrouter.ai/terms)** | 预付费 | Stripe **卡/Link**；**Alipay**；**USDC**（Coinbase）；PayPal 筹备中 | $5 | ✅ | **365 天** | **5.5% + $0.80 最低**（UI：Service fees） | **平台费**（高于 Stripe 纯通道成本） | 24h 未使用；fee 不退 | ❌ |
| **[Together AI](https://docs.together.ai/docs/billing-payment-methods)** | 预付费 | **Visa/MC/Amex 卡**；企业 **ACH** | $5 | ✅ | 文档称不过期 | **无单独行** | **无**（吸收） | 偏售出不退 | ❌ |
| **[Fireworks AI](https://docs.fireworks.ai/faq/billing-pricing-usage/billing/credit-system)** | 2026-07 起自助预付费 | **信用卡**（Billing 绑卡购 Credits） | 自定 | ✅ | Terms 为准 | **无单独行** | **无**（吸收） | 一般不退 | ❌ |
| **[Replicate](https://replicate.com/docs/topics/billing/prepaid-credit)** | 新户预付费 | **信用卡/借记卡**；Terms 含 **bank transfer** | 自定 | ✅ | **12 个月** | **无单独行** | **无**（吸收） | 不可退 | ❌ |
| **[Groq](https://console.groq.com/docs/legal/archive/)** | **后付**为主 | **信用卡**绑卡按量；可选 Prepayment | 绑卡 | 按量扣 | N/A | **无**（预付费条款 non-refundable） | **无** | non-refundable | ❌ |
| **[OpenAI API](https://openai.com/policies/service-credit-terms/)** | 预付费 Credits | **信用卡/借记卡**（Stripe）；**无** Alipay/微信直连 | ~$5 | ✅ | **12 个月** | **无单独行** | **无**（吸收） | 售出不退 | ❌ |
| **[Anthropic API](https://console.anthropic.com/)** | 预付费 Credits | **Visa/MC/Amex 等卡**；企业 Invoice | ~$5 | ✅ | **12 个月** | **无单独行** | **无**（吸收） | 不可退 | ❌ |
| **New API（开源）** | 运营可配 | **自配**（国内常接微信/支付宝独立通道） | 自定 | 可配 | 可配 | **可配** | 视部署 | 后台策略 | 视部署 |

**支付方式小结**

| 通道 | 谁在用 | Trinity MVP |
|------|--------|-------------|
| Stripe 卡 / Link | OR、Together、Fireworks、Replicate、OpenAI、Anthropic、Groq | ✅ P0 |
| Stripe **Alipay / WeChat Pay** | **OpenRouter**（FAQ 明确）；原厂 API **普遍不支持** | ✅ P0（华人用户） |
| Crypto（USDC 等） | OpenRouter（Coinbase） | ❌ 6.30 不做 |
| ACH / Wire / 对公 | Together/Fireworks/Replicate **企业**；ToB Contact Sales | ToB 邮件，无自助 Tab |
| 国内独立 ACQP | New API 类自部署 | Plan B，非 MVP 默认 |

**充值费小结**

| 策略 | 代表 | 用户感知 | Trinity |
|------|------|----------|---------|
| **吸收通道成本** | OpenAI、Together、Replicate、Fireworks、Anthropic、**Trinity** | 「充 $10 得 $10 Credits」 | Trinity **方案 A 已拍板** |
| **显式平台充值费** | OpenRouter **5.5%+$0.80** | 多一行 Service fees | **不建议**跟 OR（Trinity 已定 0 平台费） |
| **通道费透传** | 少数聚合/网关 | Amount + Processing fee | ~~Trinity 原 PRD 方案 B~~ |

### 3.2 OpenRouter（主对标 · 摘要）

| 维度 | 规则 | 来源 |
|------|------|------|
| 支付处理器 | **Stripe + Coinbase** | [Terms §4.3](https://openrouter.ai/terms) |
| 平台费 | 充值 **5.5% + $0.80 最低**（UI：**Service fees**） | [FAQ](https://openrouter.ai/docs/faq) |
| 退款 | **24h**；仅 **unused Credits**；**platform fees 不退** | [Terms §4.1](https://openrouter.ai/terms)、[Zendesk Refunds](https://openrouter.zendesk.com/hc/en-us/articles/40858600529307-Refunds-and-Payment-Information) |
| 操作 | Credits 页 **Recent Transactions → Refund**；≥$50 可能需工单 | [Payment Issues §5](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |
| 到账 | 原支付方式；约 **5–10 工作日** | Zendesk Refunds |
| 发票 | Payment History → **Stripe 门户**；`invoice.stripe.com` | [Payment Issues §6](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |
| 删号 | 剩余 Credits **作废** | [FAQ](https://openrouter.ai/docs/faq) |

详实勘与证据分级 → [OpenRouter 支付调研与佐证](./openrouter-payment-evidence)。

### 3.3 其他竞品要点

**Together AI** — [Billing Credits](https://docs.together.ai/docs/billing-credits)

- 纯预付费；**$5 最低**才有平台访问权；Auto-recharge；Credits **文档称不过期**。

**Fireworks AI** — [Prepaid migration](https://fireworks.ai/blog/billing-migration-to-prepaid) · [Terms](https://fireworks.ai/terms-of-service)

- 2026-07-01 自助账户迁移预付费；余额 $0 且未开 auto reload → **停服**；退款 **除非法律要求一般不退**。

**Replicate** — [Prepaid credit](https://replicate.com/docs/topics/billing/prepaid-credit) · [Terms](https://replicate.com/terms)

- 2025-07 起新户默认预付费；**12 个月过期**；**All sales final**；余额为 0 停跑，极少数透支 **月底扣卡**。

**OpenAI / Anthropic** — [OpenAI Service Credit Terms](https://openai.com/policies/service-credit-terms/)

- Credits **不是货币**、不可转让；**1 年过期**、**售出不退**；行业争议集中在 **breakage（过期作废）**。

**Groq** — [Legal / Payment Terms](https://console.groq.com/docs/legal/archive/)

- Developer Tier **后付按量**（信用卡）；Prepayment Credits 有单独条款；费用 **non-refundable**；**无**单独充值手续费行。

### 3.4 通道费 vs 平台费：要不要向用户收？（Trinity 拍板参考）

> **结论前置**：支付栈可以跟 OpenRouter 一样用 Stripe（卡 + Alipay + 微信），**充值费策略不必跟 OR**。  
> 上表 **7 家直连平台里仅 OpenRouter 对用户显式收充值费**，且其 **5.5%+$0.80 本质是平台费**，显著高于 Stripe 美国公开价 **2.9% + $0.30**（Alipay/微信同档，换汇可能 +1%）。

#### 3.4.1 竞品在收什么

| 产品 | 用户付 $10 典型到账 | 平台额外收什么 |
|------|---------------------|----------------|
| OpenRouter | ~$10 Credits | 另付 **~$0.80+** Service fees（含平台利润） |
| OpenAI / Together / Replicate 等 | **$10 Credits** | 无充值费行；Stripe ~**$0.59** 由平台吸收 |
| Groq 后付 | 无预充值 | 通道费含在月度账单成本中 |

OpenRouter FAQ 将充值费称为 “fee when purchasing credits”，Terms 称 **platform fees**；**不是**「原样转嫁 Stripe 账单」的纯通道透传。

#### 3.4.2 Trinity 三种可选策略

| 方案 | UI | 优点 | 缺点 | 与谁更像 |
|------|-----|------|------|----------|
| **A · 吸收通道费（✅ Trinity 已拍板）** | 充 $10 → **到账 $10**；无 Processing fee 行 | 与 **OpenAI/Together/Replicate** 一致 | 平台承担 Stripe ~2.9%+$0.30 | 行业主流 |
| **B · 通道费透传（未采用）** | Amount + **Processing fee** + Total | 财务透明 | 用户体验差于主流 | 少数网关 |
| **C · 跟 OR 收平台充值费** | Service fees 5.5%+$0.80 | 单客充值毛利高 | 与 Trinity **0 平台费**定位冲突；比 OR 更贵会被直接对比 | OpenRouter |

#### 3.4.3 成本粗算（Stripe 美国卡 · 仅供参考）

| 充值本金 | Stripe 约成本 | 若吸收（A） | 若透传（B）用户多付 |
|----------|---------------|-------------|---------------------|
| $5 | ~$0.45 | 平台亏 ~9% 该笔 | +$0.45 |
| $10 | ~$0.59 | 平台亏 ~5.9% | +$0.59 |
| $100 | ~$3.20 | 平台亏 ~3.2% | +$3.20 |

> 吸收成本通常由 **API 用量 markup** 覆盖，而非单笔充值盈利；Together/OpenAI 等均按此逻辑。

#### 3.4.4 拍板结论（2026-06-08）

| 项 | Trinity 决定 |
|----|--------------|
| **方案** | **A · 吸收通道费** |
| **用户 UI** | 充 **$N → 到账 $N**；**无** Processing fee / Service fees 行 |
| **成本归属** | Stripe ~2.9%+$0.30 由平台承担，计入 **usage markup / CAC** |
| **与 OR** | 支付渠道可对齐；**充值费 UI 不对齐** OR（OR 有 Service fees 行） |

**与 OpenRouter 对齐关系**

| 维度 | 建议对齐 OR | 不必对齐 OR |
|------|-------------|-------------|
| Stripe 统一 + Alipay | ✅ | — |
| Purchase Credits 弹窗结构 | ✅ 可参考 | — |
| 24h 退款规则 | ✅ | 渠道：邮件 vs 按钮 |
| **充值 Service fees / 平台充值费** | — | ❌ Trinity 0 平台费 |
| **Processing fee 透传** | — | ❌ 已选 **方案 A 吸收** |

---

## 4. 退款：业界三种哲学

### 4.1 短窗 + 仅未使用（OpenRouter 档）

```text
24h 内 + 该笔充值对应 unused Credits
  → 退「本金」到原支付方式
  → Service fees / Platform fees 不退（通道费已发生）
  → 无通用「余额提现」
```

**特点**：对误充、试充相对友好；AI API 圈里 **较少见**，OpenRouter 是明确公开此政策的一家。

### 4.2 售出不退 + 过期作废（OpenAI / Replicate / Anthropic 档）

```text
All sales final
Credits 非货币、不可退、不可转
12 个月（或 Terms 约定）未用 → forfeited / breakage
```

**特点**：财务与风控最简单；用户社区 **争议最大**（过期丢余额）。

### 4.3 后付按量（Groq 档）

```text
绑卡 → 按 usage 扣款 / 月结
几乎无「充值退款」；只有账单争议与 chargeback
```

**特点**：用户心智是「账单」不是「钱包」。

---

## 5. 支付通道：全球化分层

```text
  海外个人 / 小团队     Stripe（卡 / Link / Apple Pay 等）
  华人 / 无国际卡       Stripe 内 Alipay / WeChat Pay（优先）
  加密用户             Coinbase / USDC（OpenRouter 有；Trinity MVP 可不做）
  企业大额             Contact Sales → Wire / PO / 合同 Invoice
```

| 结论 | 依据 |
|------|------|
| 美国主体 MVP **Stripe 一家为主** | [Stripe × OpenRouter 新闻稿](https://stripe.com/newsroom/news/openrouter-and-stripe)；[OR Terms](https://openrouter.ai/terms) |
| 自研 **Purchase Credits** 外壳 + Stripe Elements | 实勘；见 [openrouter-payment-evidence](./openrouter-payment-evidence) |
| **无公开佐证**：第三方批量 USD 汇入 Stripe 余额 | 见佐证文档 §5 |

---

## 6. 术语统一（Trinity 对外口径 · 视充值费方案调整）

| UI / 用户说法 | Terms 说法 | 退款 |
|---------------|------------|------|
| **方案 A（已拍板）** | 无充值费行 | Credits 面额 = 实付 = 到账 | 24h 内未使用 **实付全额** 可退（邮件售后） |
| ~~Service fees~~ | ~~Platform fees~~ | **Trinity 不使用**（避免与 OR 平台费混淆） |
| Amount / Credits 本金 | unused Credits | 24h 内可退本金 |

---

## 7. Trinity MVP 建议（汇总）

### 7.1 建议对齐 OpenRouter 的项

| 项 | 建议 |
|----|------|
| 计费 | USD 预充值 → 按 token 扣 |
| 支付 | Stripe 统一（卡 + Alipay + 微信）+ 自研充值 UI |
| 充值费 | **方案 A 已拍板**：吸收通道费 · 充 $N 到账 $N → [§3.4](./industry-billing-payment-report#34-通道费-vs-平台费要不要向用户收trinity-拍板参考) |
| 退款 | **24h / 未使用 / 原路退 / 24h 后不退**（规则对齐 OR） |
| 退款渠道 | **邮件 Support**（MVP 无自助 Refund 按钮；P1 可评估自助） |
| 自动充值 | Auto top-up + 绑卡（Add Payment Method） |
| 发票 | Stripe Portal + `invoice.stripe.com` |
| 企业 | Contact Sales；无自助 Wire |
| 提现 | **不做** |

### 7.2 须拍板项

| 项 | 选项 |
|----|------|
| **充值通道费** | ~~A/B 待拍板~~ → **已拍板 A 吸收** |
| **Credits 过期** | 跟 OR **365 天** / 跟 OpenAI **12 个月** / Together 式 **不过期** / Trinity 自定 |
| **大额退款阈值** | OR Zendesk 两处 **$50 vs $500** 不一致——以自家 UI + 法务为准 |
| **最低充值** | **$5**（跟 OR Terms）或更高 |

### 7.3 不建议 MVP 采用的项

- 通用 **余额提现（withdraw）**
- 无时间窗的 **全额随时退**（通道成本与滥用风险）
- 三套独立支付集成（Alipay+ + 微信第三方 + Stripe）**作为默认**——除非 Stripe 无法复现 OR 实勘行为

---

## 8. 官方与行业链接索引

### 8.1 OpenRouter

| 文档 | 链接 |
|------|------|
| Terms | [openrouter.ai/terms](https://openrouter.ai/terms) |
| FAQ | [openrouter.ai/docs/faq](https://openrouter.ai/docs/faq) |
| Zendesk · Payment Issues | [41976886293403](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |
| Zendesk · Refunds | [40858600529307](https://openrouter.zendesk.com/hc/en-us/articles/40858600529307-Refunds-and-Payment-Information) |
| Stripe Projects | [docs/guides/overview/stripe-projects](https://openrouter.ai/docs/guides/overview/stripe-projects) |
| Credits | [openrouter.ai/settings/credits](https://openrouter.ai/settings/credits) |

### 8.2 竞品

| 产品 | 链接 |
|------|------|
| Together · Credits | [docs.together.ai/docs/billing-credits](https://docs.together.ai/docs/billing-credits) |
| Fireworks · Prepaid | [fireworks.ai/blog/billing-migration-to-prepaid](https://fireworks.ai/blog/billing-migration-to-prepaid) |
| Fireworks · Terms | [fireworks.ai/terms-of-service](https://fireworks.ai/terms-of-service) |
| Replicate · Prepaid | [replicate.com/docs/topics/billing/prepaid-credit](https://replicate.com/docs/topics/billing/prepaid-credit) |
| Replicate · Terms | [replicate.com/terms](https://replicate.com/terms) |
| Groq · Legal | [console.groq.com/docs/legal/archive](https://console.groq.com/docs/legal/archive/) |
| OpenAI · Service Credits | [openai.com/policies/service-credit-terms](https://openai.com/policies/service-credit-terms/) |
| Anthropic vs OpenAI 计费对比 | [vantage.sh/blog/anthropic-vs-openai-api-costs](https://www.vantage.sh/blog/anthropic-vs-openai-api-costs) |

### 8.3 Stripe

| 文档 | 链接 |
|------|------|
| Stripe × OpenRouter | [stripe.com/newsroom/news/openrouter-and-stripe](https://stripe.com/newsroom/news/openrouter-and-stripe) |
| Alipay | [docs.stripe.com/payments/alipay](https://docs.stripe.com/payments/alipay) |
| WeChat Pay | [docs.stripe.com/payments/wechat-pay](https://docs.stripe.com/payments/wechat-pay) |
| Billing Credits | [docs.stripe.com/billing/subscriptions/usage-based/billing-credits](https://docs.stripe.com/billing/subscriptions/usage-based/billing-credits) |

---

## 9. 本目录文档关系

```text
index.md                           ← 商用计费总览 · 6.30 范围
industry-billing-payment-report.md ← 本页（行业报告 · 竞品 · 退款哲学）
openrouter-payment-evidence.md     ← OR 实勘 · 佐证分级 · invoice 逻辑
mvp-openrouter-payment.md          ← MVP PRD 真源（UI · 规则 · GWT）
global-payment.md                  ← 二期 KYC / Wire / OFAC
```

---

## 10. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-08 | 初稿：全球化计费/支付/退款行业报告；竞品表 + Trinity 建议 + 链接索引 |
| 2026-06-08 | Trinity 退款：规则对齐 OR；MVP 邮件售后、无自助 Refund 按钮 |
| 2026-06-08 | §3.1 增 **支付方式** 列；§3.4 **通道费 vs 平台费** 拍板参考 |
| 2026-06-08 | **方案 A 已拍板**：吸收通道费；PRD/UI 同步 |

---

*竞品 Terms、费率与链接请每季度复核；对外法律承诺须法务审核。*

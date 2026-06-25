---
title: OpenRouter 支付链路调研与佐证
---

# OpenRouter 充值支付 · 调研总结与佐证索引

> **文档类型**：**商用计费 · 友商实勘与证据分级**——OpenRouter Credits 充值的产品/UI 实勘、官方公开依据、推断项与待验证项；供 Trinity MVP 支付 PRD 引用，**非 OpenRouter 官方文档**。  
> **关联**：[商用计费 MVP PRD](./commercial-billing-mvp-prd) · [行业报告](./industry-billing-payment-report) · [MVP 支付 UI 详规](./mvp-openrouter-payment) · [商用计费总览](./) · [OpenRouter 友商调研](../competitor-research/openrouter)  
> **状态**：**调研稿 · 2026-06-08**（公开链接与实勘结论；后端 API/Webhook 细节 OR 未公开）  
> **读者**：产品、研发、商务、法务（对外承诺须以 OR/Stripe 最新文本为准）

---

## 0. Executive Summary

| 结论 | 置信度 |
|------|:------:|
| OpenRouter **认 Stripe 为主支付处理器**（Terms / FAQ / Zendesk） | **高** |
| Credits 充值 UI 为 **自研外壳** + **Stripe 嵌入式组件**（卡/银行） | **高**（实勘） |
| 发票/流水在 **Stripe 门户**；部分订单有 **`invoice.stripe.com`** 收据 | **高**（Zendesk + 实测） |
| 支付宝/微信 **可能** 经 Stripe 钱包通道（非独立 OR 公开架构文档） | **中** |
| 「Alipay+ / 微信第三方 **批量 USD 转入 Stripe 余额**」 | **无公开佐证** |
| 后端具体 API（Checkout / PaymentIntent / Invoice）与 **Webhook 事件** | **OR 未公开**（行业惯例推断） |

**Trinity 建议**：用户可见行为对齐 FAQ/Zendesk/实勘 UI；后端按 **Stripe 标准预充值集成** 实现；未验证项不写入对外法律承诺。

---

## 1. 官方公开文档与链接索引

### 1.1 OpenRouter 官方

| 文档 | 链接 | 与支付相关要点 |
|------|------|----------------|
| **Terms of Service** | [openrouter.ai/terms](https://openrouter.ai/terms) | §4 预充值 Credits；§4.3 支付处理器 **Stripe + Coinbase**；Stripe 支付 **USD**；$5–$25,000/笔；24h 退款；Credits **365 天**可过期 |
| **FAQ** | [openrouter.ai/docs/faq](https://openrouter.ai/docs/faq) | Credits 页充值；**「If you paid using Stripe…」**；查 **stripe receipt email**；Credits 延迟 ≤1h；接受 **信用卡 + AliPay + USDC**；平台费 **5.5%（$0.80 最低）** |
| **FAQ（Markdown）** | [openrouter.ai/docs/faq.md](https://openrouter.ai/docs/faq.md) | 同上 |
| **Zendesk · Payment Issues** | [Payment Issues - Common Fixes](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) | **「With our current Stripe setup」**；Payment History → **Stripe dashboard**；Invoice History；购后 **不可改** 发票信息 |
| **Stripe Projects 集成** | [Stripe Projects Integration](https://openrouter.ai/docs/guides/overview/stripe-projects) | OR 为 launch partner；CLI 开户；**Unified billing**；支付方式在 Stripe 侧 |
| **Stripe Projects（Blog）** | [OpenRouter on Stripe Projects](https://openrouter.ai/blog/openrouter-on-stripe-projects/) | 绑 Stripe 支付方式；Free / Pay-as-you-go |
| **Credits 页** | [openrouter.ai/settings/credits](https://openrouter.ai/settings/credits) | 充值入口 |
| **Activity** | [openrouter.ai/activity](https://openrouter.ai/activity) | 用量明细 |
| **Support** | [openrouter.ai/support](https://openrouter.ai/support) | 账单工单 |
| **文档总索引** | [openrouter.ai/docs/llms.txt](https://openrouter.ai/docs/llms.txt) | 全站 docs 列表 |

### 1.2 Stripe 官方（OpenRouter 合作说明）

| 文档 | 链接 | 要点 |
|------|------|------|
| **Stripe × OpenRouter 新闻稿** | [stripe.com/newsroom/news/openrouter-and-stripe](https://stripe.com/newsroom/news/openrouter-and-stripe) | OR 使用 **Stripe Invoicing、Stripe Tax、Radar**；经 Stripe 收 **Alipay、WeChat Pay、Cash App** 等 |
| **Stripe Alipay** | [docs.stripe.com/payments/alipay](https://docs.stripe.com/payments/alipay) | 美国商户可接 Alipay；redirect 至支付宝授权；**Standard payout** 至 Stripe Balance |
| **Stripe WeChat Pay** | [docs.stripe.com/payments/wechat-pay](https://docs.stripe.com/payments/wechat-pay) | 美国商户可接 WeChat Pay；资金记入 **Stripe balance** |

### 1.3 产品边界（Alipay+ ≠ 微信）

| 文档 | 链接 | 要点 |
|------|------|------|
| **Alipay+ 文档** | [docs.alipayplus.com](https://docs.alipayplus.com/alipayplus/alipayplus/integration_cashier_acq_unified/accept_payment) | Alipay+ 为蚂蚁海外收单；收银可跳转 `g.alipayplus.com`；**不原生支持微信** |

> 看到 `g.alipayplus.com` **不能单独证明** OpenRouter 直连 Alipay+；**Stripe 接 Alipay 时也可能 redirect 至蚂蚁域名**。

---

## 2. UI 实勘结论（2026-06 · 非 OR 官方文档）

基于 Purchase Credits / Add a Payment Method 截图实勘；**Trinity 应对齐的交互**见 [MVP 支付 §2–4](./mvp-openrouter-payment)。

### 2.1 弹窗 A：Purchase Credits

| 元素 | 实勘 |
|------|------|
| 标题 | Purchase Credits |
| 费用行 | Amount · Service fees（如 $0.80）· Total due |
| 支付方式 | 微信 · 支付宝 · 银行 · 银行卡 · 更多 |
| 底部 Toggle | **Use one-time payment methods**（默认 **ON**） |
| Link | Pay with Link |
| 页脚 | *You may create invoices after buying credits* |

### 2.2 弹窗 B：Add a Payment Method

| 元素 | 实勘 |
|------|------|
| Tab | **银行卡** · **银行** · **Cash App Pay** |
| 银行 Tab | 搜索 + 美国银行 Logo 九宫格 |
| 主按钮 | Save payment method |
| 页脚 | *You may **enable invoices** after saving your payment method* |
| 底部 Toggle | Use one-time payment methods（绑卡场景通常 **OFF**） |

### 2.3 两弹窗分工

```text
弹窗 A（Purchase Credits）     → 立刻充值；one-time 默认 ON
弹窗 B（Add a Payment Method） → 留存支付方式 / Auto top-up；one-time 通常 OFF
```

---

## 3. 充值链路：有据 vs 推断

OpenRouter **未公开**逐步后端时序图。下表标注每步证据等级。

| # | 流程步骤 | 证据等级 | 依据 |
|---|----------|:--------:|------|
| 1 | 用户在 **Credits 页** 发起充值 | ✅ 官方 | [FAQ](https://openrouter.ai/docs/faq) |
| 2 | 支付经 **Stripe** 处理 | ✅ 官方 | [Terms §4.3](https://openrouter.ai/terms)；[FAQ](https://openrouter.ai/docs/faq)；[Zendesk](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |
| 3 | OpenRouter 后端调用 **Stripe API** | ⚠️ 推断 | OR 未写具体 API；Stripe 集成为行业惯例 |
| 4 | Stripe 处理卡 / Link / **Alipay / WeChat Pay 等** | ✅ 半官方 | [Stripe 新闻稿](https://stripe.com/newsroom/news/openrouter-and-stripe)；[Stripe Alipay/WeChat 文档](https://docs.stripe.com/payments/alipay) |
| 5 | OR 使用 **Stripe Invoicing** | ✅ 半官方 | [Stripe 新闻稿](https://stripe.com/newsroom/news/openrouter-and-stripe) |
| 6 | 支付成功 → Stripe 侧 **Invoice / Charge** | ✅ 实证+半官方 | 实测 `invoice.stripe.com`；Stripe Invoicing |
| 7 | **Webhook** → OpenRouter **加 Credits** | ⚠️ 强推断 | OR 公开文档 **未出现 webhook**；[FAQ](https://openrouter.ai/docs/faq) 称 Stripe 支付后 Credits 可能延迟 **≤1 小时** |
| 8 | **Payment History** → Stripe 门户 | ✅ 官方 | [Zendesk §6](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |
| 9 | 用户打开 **`invoice.stripe.com/...`** 查看收据 | ✅ 实证 | 实测链接；Zendesk 指向 Stripe Invoice History |

### 3.1 建议写入 PRD 的「有据版」流程

```text
用户在 Credits 页充值（FAQ）
    → 支付经 Stripe 处理（Terms / FAQ / Zendesk）
    → Stripe Invoicing 用于账单（Stripe 新闻稿）
    → 支付成功后 Credits 入账（FAQ；可能延迟 ≤1h）
    → Payment History / Invoice 在 Stripe 门户（Zendesk）
    → 部分订单有 invoice.stripe.com 收据（实测）
```

### 3.2 不应写成 OR 已证实的项

- 具体使用 Checkout / PaymentIntent / Invoice 哪一种 API  
- Webhook 事件名（如 `checkout.session.completed`）  
- 「Alipay+ / 微信服务商 **批量 USD 转入 Stripe 商户余额**」  
- 「三套完全独立底层、仅末端归集 Stripe」

---

## 4. `invoice.stripe.com` 发票逻辑

### 4.1 链接结构（实测示例）

```text
https://invoice.stripe.com/i/acct_{STRIPE_ACCOUNT_ID}/live_{INVOICE_TOKEN}?s=ap
```

| 片段 | 含义 |
|------|------|
| `invoice.stripe.com` | Stripe **Hosted Invoice Page**（官方托管域名） |
| `acct_xxx` | 商户 Stripe 账户 ID（OpenRouter 美国 Stripe 商户） |
| `live_xxx` | Live 环境某张 Invoice 的访问令牌 |
| `?s=ap` | Stripe 分享/访问参数 |

### 4.2 用户侧「开发票」流程（有官方依据部分）

| 步骤 | 说明 | 依据 |
|------|------|------|
| 购前 | 可选 *Send me Invoices*；**Manage Billing** 更新姓名/地址 | [Zendesk §6](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |
| 支付成功 | Stripe 生成收据；可能收到 **stripe receipt email** | [FAQ](https://openrouter.ai/docs/faq) |
| 购后查看 | Credits → **Payment History** → Stripe dashboard → Invoice History | [Zendesk §6](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |
| 限制 | **支付完成后不可修改/重开** 已生成发票上的账单信息 | [Zendesk §6](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes) |

> 这是 **Stripe Invoice / 美元收据**，不是中国增值税专票。发票页数据存于 **Stripe**，OpenRouter 前端/后端仅链出与同步 Credits。

### 4.3 与支付渠道的关系

| 渠道 | 是否典型出现 `invoice.stripe.com` |
|------|:---------------------------------:|
| 银行卡 / Link / 银行（Stripe） | ✅ 是 |
| 支付宝 / 微信扫码 | ⚠️ 不一定；若仍出现该链接，说明该笔经 **Stripe 清算** |

---

## 5. 支付通道：三种说法的对照

### 5.1 说法 A：全部走 Stripe（Stripe 文档 + OR 公开口径）

- [Stripe 新闻稿](https://stripe.com/newsroom/news/openrouter-and-stripe)：Alipay、WeChat Pay 等 **through Stripe**  
- [Terms §4.3](https://openrouter.ai/terms)：处理器仅 **Stripe + Coinbase**  
- [FAQ](https://openrouter.ai/docs/faq)：AliPay 与「paid using Stripe」同语境排查  

**若成立**：一套 Stripe 集成 + 自研 UI 外壳即可；Alipay/WeChat 为 Stripe Payment Method。

### 5.2 说法 B：三套独立底层 + 末端归集 Stripe（外部分析报告 · 未证实）

- 支付宝直连 **Alipay+**（`g.alipayplus.com`）  
- 微信直连 **TenPay Global + 第三方**  
- 卡走 Stripe；扫码人民币清算与 Stripe 无关，**仅 USD 尾款批量汇入 Stripe**  

**问题**：OpenRouter **公开文档无此表述**；与 Terms「payments through Stripe」及 FAQ「stripe receipt email」不易自洽。

### 5.3 产品事实（可独立成立）

- **Alipay+ 不原生支持微信** — [Alipay+ 文档](https://docs.alipayplus.com)  
- 看到蚂蚁域名 **≠** 商户直连 Alipay+（Stripe redirect 亦可）  
- 微信浮层 +「复制分享链接」= **OR 自研 UX**（实勘）；不证明后端是否 Stripe  

---

## 6. 外部分析报告评级（供内部参考）

某份「OpenRouter 充值支付全链路分析报告（修正版）」评级：

| 维度 | 评分 | 说明 |
|------|:----:|------|
| UI 分层、自研外壳 | **8.5/10** | 与实勘一致 |
| Alipay+ ≠ 微信边界 | **9/10** | 产品事实正确 |
| 银行卡 Stripe 全链路 | **9/10** | Terms/Zendesk/invoice 链接支撑 |
| 三套独立底层 + 批量归集 Stripe | **5.5/10** | **无 OR 官方佐证** |
| Trinity 按三套集成开工 | **不建议为默认** | 优先 Stripe 统一 + 自研 UI |

---

## 7. Trinity MVP 落地建议

### 7.1 对齐验收（用户可见 · 有据）

- [ ] Credits / Activity / Models 三页  
- [ ] Purchase Credits + Add a Payment Method 两弹窗（实勘结构）  
- [ ] Use one-time payment methods Toggle  
- [ ] Payment History → Stripe 门户（[Zendesk](https://openrouter.zendesk.com/hc/en-us/articles/41976886293403-Payment-Issues-Common-Fixes)）  
- [ ] Manage Billing / 购前更新地址；购后不可改 Invoice  
- [ ] Stripe 支付后 Credits 入账（允许 ≤1h 延迟，[FAQ](https://openrouter.ai/docs/faq)）  
- [ ] 企业 Contact Sales，无自助对公 Tab  

### 7.2 工程默认路径

```text
P0：Stripe 商户 + Payment Element / Checkout + Customer Portal + Webhooks
    + 自研 Purchase Credits / Add Payment Method 外壳
P0.5：确认 Stripe Dashboard 可开通 alipay / wechat_pay / Financial Connections
Plan B：仅当 Stripe 无法复现 OR 实勘行为时，再拆独立 Alipay+ / 微信通道
```

### 7.3 自行验证清单（建议 OR 实充一笔）

1. 支付宝/微信/卡各充最小额，是否均收到 **Stripe receipt email**  
2. Credits → **Payment History** 是否进入 **Stripe Customer Portal**  
3. 是否生成 **`invoice.stripe.com`** 链接（记录支付方式）  
4. （如有权限）Stripe Dashboard 是否出现对应 **PaymentIntent / Invoice**  

---

## 8. 文档关系

```text
industry-billing-payment-report.md ← 行业报告（竞品 · 退款哲学 · 链接索引）
openrouter-payment-evidence.md     ← 本页（OR 实勘 · 证据分级 · invoice）
        │
        ├── mvp-openrouter-payment.md    ← MVP PRD（UI/规则真源）
        └── global-payment.md            ← 二期增强 KYC/Wire
```

---

## 9. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-06-08 | 初稿：官方链接索引、实勘 UI、有据/推断分级、invoice.stripe.com、三套通道说法对照、Trinity 建议 |

---

*公开链接请定期复核；OpenRouter / Stripe 产品与条款可能变更。对外法律承诺须法务审核。*

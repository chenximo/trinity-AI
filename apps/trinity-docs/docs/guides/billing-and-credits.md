# 计费与 Credits

Trinity 采用 **美元（USD）预充值 Credits** 模式：您先为账户充值，成功调用 API 或控制台 Chat 后，按所用 **模型 ID** 的公开价目从余额中扣减。本文说明充值、扣费、余额不足、收据与退款等对外规则；法律约束以 [服务条款](https://trinitydesk.ai/legal/terms) 为准。

::: tip 快速入口
- 充值与余额：[控制台 · Credits](https://trinitydesk.ai/account/console#credits)
- 消耗明细：控制台 **Activity**
- 模型单价：[模型广场](https://trinity.ai/models)
:::

---

## Credits 是什么

| 项 | 说明 |
| --- | --- |
| **Credits** | 账户内的 **USD 预充值余额**，用于支付 API 与 Chat 调用 |
| **货币** | 以 **USD（$）** 展示与结算 |
| **共用钱包** | 控制台 **Chat** 与 **API Key** 调用 **共用同一余额** |
| **到账规则** | **充 $N 到账 $N Credits** — 充值弹窗 **不另收** Processing fee / Service fees 行 |

Credits **长期有效**（无账户管理费）。若未来调整有效期或相关规则，我们将 **至少提前 30 天** 在官网或邮件通知；**不追溯** 已购余额。详见 [服务条款](https://trinitydesk.ai/legal/terms)。

---

## 计费方式（按量）

Trinity 对成功完成的调用 **按量扣费（Pay-as-you-go）**：

```text
充值 USD → 账户 Credits 余额
       ↓
每次 API / Chat 成功完成 → 按 model 价目扣减
       ↓
控制台 Activity 可查看明细
```

| 能力 | 计量维度 | 说明 |
| --- | --- | --- |
| **生文** | Token（prompt + completion） | `POST /v1/chat/completions` 等 |
| **生图** | 按张 / 次 | 见 [生图指南](../multimodal/image-generation.md) |
| **生视频** | 按秒 / 次 | 见 [生视频指南](../multimodal/video-generation.md) |

**统一规则**：

1. 扣费依据 **实际上游 usage**（如 token 数），**不在请求前预估扣款**。
2. **失败请求通常不扣费**（与上游成功语义一致；余额不足时网关返回 **402**，请求不会进入扣费）。
3. 各 **模型 ID** 的单价以 [模型广场](https://trinity.ai/models) 或控制台 **Models** 页为准；文档 **不承诺** 固定数值，价格可能随上游调整而更新。

::: info 价目展示
对外展示为 **含平台服务的最终价**（如每千 Token、每张、每秒）。Trinity **不在用户界面展示** 上游成本与加价公式。
:::

---

## 充值 Credits

### 入口

1. 登录 [Trinity 控制台](https://trinitydesk.ai/account/console#credits)。
2. 打开 **Credits** 面板，点击 **Purchase Credits**（或 **Add Credits**）。
3. 输入金额并完成支付。

### 支持的支付方式（个人）

| 方式 | 说明 |
| --- | --- |
| **银行卡** | 经 Stripe 托管收银（Visa / Mastercard / Amex 等） |
| **Link** | Stripe Link 一键支付（若账户已绑定） |
| **微信支付** | 经 Stripe · 扫码支付 |
| **支付宝** | 经 Stripe · 跳转授权支付 |

::: warning 企业客户
**企业大额预存、Wire 对公汇款、月结合同、定制阶梯价** 不提供控制台自助充值。请在 Credits / Activity 页脚使用 **Contact Sales** 联系销售团队。
:::

### 金额规则

| 规则 | 值 |
| --- | --- |
| **单笔最低充值** | **$10** |
| **到账** | 实付 **=** 到账 Credits（无额外充值费行） |
| **税 / VAT** | 视账单地址、属地及 Stripe Tax 配置；若有税额，在 Stripe 收银流程中展示 |

输入低于 $10 时，控制台会提示调整金额且无法提交支付。

### 支付历史与收据

- **Payment History**（Credits 页）列出充值记录：时间、金额、方式、状态。
- 通过 **Stripe receipt** 或 Stripe Customer Portal 查看 / 下载收据。
- 购前可在 Stripe 流程中更新 **账单地址**；部分场景支持后续开具 **Invoice**（以 Stripe 能力与账户配置为准）。

---

## 扣费与用量查询

| 入口 | 内容 |
| --- | --- |
| **Credits** | 当前 **Available balance**、Payment History |
| **Activity** | 按时间查看 Chat / API 消耗：模型、Token、扣费金额 |
| **控制台 · API 密钥** | Key 维度用量摘要（若已开放） |

扣费发生在请求 **成功完成之后**。流式（SSE）与生图 / 生视频等异步任务，以 **最终 usage** 为准。

---

## 余额不足（402）

当账户余额不足以支付即将发生的调用时，网关返回 **HTTP 402**。

| 项 | 说明 |
| --- | --- |
| **含义** | 余额或可用额度不足 |
| **客户端建议** | 引导用户至 [控制台 · Credits](https://trinitydesk.ai/account/console#credits) 充值；勿与 **429**（限流）混淆 |
| **相关文档** | [错误与调试](../reference/error-codes.md) · [速率与限额](./rate-limits.md) |

::: info 402 与 429
**402** = 没钱了，去充值。**429** = 请求太快或触发限额，请退避重试。两者文案与处理逻辑 **分开**。
:::

---

## 低余额提醒

您可在控制台设置 **低余额预警阈值**（例如 $10）。触发后可能通过 **站内通知** 与 **邮件** 提醒充值（以控制台实际功能为准）。

---

## 退款

| 项 | 规则 |
| --- | --- |
| **时间窗** | 交易完成后 **24 小时内** 可申请 |
| **可退范围** | 该笔充值 **尚未被消费** 的部分：**实付金额全额** |
| **不退** | 超过 24 小时；或该笔对应 Credits **已被使用** |
| **申请方式** | **邮件联系售后** — MVP **无** 控制台自助 Refund 按钮 |
| **处理时效** | 审核通过后 Stripe 原路退款，约 **5–10 个工作日**（以支付渠道为准） |
| **提现** | **不支持** 将 Credits 余额提现至银行账户 |

### 退款邮件须包含

1. 与 Trinity 账户一致的 **注册邮箱**
2. Payment History 中的 **交易 ID**（或 Stripe Payment Intent ID）与 **充值时间**
3. 退款原因（可选）

请发送至：**support@trinitydesk.ai**

完整法律表述见 [服务条款](https://trinitydesk.ai/legal/terms)。

---

## 企业方案

适合以下场景：

- 大额预存、对公 Wire 汇款
- 月结 / Net30、PO 采购
- 定制阶梯折扣、私有化部署

请通过控制台 **Contact Sales** 提交：公司名称、工作邮箱、预估月消耗与需求说明。销售团队将通过邮件跟进；**不提供** 控制台自助企业充值 Tab。

---

## 合规与隐私

- 充值环节由 **Stripe** 托管支付表单；Trinity **不在 MVP 阶段** 要求注册 / 充值前的证件上传或短信实名。
- 账单地址等信息在 Stripe 支付流程中采集，用于收据 / 发票与合规要求。
- 个人信息处理见 [隐私政策](https://trinitydesk.ai/legal/privacy)。

---

## 常见问题

### 充值后余额多久更新？

支付成功后，余额通常在 **数分钟内** 更新（取决于 Stripe webhook 与网络）。若超过 **1 小时** 仍未到账，请邮件 **support@trinitydesk.ai** 并附上交易 ID。

### Chat 和 API 价格一样吗？

**是。** 同一 **模型 ID** 在 Chat 与 API 使用 **同一价目表**、**同一钱包**。

### 能否用人民币标价？

账户与价目以 **USD** 为主。微信 / 支付宝经 Stripe 结算时，用户侧可能看到本地货币换算，但 Credits 仍以 USD 记账。

### Auto top-up（自动充值）有吗？

**P0.5 规划** 中；当前请手动 **Purchase Credits**。上线后本文会更新。

---

## 相关

- [快速入门](../quickstart.md)
- [速率与限额](./rate-limits.md)
- [错误与调试](../reference/error-codes.md)
- [常见问题](../faq.md)
- [服务条款](https://trinitydesk.ai/legal/terms)
- [隐私政策](https://trinitydesk.ai/legal/privacy)

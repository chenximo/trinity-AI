# 常见问题

Trinity AI 提供统一的 HTTP API 网关：通过单一 Base URL 与 API Key 调用生文、生图、生视频等能力；账户采用 **USD 预充值 Credits**，按成功调用扣费。点击问题展开答案；计费细则见 [计费与 Credits](./guides/billing-and-credits.md)，API 细节见 [快速入门](./quickstart.md)。

## 入门与产品

<FaqSection>

<FaqItem question="Trinity AI 是什么？">

Trinity 是面向开发者的 **AI API 聚合网关**：您使用 OpenAI 兼容的 HTTP 接口，通过 **`model` 字段** 选择 [模型广场](https://trinity.ai/models) 中的模型 ID，无需分别对接多家上游。控制台还提供 **Chat** 与 **API Key** 管理，二者共用同一 Credits 余额。

</FaqItem>

<FaqItem question="如何开始使用？">

1. 注册 Trinity 账户并登录 [控制台](https://trinitydesk.ai/account/keys)。
2. 在 **API 密钥** 中创建 Key（前缀一般为 `xh-...`），详见 [管理 API 密钥](./manage-api-keys.md)。
3. 按 [快速入门](./quickstart.md) 配置 `TRINITY_BASE_URL` 与 `TRINITY_API_KEY`，发送首次 `POST /v1/chat/completions` 请求。
4. 如需付费调用，在 [Credits](https://trinitydesk.ai/account/workspace/default/balance) 充值后再使用（余额不足时返回 **402**）。

</FaqItem>

<FaqItem question="支持哪些接入方式？">

当前仅 **HTTP API**（OpenAI 兼容 REST）。在 Cursor、Codex CLI、WorkBuddy 等工具中配置 Base URL 与 Key 即可，见 [应用场景 · Cookbook](./cookbook/)。

</FaqItem>

<FaqItem question="Chat 和 API 是什么关系？">

**同一账户、同一 Credits 钱包、同一模型价目表。** 控制台 Chat 与 API Key 调用在成功完成后按相同规则扣费；用量可在 **Activity** 中查看。

</FaqItem>

<FaqItem question="如何获取技术支持？">

请邮件 **starsea@trinitydesk.com**，并附上：

- 注册邮箱（与账户一致）
- 问题发生时间（UTC 或本地时区）
- 响应头 **`X-Request-Id`**（若有）
- 若涉及计费重试，附 **`X-Idempotency-Key`** / **`X-Settlement-Key`**

账单与退款问题同样发送至此邮箱。

</FaqItem>

</FaqSection>

## 计费与 Credits

<FaqSection>

<FaqItem question="Credits 是什么？">

**USD 预充值余额**，用于支付 API 与 Chat 调用。控制台与文档均以 **$** 展示。完整规则见 [计费与 Credits](./guides/billing-and-credits.md)。

</FaqItem>

<FaqItem question="如何充值？">

登录 [控制台 · Credits](https://trinitydesk.ai/account/workspace/default/balance) → **Purchase Credits** → 选择支付方式并完成支付。支持 **银行卡 / Stripe Link / 微信支付 / 支付宝**（经 Stripe 托管收银）。

</FaqItem>

<FaqItem question="单笔最低充值多少？">

**$10**。低于该金额无法提交支付。

</FaqItem>

<FaqItem question="有没有充值手续费？">

**没有单独的充值平台费或 Processing fee 行。** 您支付 **$N，到账 $N Credits**（Sales Tax / VAT 若适用，由 Stripe 在收银流程中另计）。

</FaqItem>

<FaqItem question="模型如何计价？">

按 **模型 ID** 的公开价目扣费：生文多为 **每千 Token**，生图按 **张 / 次**，生视频按 **秒 / 次**。具体价格在 [模型广场](https://trinity.ai/models) 或控制台 **Models** 页查看；文档不承诺固定数值。

</FaqItem>

<FaqItem question="什么时候扣费？">

在请求 **成功完成之后**，依据实际上游 usage（如 token 数）扣减。**失败请求通常不扣费**（余额不足时网关返回 **402**，请求不会进入扣费）。

</FaqItem>

<FaqItem question="余额不足会怎样？">

网关返回 **HTTP 402**。客户端应提示用户前往 [Credits](https://trinitydesk.ai/account/workspace/default/balance) 充值。402 与 **429**（限流）含义不同，见 [错误与调试](./reference/error-codes.md) 与 [速率与限额](./guides/rate-limits.md)。

</FaqItem>

<FaqItem question="充值后多久到账？" id="faq-topup-delay">

支付成功后，余额通常在 **数分钟内** 更新。若超过 **1 小时** 仍未到账：

1. 查收 **Stripe 收据邮件**，确认是否已扣款。
2. 若 **未扣款**，可能是卡被拒或支付未完成，请换卡或支付方式重试。
3. 若 **已扣款** 但 Credits 未增加，请邮件 **starsea@trinitydesk.com**，附上交易 ID 与充值时间。

</FaqItem>

<FaqItem question="如何申请退款？">

- **时间窗**：交易完成后 **24 小时内**
- **条件**：该笔充值 **尚未被消费**
- **金额**：**实付全额**
- **方式**：邮件 **starsea@trinitydesk.com**（须含注册邮箱、Payment History 中的交易 ID、充值时间）
- **说明**：控制台 **无** 自助 Refund 按钮；超过 24h 或已消费部分不退；**不支持** 余额提现

详见 [计费与 Credits · 退款](./guides/billing-and-credits.md#退款) 与 [服务条款](https://trinitydesk.ai/legal/terms)。

</FaqItem>

<FaqItem question="Credits 会过期吗？">

**默认长期有效**，无账户管理费。若未来政策变更，将 **至少提前 30 天** 在官网或邮件通知，且不追溯已购余额。

</FaqItem>

<FaqItem question="企业大额 / 对公 / 月结怎么办？">

请在控制台 **Contact Sales** 提交需求（公司名、工作邮箱、预估月消耗等）。**不提供** 控制台自助 Wire 或企业充值 Tab。详见 [计费与 Credits · 企业方案](./guides/billing-and-credits.md#企业方案)。

</FaqItem>

<FaqItem question="如何获取收据或 Invoice？">

Credits 页 **Payment History** 可查看充值记录。**收据下载**、**Stripe Customer Portal（支付中心）** 与 **Invoice** 能力 **待补充**，方案定稿后更新。详见 [计费与 Credits · 支付历史与收据](./guides/billing-and-credits.md#支付历史与收据)。

</FaqItem>

<FaqItem question="新用户有免费额度吗？">

是否赠送欢迎 Credits 及额度大小 **以控制台与当期公告为准**；未充值前若余额为零，付费模型调用可能返回 **402**。运营策略变更时本文档会同步更新。

</FaqItem>

</FaqSection>

## 模型

<FaqSection>

<FaqItem question="有哪些可用模型？">

见 [模型广场](https://trinity.ai/models) 或 API [获取模型](./api/models.md)。仅列表中的 **模型 ID** 可调用。

</FaqItem>

<FaqItem question="请求里的 model 填什么？">

填 **模型 ID** 字符串（如 `gpt-5.5`），**不是** 展示名称。须与账户可见列表一致，详见 [API 概述 · 模型 ID](./api/overview.md#模型-idmodel-字段)。

</FaqItem>

<FaqItem question="某模型返回 403 / 404 怎么办？">

- **404 / model_not_found**：模型 ID 错误或尚未对您账户开放 → 核对 [模型广场](https://trinity.ai/models)。
- **403**：Key 权限或模型开通状态受限 → 检查控制台 Key 与模型权限。

</FaqItem>

<FaqItem question="生图、生视频如何计费？">

与生文相同钱包、相同扣费时机；计量单位分别为 **张 / 次** 与 **秒 / 次**。参数与流程见 [多模态 · 概述](./multimodal/) 与各子指南。

</FaqItem>

</FaqSection>

## API 技术

<FaqSection>

<FaqItem question="如何鉴权？">

HTTP 头：

```http
Authorization: Bearer xh-...
```

Key 在 [控制台 · API 密钥](https://trinitydesk.ai/account/keys) 创建，前缀一般为 **`xh-...`**。

</FaqItem>

<FaqItem question="Base URL 是什么？">

生产环境默认：

```text
https://api.trinitydesk.ai/v1
```

专属部署以交付信息为准。路径须含 **`/v1`** 前缀。

</FaqItem>

<FaqItem question="能否使用 OpenAI SDK？">

**暂不支持**直接使用 OpenAI 官方 SDK（如改 `base_url` 接入）。请通过 **HTTP** 调用 Trinity API，示例见 [快速入门](./quickstart.md) 与 [Cookbook](./cookbook/)。

</FaqItem>

<FaqItem question="支持流式输出吗？">

**生文** 支持 `stream: true`（SSE），见 [流式输出（SSE）](./guides/streaming-sse.md)。**生图** 当前 **不支持** `stream: true`；**生视频** 为异步任务，见 [生视频指南](./multimodal/video-generation.md)。

</FaqItem>

<FaqItem question="重试会导致重复扣费吗？">

对同一笔业务重试时，请携带 **`X-Idempotency-Key`**（及文档所述结算相关头），以便网关识别幂等。详见 [API 概述 · 追踪与结算](./api/overview.md#追踪与结算请求头) 与 [请求参数](./guides/request-parameters.md)。

</FaqItem>

<FaqItem question="402 和 429 有什么区别？">

| 状态码 | 含义 | 处理 |
| --- | --- | --- |
| **402** | Credits 不足 | 充值 |
| **429** | 请求过快或触发限额 | 退避重试 |

</FaqItem>

<FaqItem question="如何排查 API 错误？">

1. 核对 Base URL、`model` ID、Key 格式。
2. 记录 **`X-Request-Id`**。
3. 查阅 [错误与调试](./reference/error-codes.md)。

</FaqItem>

</FaqSection>

## 隐私与数据

<FaqSection>

<FaqItem question="Trinity 会记录我的 prompt 吗？">

输入、输出在 Trinity 侧的 **存储、日志及使用范围** 以 [隐私政策](https://trinitydesk.ai/legal/privacy) 与 [服务条款 · 用户内容](https://trinitydesk.ai/legal/terms) 为准。我们 **不对上游模型服务商** 如何处理您的数据负责（包括是否用于训练）；各模型对应的上游以控制台 / 文档说明为准。

</FaqItem>

<FaqItem question="支付信息由谁处理？">

卡号等支付敏感信息由 **Stripe** 托管；Trinity **不存储** 完整卡号。账单地址与收据 / 发票流程 **待补充**（支付中心方案定稿后更新）。

</FaqItem>

<FaqItem question="合规文档在哪里？">

- [隐私政策](https://trinitydesk.ai/legal/privacy)
- [服务条款](https://trinitydesk.ai/legal/terms)

</FaqItem>

</FaqSection>

## 账户与管理

<FaqSection>

<FaqItem question="如何管理 API Key？">

见 [管理 API 密钥](./manage-api-keys.md)。创建后完整 Key **仅展示一次**，请妥善保存。

</FaqItem>

<FaqItem question="如何查看用量与余额？">

- **余额 / 充值记录**：[Credits](https://trinitydesk.ai/account/workspace/default/balance)
- **消耗明细**：控制台 **Activity**

</FaqItem>

<FaqItem question="能否设置低余额提醒？">

**暂不支持** 在控制台自定义预警阈值。系统会向注册邮箱 **自动发送预警邮件**：Credits 消耗达 **80%** 时提醒 **一次**，**完全用尽**（100% 消耗）时再提醒 **一次**。详见 [计费与 Credits](./guides/billing-and-credits.md#低余额提醒)。

</FaqItem>

<FaqItem question="如何删除账户？">

请邮件 **starsea@trinitydesk.com** 说明注销需求。未使用 Credits 的处理以 [服务条款](https://trinitydesk.ai/legal/terms) 为准。

</FaqItem>

</FaqSection>

## 故障排查

<FaqSection>

<FaqItem question="401 Unauthorized">

- 检查 `Authorization: Bearer xh-...` 是否正确
- 确认 Key 未被删除或禁用
- 见 [管理 API 密钥](./manage-api-keys.md)

</FaqItem>

<FaqItem question="402 Payment Required">

- 检查 [Credits](https://trinitydesk.ai/account/workspace/default/balance) 余额
- 见 [计费与 Credits · 余额不足](./guides/billing-and-credits.md#余额不足402)

</FaqItem>

<FaqItem question="429 Too Many Requests">

- 使用指数退避，勿无限重试
- 见 [速率与限额](./guides/rate-limits.md)

</FaqItem>

<FaqItem question="已扣款但 Credits 未到账">

见上文 [充值后多久到账？](#faq-topup-delay)。

</FaqItem>

<FaqItem question="文档与线上行为不一致">

**以实际网关响应为准。** 反馈时请附 `X-Request-Id` 与复现步骤，发送至 **starsea@trinitydesk.com**。

</FaqItem>

</FaqSection>

## 延伸阅读

<div class="tdocs-faq-related">

| 主题 | 文档 |
| --- | --- |
| 接入 | [快速入门](./quickstart.md) · [Cookbook](./cookbook/) |
| 计费 | [计费与 Credits](./guides/billing-and-credits.md) |
| 限额 | [速率与限额](./guides/rate-limits.md) |
| 错误 | [错误与调试](./reference/error-codes.md) |
| 流式 | [流式输出（SSE）](./guides/streaming-sse.md) |
| Key | [管理 API 密钥](./manage-api-keys.md) |

</div>

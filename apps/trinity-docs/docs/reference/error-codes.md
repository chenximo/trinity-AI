# 错误码

Trinity 网关返回 **OpenAI 风格 JSON 错误体**（如 `error.message`、`error.type`、`error.code`）。错误来源通常分为两类：**上游供应商** 与 **Trinity 网关**。

## 上游错误（可能透传）

| HTTP | 典型场景 | 客户端建议 |
|------|----------|------------|
| 429 | 上游供应商限流 | 指数退避重试 |
| 502 / 503 / 504 | 上游不可用或超时 | 有限次重试 |
| 401 / 403 | 上游密钥或权限问题（若供应商返回） | 检查模型权限并联系支持 |

::: info
对 429 / 5xx，Trinity 会尽量保留可解析的错误体，便于 SDK 与现有重试逻辑复用。具体字段可能因上游供应商不同而略有差异。
:::

## 网关错误

| HTTP | 典型场景 | 客户端建议 |
| --- | --- | --- |
| 400 | 请求体非法，如 `model` 格式错误、字段类型错误 | 检查请求 JSON 与参数表 |
| 401 | 缺少或无效的 `Authorization` | 检查 API Key 与 `Bearer` 头 |
| 402 | 余额或额度不足 | 检查账户余额、套餐或充值状态 |
| 403 | 权限不足、模型未开通或 Key 被限制 | 检查 Key 权限与模型开通状态 |
| 404 | 模型不存在、任务不存在或路径错误 | 检查模型 ID、`taskId` 与 URL 路径 |
| 429 | 请求过快或账户 / Key 限额触发 | 按 [速率与限额](../guides/rate-limits.md) 退避重试 |
| 5xx | 网关或上游临时异常 | 有限次重试，并记录请求 ID |

::: warning
请勿将上游原始堆栈或内部 host 暴露给终端用户；排查时记录响应头 `X-Request-Id`。
:::

## 排查清单

1. 确认 `TRINITY_BASE_URL` 含 `/v1` 前缀且与 [快速入门](../quickstart.md) 一致。
2. 确认 `model` 为平台提供的模型 ID（见 [API 概述 · 模型 ID](../api/overview.md#模型-idmodel-字段)）。
3. 记录响应头 `X-Request-Id`、`X-Settlement-Key`（见 [API 概述 · 追踪与结算](../api/overview.md#追踪与结算请求头)）并联系支持。

## 相关

- [快速入门](../quickstart.md)
- [对话补全 API](../api/chat-completions.md)
- [速率与限额](../guides/rate-limits.md)

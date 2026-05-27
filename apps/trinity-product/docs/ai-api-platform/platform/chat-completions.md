---
title: 生文 API + 流式
---

# 生文 API + 流式

::: tip 填写说明
- **5.30 成败线**：文档示例请求 **真通**（含 SSE）
:::

> **对标**：`POST /v1/chat/completions` · SSE  
> **文档**：`trinity-docs` → `/quickstart` · `/guides` 流式

## 原型与体验

| | 链接 |
|--|------|
| **原型链接** | — |
| **体验地址** | [Quickstart](http://127.0.0.1:5205/docs/quickstart) |

## 说明

对话补全主链路；支持流式与非流式。用户侧 Chat、文档 Quickstart、客户集成均依赖此能力。

## 子能力清单

| 子能力 | 5.30 验收 | 当前已做 | 说明 |
|--------|:---------:|:--------:|------|
| 非流式 `chat/completions` | ⬜ | ⬜ | |
| 流式 SSE | ⬜ | ⬜ | |
| `model` / `messages` 校验 | ⬜ | ⬜ | |
| `stream_options` / usage in stream | ⬜ | ⬜ | 可分期 |
| 上游超时与错误映射 | ⬜ | ⬜ | 见 [标准错误](./errors-observability) |

## 5.30 验收（草案）

- [ ] 文档 curl 示例返回 200 且内容合理
- [ ] `stream: true` 可持续收 chunk
- [ ] 无效 Key 401；非法 `model` 4xx

## 关联

| 模块 | 关系 |
|------|------|
| [鉴权](./auth-rate-quota) | Bearer Key |
| [路由](./routing-fallback) | 选路上游 |
| [计量](./metering-billing) | token 入账 |

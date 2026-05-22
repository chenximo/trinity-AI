---
layout: home
hero:
  name: Trinity AI
  text: API 文档
  tagline: OpenAI 兼容网关 · provider/model 路由 · 流式 SSE 与标准错误体
  actions:
    - theme: brand
      text: 快速开始
      link: /quickstart
    - theme: alt
      text: 对话补全
      link: /api/chat-completions
features:
  - title: OpenAI 兼容
    details: 将 base_url 指向 Trinity，沿用官方 SDK，仅替换 API Key。
  - title: provider/model
    details: 与 OpenRouter 相同的模型 slug 风格，例如 openai/gpt-4o。
  - title: 流式 SSE
    details: stream:true 时 chunk 格式与 OpenAI 对齐，便于前端无感切换。
---

## 文档目录

| 章节 | 说明 |
| --- | --- |
| [快速开始](./quickstart.md) | 密钥、环境变量、HTTP / SDK 示例 |
| [对话补全](./api/chat-completions.md) | `POST /v1/chat/completions` |
| [流式 SSE](./guides/streaming-sse.md) | Server-Sent Events |
| [错误码](./reference/error-codes.md) | 网关与上游错误处理 |

::: tip
内容真源为 `apps/trinity-docs/docs/**/*.md`。版式参考 [OpenRouter 文档](https://openrouter.ai/docs/quickstart)；二期由运营后台 `admin-docs` 发布 Markdown 并触发构建。
:::

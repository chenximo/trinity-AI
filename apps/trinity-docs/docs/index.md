---
layout: home
hero:
  name: Trinity AI
  text: API 文档
  tagline: HTTP API · 生文 · 生图 · 生视频 · OpenAI 兼容
  actions:
    - theme: brand
      text: 快速入门
      link: /quickstart
    - theme: alt
      text: API 概述
      link: /api/overview
features:
  - title: HTTP API
    details: OpenAI 兼容 REST，Bearer 密钥 + 标准 JSON 请求体。
  - title: 生文 / 生图 / 生视频
    details: 对话补全、图像生成、视频生成（样例对齐 OpenRouter / OpenAI）。
  - title: 流式 SSE
    details: stream:true 时 chunk 格式与 OpenAI 对齐。
---

## 文档目录

| 章节 | 说明 |
| --- | --- |
| [快速入门](./quickstart.md) · [管理 API 密钥](./manage-api-keys.md) | 接入与密钥 |
| [模块](./modules.md) · [多模态](./multimodal/) | 产品能力树 |
| [流式 SSE](./guides/streaming-sse.md) · [错误码](./reference/error-codes.md) | 闭环指南 / 参考 |
| [API 概述](./api/overview.md) | 接口参考（API Tab） |

::: tip
一期页面清单与验收闭环见工程文档 `docs/04-工程与迁移/Trinity文档站-一期MVP文档清单.md`。代码样例待产品校验后替换域名与字段。
:::

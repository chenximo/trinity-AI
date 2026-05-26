---
title: 开发者文档
---

# 开发者文档

::: tip 填写说明
- **✅ 🟡 ⬜** 见 [用户侧总览](./)；进度以总览表为准  
:::

<ul class="product-metrics">
  <li><strong>⬜</strong><span>模块盘点（当前已做）</span></li>
</ul>

> **对标**：[OpenRouter · Docs](https://openrouter.ai/docs)  
> **工程**：`apps/trinity-docs`

## 原型与体验

| | 链接 |
|--|------|
| **原型链接** | `TrinityAI/app/docs.html`（旧静态，仅供参考） |
| **体验地址** | [http://127.0.0.1:5205/docs/](http://127.0.0.1:5205/docs/)（`npm run dev:trinity-docs`） |

## 说明

对外 HTTP API 文档；**内容真源** 在 `apps/trinity-docs/docs/`，本页只做产品盘点。

| 项 | 当前已做 | 5.30 能力 | 备注 |
|----|:--------:|:---------:|------|
| 开发者文档（整体） | ⬜ | ⬜ | |

## 5.30 验收（草案）

- [ ] Quickstart 生文可按文档调通

```mermaid
flowchart LR
  Docs[开发者文档] --> Key[控制台 Key]
  Key --> API[平台侧 API]
  API --> Usage[控制台用量]
```

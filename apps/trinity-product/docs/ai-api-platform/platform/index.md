---
title: 平台侧模块
---

# 平台侧模块 · 总览

::: tip 指标待填（文内含 TODO）
- **当前已做** / **5.30 能力** 用 **✅ 🟡 ⬜** 填写  
:::

> **平台侧**：对外 HTTP API（网关、鉴权、路由、计量）。  
> **关联**：[用户侧](../user/) · [trinity-docs API](http://127.0.0.1:5205/docs/api/overview)

## 原型与体验

| | 链接 |
|--|------|
| **原型链接** | —（无独立 UI，以 API 文档为准） |
| **体验地址** | [http://127.0.0.1:5205/docs/api/overview](http://127.0.0.1:5205/docs/api/overview) |

| 模块 | 对标 OpenRouter | 当前已做 | 5.30 能力 | 备注 |
|------------|-----------------|:--------:|:---------:|------|
| 统一 API 基座 | One API | ⬜ | ⬜ | |
| 生文 API + 流式 | chat/completions | ⬜ | ⬜ | TODO：成败线 |
| 多模态 API | Images / Videos | ⬜ | ⬜ | 可分期 |
| 鉴权 · 限流 · 配额 | API Key | ⬜ | ⬜ | |
| 路由与 Fallback | 降级 | ⬜ | ⬜ | |
| 计量与计费 | Usage · Credits | ⬜ | ⬜ | |
| Data Policies | 数据策略 | ⬜ | ⬜ | |
| 标准错误与可观测 | Request ID | ⬜ | ⬜ | |

## 5.30 能力（草案，待勾选）

- `POST /v1/chat/completions` 真通（含 stream）
- Bearer 鉴权
- 用量事件可查

叶子页按模块拆分 **待建**。

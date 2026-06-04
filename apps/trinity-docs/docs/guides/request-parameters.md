# 请求参数

Trinity 将 **API Reference** 放在 **API** 顶栏下（对标 [OpenRouter](https://openrouter.ai/docs)）：

| 层级 | 位置 | 适合什么问题 |
| --- | --- | --- |
| **端点（短）** | [API 轨](../api/overview.md) · 各端点页 | 复制 curl、跑通最小请求 |
| **高级参数（长）** | [API 轨](../api/overview.md) · 高级参数分组 | 调参、联调、对全字段 |
| **概念指南** | 本轨 · 流式 / 生图流程 / 多模态 | 语义、流程、易混说明 |

---

## 通用

| 项 | 说明 |
| --- | --- |
| `Authorization` | **必填**。`Bearer xh-...` |
| `Content-Type` | **必填**。`application/json` |
| `X-Request-Id` | 可选。追踪 ID |
| `X-Idempotency-Key` | 可选。结算幂等；重试同一笔业务时保持不变 |
| `X-Conversation-Id` | 可选。会话分组 |
| `model` | **必填**。模型 ID（与 [模型广场](https://trinity.ai/models) 一致） |

详见 [API 概述 · 追踪与结算](../api/overview.md#追踪与结算请求头)。

---

## 分能力（API 轨）

| 能力 | 端点 | 高级参数 |
| --- | --- | --- |
| 生文 | [创建对话补全](../api/chat-completions.md) | [高级参数 · 生文](../api/chat-completions-parameters.md) |
| 生图 | [创建图像生成](../api/images-generations.md) | [高级参数 · 生图](../api/image-generation-parameters.md) |
| 生视频 | [创建视频生成任务](../api/videos-generations.md) | [高级参数 · 生视频](../api/video-generation-parameters.md) |

---

## 相关

- [API 概述](../api/overview.md)
- [流式输出（SSE）](./streaming-sse.md)
- [错误与调试](../reference/error-codes.md)

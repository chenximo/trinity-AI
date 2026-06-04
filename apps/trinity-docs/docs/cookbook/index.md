# 应用场景

Trinity 文档站按三条轨组织阅读路径（对标 [OpenRouter](https://openrouter.ai/docs) 顶栏分轨）：

| 顶栏 | 适合什么问题 |
|------|----------------|
| [文档](../quickstart) | 第一次接 API、密钥、多模态概念、流式与排错 |
| [API](../api/overview) | 端点、请求/响应字段、复制 curl |
| **应用场景**（本轨） | 在 **Cursor、Claude Code、Codex CLI** 等工具里如何配置 Base URL 与 Key |

::: info
本轨 **不复述** 完整 API 参数表；字段说明见 [API 端点](../api/overview) 与 [高级参数](../guides/request-parameters)。
:::

---

## 编程工具（P0）

| 工具 | 说明 |
|------|------|
| [Cursor](./coding-agents/cursor) | IDE：OpenAI 兼容 Base URL + API Key |
| [Claude Code](./coding-agents/claude-code) | CLI / 终端 Agent |
| [Codex CLI](./coding-agents/codex-cli) | OpenAI Codex 系 CLI 指向 Trinity 网关 |

更多工具（如 Claude Desktop、OpenCode、MCP）教程将陆续补充。

---

## 通用前置

1. 在 [Trinity 控制台](https://trinity.ai/account/console) 创建 API Key（演示域名以部署为准）。
2. 配置环境变量（示例）：

```bash
export TRINITY_API_KEY="xh-你的密钥"
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

3. 在工具中选择 **OpenAI 兼容** 或 **Custom OpenAI** 类接入方式。
4. **模型 ID** 与 [模型广场](https://trinity.ai/models) 一致；勿填写平台未提供的名称。

验收：在工具内发送一条短消息；失败时查 [错误与调试](../reference/error-codes)。

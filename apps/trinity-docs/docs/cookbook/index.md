# 应用场景

Trinity 文档站按三条轨组织（对标 [OpenRouter](https://openrouter.ai/docs) 顶栏）：

| 顶栏 | 适合什么问题 |
|------|----------------|
| [文档](../quickstart) | 第一次接 API、密钥、多模态、流式与排错 |
| [API](../api/overview) | 端点、字段表、复制 curl |
| **应用场景**（本轨） | 在 **Cursor、Claude Code、Codex CLI** 等工具里配置 Base URL 与 Key |

对标参考：[OpenRouter · Cookbook](https://openrouter.ai/docs/cookbook) · [Coding agents](https://openrouter.ai/docs/cookbook/coding-agents/cursor-integration)

::: info
本轨 **不复述** 完整 API 参数表；字段见 [API 概述](../api/overview) 与 [请求参数](../guides/request-parameters)。
:::

---

## 编程工具

| 工具 | 指南 |
|------|------|
| [Cursor](./coding-agents/cursor) | IDE：Override OpenAI Base URL + API Key |
| [Claude Code](./coding-agents/claude-code) | 终端 Agent · Anthropic / 兼容 Base URL |
| [Codex CLI](./coding-agents/codex-cli) | `config.toml` · OpenAI 兼容网关 |

更多工具（Claude Desktop、OpenCode 等）待产品排期后补充。

---

## 通用前置

### 1. 获取 API Key

1. 登录 [Trinity 控制台](https://trinity.ai/account/console)（生产环境以实际域名为准）。
2. 打开 **API 密钥**，创建 Key 并**一次性保存**（前缀一般为 `xh-...`）。
3. 详见 [管理 API 密钥](../manage-api-keys.md)。

### 2. 配置 Base URL

```bash
export TRINITY_API_KEY="xh-你的密钥"
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

`TRINITY_BASE_URL` **须含 `/v1`**；各工具中的 OpenAI 兼容 Base URL 填同一地址。

### 3. 选择模型 ID

在 [模型广场](https://trinity.ai/models) 复制 **模型 ID** 填入工具；勿使用平台未提供的名称。

### 4. 验收

在工具内发送一条短消息；失败时查 [错误与调试](../reference/error-codes.md)。

---

## 相关

- [快速入门](../quickstart)
- [API 概述](../api/overview)

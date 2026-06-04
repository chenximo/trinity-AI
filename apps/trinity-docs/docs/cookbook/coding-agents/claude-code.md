# Claude Code

对标参考：[OpenRouter · Claude Code integration](https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration)

## Claude Code 是什么？

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) 是 Anthropic 的**终端编程 Agent**（`claude` CLI）。若网关提供 **Anthropic API 兼容** 或工具支持 **OpenAI 兼容 Base URL**，可将请求指向 Trinity，复用 `xh-...` Key 与 [模型广场](https://trinity.ai/models) 模型 ID。

::: warning 协议说明
Claude Code **原生面向 Anthropic Messages API**。Trinity 对外主路径为 **`POST /v1/chat/completions`（OpenAI 兼容）**。接入前请确认你的 Claude Code 版本与 Trinity 网关是否支持 **Anthropic Base URL 转发** 或 OpenAI 兼容模式；否则请优先使用 [Cursor](./cursor) 或直接调 HTTP API。
:::

---

## 快速开始

### 步骤 1：获取 Trinity API Key

1. 在 [控制台](https://trinity.ai/account/console) 创建 Key（`xh-...`）。
2. 见 [管理 API 密钥](../../manage-api-keys.md)。

### 步骤 2：连接 Claude Code 到 Trinity

按你使用的 Claude Code 版本，选择 **环境变量** 或 **项目配置**（名称以官方文档为准）。

**方式 A · 环境变量（常见）**

```bash
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinity.example/v1"

# 若工具走 OpenAI 兼容：
export OPENAI_API_KEY="$TRINITY_API_KEY"
export OPENAI_BASE_URL="$TRINITY_BASE_URL"

# 若工具走 Anthropic 兼容（且网关已支持）：
# export ANTHROPIC_API_KEY="$TRINITY_API_KEY"
# export ANTHROPIC_BASE_URL="https://api.trinity.example"  # 以网关 Anthropic 兼容说明为准
```

**方式 B · 项目配置**

在项目根目录创建 `.claude/settings.local.json`（路径以官方为准），写入 Base URL 与 Key 字段（**勿提交到 Git**）。

### 步骤 3：配置模型

Claude Code 可能通过环境变量区分角色模型，例如（**变量名以官方为准**）：

```bash
export ANTHROPIC_DEFAULT_SONNET_MODEL="doubao-seed-1-6-thinking-agent-preview"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="gpt-4o"
```

::: tip
模型值须为 Trinity **模型 ID**，不要填 Anthropic 官网型号，除非该名称在 [模型广场](https://trinity.ai/models) 中存在。
:::

### 步骤 4：验证

在项目目录运行 `claude`，发送一句短 prompt，确认无 401/404。

---

## 工作原理（概念）

1. **直连网关**：工具将 `BASE_URL` 指向 Trinity，由网关鉴权并路由到 `model` 对应上游。
2. **模型字段**：请求体或环境中的 `model` 使用 Trinity 模型 ID。
3. **计费**：按 Trinity 控制台与 Key 所属 workspace 规则结算；高级参数见 [对话补全 · 高级参数](../../api/chat-completions-parameters.md)。

---

## 为什么用 Trinity + Claude Code？

- **统一 Key**：与 Cursor、HTTP 脚本共用 Trinity API Key 策略（在支持的前提下）。
- **模型广场选型**：按账号可见列表切换模型 ID，无需在终端改多套上游账号。
- **与 API 文档一致**：排错、流式、工具调用行为对照 [API 轨](../../api/overview)。

---

## 限制

- Claude Code 针对 Anthropic 模型优化，**非 Anthropic 模型 ID** 可能出现工具调用或 thinking 块异常。
- 若网关仅开放 OpenAI 兼容路径，须确认 Claude Code 版本是否支持，否则改用 [Cursor](./cursor)。
- `thinking_*`、`tools` 等是否透传取决于模型与网关，见 [高级参数 · 生文](../../api/chat-completions-parameters.md)。

---

## 故障排除

| 现象 | 处理 |
|------|------|
| 认证失败 | Key 是否为 `xh-...`；环境变量是否被 shell profile 覆盖 |
| 模型不可用 | 对照 [模型广场](https://trinity.ai/models) |
| 协议 / 400 错误 | 确认 Anthropic vs OpenAI 兼容模式与 Base URL 路径 |
| 仍请求 anthropic.com | 检查 `ANTHROPIC_BASE_URL` 是否生效 |

---

## 相关资源

- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)
- [应用场景概述](../)
- [快速入门](../../quickstart) · [错误与调试](../../reference/error-codes.md)

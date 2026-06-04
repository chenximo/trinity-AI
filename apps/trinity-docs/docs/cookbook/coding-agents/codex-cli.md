# Codex CLI

对标参考：[OpenRouter · Codex CLI integration](https://openrouter.ai/docs/cookbook/coding-agents/codex-cli)

## Codex CLI 是什么？

[Codex CLI](https://github.com/openai/codex) 是 OpenAI 开源的**终端编程 Agent**。通过 `config.toml` 配置 **OpenAI 兼容** 提供方，可将请求路由到 **Trinity 网关**，使用 `xh-...` Key 与 [模型广场](https://trinity.ai/models) 中的模型 ID。

---

## 快速开始

### 步骤 1：获取 Trinity API Key

1. 在 [Trinity 控制台](https://trinity.ai/account/console) 创建 Key。
2. 见 [管理 API 密钥](../../manage-api-keys.md)。

### 步骤 2：设置环境变量

Codex 从 `env_key` 指定的环境变量读取 Key（示例）：

```bash
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

### 步骤 3：编辑 `config.toml`

配置文件通常在 `~/.codex/config.toml`（以官方文档为准）。示例：

```toml
model_provider = "openai"
model = "doubao-seed-1-6-thinking-agent-preview"

[model_providers.openai]
name = "trinity"
base_url = "https://api.trinity.example/v1"
env_key = "TRINITY_API_KEY"
```

| 配置项 | 说明 |
| --- | --- |
| `model` | Trinity **模型 ID**（来自 [模型广场](https://trinity.ai/models)） |
| `base_url` | `TRINITY_BASE_URL`，**须含 `/v1`** |
| `env_key` | 存放 Key 的环境变量名，如 `TRINITY_API_KEY` |

::: info
部分 Codex 版本使用 `[model_providers.openrouter]` 等段名；Trinity 侧本质是 **OpenAI 兼容 REST**，按你安装的 Codex 文档选择 `openai` 或 custom provider 段，**`base_url` 指向 Trinity 即可**。
:::

也可仅用环境变量（不改 toml）：

```bash
export OPENAI_API_KEY="$TRINITY_API_KEY"
export OPENAI_BASE_URL="$TRINITY_BASE_URL"
```

### 步骤 4：运行验收

在仓库目录执行 Codex，完成一条简单任务（如「用一句话说明当前目录用途」），确认网关收到 `POST /chat/completions` 请求。

---

## 为什么用 Trinity + Codex CLI？

### 统一网关与 Key

终端 Agent 与 [快速入门](../../quickstart) 使用同一 Base URL 与 Key，便于个人与 CI 统一配置。

### 灵活切换模型 ID

修改 `config.toml` 中的 `model` 为另一模型广场 ID，无需重装 Codex。

### 参数与流式

`stream`、`max_tokens`、`tools` 等行为以 [对话补全 · 高级参数](../../api/chat-completions-parameters.md) 与上游能力为准。

---

## 限制

- Codex 版本差异大：`config.toml` 字段名以**你安装的 Codex 官方文档**为准。
- 仅支持工具所实现的 **OpenAI 兼容** 接口；Trinity 生图/生视频异步 API 不在 Codex 默认路径内。
- 推理档位、`personality` 等 Codex 专属项是否生效取决于模型与网关透传。

---

## 故障排除

| 现象 | 处理 |
|------|------|
| 仍请求 `api.openai.com` | 检查 `OPENAI_BASE_URL` / `config.toml` 是否被其他 profile 覆盖 |
| 401 | Key 须为 `xh-...` Trinity Key |
| 404 model | 模型 ID 与模型广场一致 |
| 429 | [速率与限额](../../guides/rate-limits.md) |
| 参数错误 | [请求参数](../../guides/request-parameters.md) · [API 概述](../../api/overview.md) |

---

## 相关资源

- [Codex CLI 仓库](https://github.com/openai/codex)
- [Cursor](./cursor) · [Claude Code](./claude-code)
- [快速入门](../../quickstart) · [错误与调试](../../reference/error-codes.md)

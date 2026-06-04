# 应用场景

Trinity 文档站按三条轨组织（对标 [OpenRouter](https://openrouter.ai/docs) 顶栏）：

| 顶栏 | 适合什么问题 |
|------|----------------|
| [文档](../quickstart) | 第一次接 API、密钥、多模态、流式与排错 |
| [API](../api/overview) | 端点、字段表、复制 curl |
| **应用场景**（本轨） | 在各类 **客户端 / Agent 工具** 里配置 Trinity 的 Base URL、Key 与模型 ID |

::: info
本轨 **不复述** 完整 API 参数表；字段见 [API 概述](../api/overview) 与 [请求参数](../guides/request-parameters)。
:::

---

## 如何选分类

| 分类 | 典型场景 | 工具示例 |
| --- | --- | --- |
| **编程 IDE / CLI** | 写代码、仓库内 Agent、终端补全 | Cursor、CodeBuddy IDE/CLI、Claude Code、Codex CLI |
| **智能体工作台** | 桌面 Agent、办公自动化、本地任务、MCP/Skills | WorkBuddy |

两类产品往往都用 **OpenAI 兼容** `chat/completions`，但 Trinity 文档按**使用场景**分栏，避免把「非编程 Agent」塞进「编程工具」。

---

## 编程 IDE / CLI

| 工具 | 指南 |
|------|------|
| [Cursor](./coding-agents/cursor) | IDE：Override OpenAI Base URL + API Key |
| [CodeBuddy](./coding-agents/codebuddy) | 编程向 IDE/CLI：`models.json` |
| [Claude Code](./coding-agents/claude-code) | 终端 Agent |
| [Codex CLI](./coding-agents/codex-cli) | `config.toml` |

对标 [OpenRouter · Coding agents](https://openrouter.ai/docs/cookbook/coding-agents/cursor-integration)（OR 侧栏以编程类为主）。

---

## 智能体工作台

| 工具 | 指南 |
|------|------|
| [WorkBuddy](./agent-workbench/workbuddy) | 桌面 Agent · `~/.workbuddy/models.json` |

MCP、Skills、本地执行等属产品能力，见 [WorkBuddy 官方文档](https://www.workbuddy.ai/docs/workbuddy/)；本轨只写 **Trinity 模型接入**。

更多非编程类工具待产品排期后补充。

---

## 通用前置

### 1. 获取 API Key

1. 登录 [Trinity 控制台](https://trinity.ai/account/console)。
2. 创建 Key（`xh-...`）→ [管理 API 密钥](../manage-api-keys.md)。

### 2. Base URL 与完整路径

```bash
export TRINITY_API_KEY="xh-你的密钥"
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

- **Cursor / Claude Code / Codex**：多数只需 `TRINITY_BASE_URL`（含 `/v1`）。
- **CodeBuddy / WorkBuddy**：`models.json` 里 `url` 须写 **`{TRINITY_BASE_URL}/chat/completions`**（完整路径）。

### 3. 模型 ID

从 [模型广场](https://trinity.ai/models) 复制 **模型 ID**。

### 4. 验收

在工具内完成一次短对话或任务；失败见 [错误与调试](../reference/error-codes.md)。

---

## 相关

- [快速入门](../quickstart)
- [API 概述](../api/overview)

# Codex CLI

将 OpenAI **Codex CLI**（或团队内同类 Agent CLI）的 API 指向 Trinity 网关，使用 OpenAI 兼容的 `chat/completions` 能力。

::: info
Codex / `codex` CLI 随 OpenAI 产品迭代，环境变量名以官方文档为准。下文为 Trinity 侧通用约定。
:::

---

## 1. 适用版本

- 已安装 Codex CLI（或配置为 OpenAI API 兼容的同类工具）
- 可设置自定义 `OPENAI_BASE_URL`（或工具文档中的等效项）

---

## 2. 前置

```bash
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

---

## 3. 配置步骤

1. 在 shell 配置或 Codex 配置文件中设置 OpenAI 兼容变量（示例）：

```bash
export OPENAI_API_KEY="$TRINITY_API_KEY"
export OPENAI_BASE_URL="$TRINITY_BASE_URL"
```

2. 若工具使用独立配置文件（如 `~/.codex/config`），写入同上 **Base URL** 与 **Key**。
3. 指定 **model** 为模型广场中的模型 ID（例如 `doubao-seed-1-6-thinking-agent-preview`）。
4. 在仓库目录运行 Codex 命令，执行一次简单生成任务。

::: info
`OPENAI_BASE_URL` 须指向 Trinity 且包含 `/v1`；勿与 OpenAI 官方 `api.openai.com` 混用。
:::

---

## 4. 推荐模型

- Agent 编码场景：选用模型广场中标注适用于代码场景的模型 ID。
- `max_tokens`、`stream` 等 → [对话补全 · 高级参数](../../api/chat-completions-parameters)。

---

## 5. 验收

- CLI 完成一条「解释当前目录结构」类指令并成功返回。
- 网关日志可见对应 `chat/completions` 请求。

---

## 6. 故障排除

| 现象 | 处理 |
|------|------|
| 仍请求 openai.com | 检查环境变量是否被其他 profile 覆盖 |
| 429 | [速率与限额](../../guides/rate-limits) |
| 参数报错 | 对照 [请求参数（概念）](../../guides/request-parameters) 与 API 页 |

相关：[Cursor](./cursor) · [Claude Code](./claude-code) · [API 概述](../../api/overview)

# WorkBuddy

对标参考：[WorkBuddy · 模型配置](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)

## WorkBuddy 是什么？

[WorkBuddy](https://www.workbuddy.ai) 是腾讯云代码助手团队推出的 **桌面级 AI Agent 工作台**（智能体），侧重自然语言驱动本地任务、多 Agent 协作、MCP / Skills 扩展等，**不是**以写代码为核心的 IDE。

与 [CodeBuddy](./../coding-agents/codebuddy)（编程 IDE / CLI）同属 CodeBuddy 产品线，但场景不同：

| 产品 | 定位 | 本文档 |
| --- | --- | --- |
| **CodeBuddy** | 编程 IDE / CLI、`models.json` 写代码 | [CodeBuddy 接入](../coding-agents/codebuddy.md) |
| **WorkBuddy** | 通用 Agent 工作台、办公与自动化 | 本页 |

Trinity 对外只约定 **模型调用层**：通过 OpenAI 兼容的 `POST /v1/chat/completions` 接入网关；MCP、Skills、本地执行等由 WorkBuddy 产品自身文档说明。

---

## 快速开始（自定义模型）

WorkBuddy 与 CodeBuddy 类似，使用 **`models.json`**，且 **`url` 须为完整路径**（以 `/chat/completions` 结尾）。

### 步骤 1：获取 Trinity API Key

1. 登录 [Trinity 控制台](https://trinity.ai/account/console)。
2. 创建 Key（`xh-...`）→ [管理 API 密钥](../../manage-api-keys.md)。

### 步骤 2：编辑 `models.json`

| 级别 | 路径 |
| --- | --- |
| 用户级 | `~/.workbuddy/models.json`（macOS / Linux） |
| Windows | `C:\Users\<用户名>\.workbuddy\models.json` |

```json
{
  "models": [
    {
      "id": "doubao-seed-1-6-thinking-agent-preview",
      "name": "Trinity · 对话模型",
      "vendor": "OpenAI",
      "apiKey": "xh-你的密钥",
      "url": "https://api.trinity.example/v1/chat/completions",
      "maxInputTokens": 200000,
      "maxOutputTokens": 8192,
      "supportsToolCall": true,
      "supportsImages": true
    }
  ],
  "availableModels": ["doubao-seed-1-6-thinking-agent-preview"]
}
```

::: warning URL 格式
填写 **`{TRINITY_BASE_URL}/chat/completions`**，例如 `https://api.trinity.example/v1/chat/completions`。仅写 `.../v1` **无效**。
:::

也可在 WorkBuddy **设置 → 模型** 中用 UI 添加「自定义 API」（见[官方模型说明](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)），Key 与 URL 规则相同。

### 步骤 3：重启并验收

保存后**完全退出并重启** WorkBuddy，在模型列表中选择上述 `id`，发送一条简单任务（如「总结当前目录有哪些文件类型」）验证连通。

---

## 与 Trinity API 的边界

| Trinity 文档覆盖 | WorkBuddy 产品自管（见官方文档） |
| --- | --- |
| `model` / `apiKey` / `url`（OpenAI 兼容对话） | 本地文件读写、沙箱、权限 |
| [流式 SSE](../../guides/streaming-sse.md)、[高级参数 · 生文](../../api/chat-completions-parameters.md) | MCP 服务接入 |
| [错误与调试](../../reference/error-codes.md) | Skills（`SKILL.md`）封装 |

生图、生视频等须直接调用 Trinity [API 轨](../../api/overview)，不能假设 WorkBuddy 默认对话路径支持。

---

## 为什么用 Trinity + WorkBuddy？

- **统一 Key 与模型 ID**：与 HTTP API、编程类工具共用 [模型广场](https://trinity.ai/models) 选型。
- **OpenAI 兼容**：满足 WorkBuddy 自定义模型的接口要求。
- **按任务换模型**：在 `models.json` 中配置多个 `id`，适配对话 / 长上下文等不同 Agent 任务。

---

## 限制

- 仅 **OpenAI Chat Completions 兼容** 端点；`vendor` 填 `OpenAI` 表示协议类型，不代表只能用 OpenAI 品牌模型。
- Agent 能否调用工具、读图，取决于 `supportsToolCall` / `supportsImages` 与实际上游模型能力。
- 桌面 Agent 的合规、网络与本地执行策略以 WorkBuddy 与贵司安全规范为准。

---

## 故障排除

| 现象 | 处理 |
|------|------|
| 模型列表无新项 | 确认已重启 WorkBuddy；`availableModels` 含对应 `id` |
| 请求失败 | 检查 `url` 是否含 `/chat/completions` |
| 401 | Trinity Key 是否为 `xh-...` |
| 与 CodeBuddy 配置混淆 | CodeBuddy 用 `~/.codebuddy/`，WorkBuddy 用 `~/.workbuddy/` |

---

## 相关资源

- [WorkBuddy 文档](https://www.workbuddy.ai/docs/workbuddy/)
- [CodeBuddy（编程向）](../coding-agents/codebuddy)
- [编程 IDE / CLI 索引](../) · [快速入门](../../quickstart)

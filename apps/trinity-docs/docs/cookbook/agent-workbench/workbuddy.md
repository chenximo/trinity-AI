# WorkBuddy

延伸阅读：[WorkBuddy · 模型配置](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)

## WorkBuddy 是什么？


[WorkBuddy](https://www.workbuddy.ai) 是腾讯云代码助手团队推出的 **桌面级 AI Agent 工作台**（智能体），侧重自然语言驱动本地任务、多 Agent 协作、MCP / Skills 扩展等，**不是**以写代码为核心的 IDE。

与 [CodeBuddy](./../coding-agents/codebuddy)（编程 IDE / CLI）同属 CodeBuddy 产品线，但场景不同：

| 产品 | 定位 | 本文档 |
| --- | --- | --- |
| **CodeBuddy** | 编程 IDE / CLI、`models.json` 写代码 | [CodeBuddy 接入](../coding-agents/codebuddy.md) |
| **WorkBuddy** | 通用 Agent 工作台、办公与自动化 | 本页 |

Trinity 对外只约定 **模型调用层**：通过 OpenAI 兼容的 `POST /v1/chat/completions` 接入网关；MCP、Skills、本地执行等由 WorkBuddy 产品自身文档说明。

---

## 快速开始（接入 Trinity 自定义模型）

WorkBuddy 通过 **OpenAI 兼容** 的 `POST /v1/chat/completions` 调用 Trinity。可用 **可视化界面**（推荐）或编辑 **`models.json`** 添加模型；两种方式填写的 **接口地址、API Key、模型名称** 规则相同。

::: warning URL 须写完整路径
自定义模型的 **接口地址** 必须是完整路径（以 **`/chat/completions`** 结尾）。仅填 `https://api.trinitydesk.ai/v1` **会失败**。应写：**`https://api.trinitydesk.ai/v1/chat/completions`**（即 `{TRINITY_BASE_URL}/chat/completions`）。
:::

### 步骤 1：获取 Trinity API Key

1. 打开 [Trinity 控制台 · API 密钥](https://trinitydesk.ai/account/keys)。
2. 创建 API Key（前缀 **`xh-...`**）。
3. 详见 [管理 API 密钥](../../manage-api-keys.md)。

下文示例中的 Key 请替换为 **`xh-你的密钥`**，**勿**将真实 Key 写入仓库或截图。

### 步骤 2：可视化界面配置（推荐）

在 WorkBuddy **对话页底部** 打开 **模型** 下拉，按下列顺序操作（亦见 [WorkBuddy 官方 · 模型](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)）。

**1. 进入自定义模型配置**

在模型列表底部点击 **「+ 配置自定义模型」**：

<img src="https://trinity-ai-resources-1430233363.cos.ap-singapore.myqcloud.com/trinity-docs/images/2b950444-75b0-41e3-9bcd-7fd9e347ab74.png" alt="WorkBuddy 模型下拉，底部为「+ 配置自定义模型」" width="569" />

**2. 供应商选择「自定义」**

<img src="https://trinity-ai-resources-1430233363.cos.ap-singapore.myqcloud.com/trinity-docs/images/68eae400-941a-47e4-b11e-19fc98764d09.png" alt="WorkBuddy 配置自定义模型，供应商选择自定义" width="570" />

**3. 添加模型并填写 Trinity 三项**

点击 **「添加模型」**，在表单中填写下表（与界面字段一一对应）：

<img src="https://trinity-ai-resources-1430233363.cos.ap-singapore.myqcloud.com/trinity-docs/images/99d628a7-f752-497a-9c91-5f66edbb7fc8.png" alt="WorkBuddy 添加模型表单：接口地址、API Key、模型名称" width="566" />

| WorkBuddy 界面字段 | 填写内容 | 获取方式 |
| --- | --- | --- |
| **接口地址** / API URL | `https://api.trinitydesk.ai/v1/chat/completions` | Trinity 网关 **`{TRINITY_BASE_URL}/chat/completions`**；须含 `/chat/completions`，不要只写到 `/v1` |
| **API Key** | `xh-你的密钥` | 步骤 1 在控制台创建的 Key；请求头为 `Authorization: Bearer xh-...` |
| **模型名称** / Model ID | 与 Trinity **模型 ID** 完全一致 | [模型广场](https://trinity.ai/models) 中可见的 ID，例如 `doubao-seed-1-6-thinking-agent-preview`；若你使用 `gpt-5.5` 等名称，须与广场中该模型的 **ID 字符串相同** |

::: tip 模型名称 = 请求体里的 model
WorkBuddy 发往网关时，请求 JSON 的 **`model`** 字段即此处 **模型名称**。ID 填错会导致「模型不存在」或路由失败。

若表单中有 **支持工具调用 / 读图 / 推理** 等开关，请按该模型在[模型广场](https://trinity.ai/models)的实际能力勾选（例如不支持读图则关闭 **supportsImages** 类选项）。
:::

保存后，新模型会出现在 **自定义模型** 列表；可在对话页底部 **模型** 下拉中切换使用。

### 步骤 3（可选）：编辑 `models.json` 批量添加

需要 **多个 Trinity 模型** 或团队统一分发配置时，可编辑用户级文件（**勿提交真实 Key 到 Git**）：

| 级别 | 路径 |
| --- | --- |
| 用户级（macOS / Linux） | `~/.workbuddy/models.json` |
| Windows | `C:\Users\<用户名>\.workbuddy\models.json` |

界面保存后，本机 `models.json` 会写入与上表对应的条目。WorkBuddy 当前使用 **根级 JSON 数组**（已实测可用），示例：

```json
[
  {
    "id": "gpt-5.5",
    "name": "gpt-5.5",
    "vendor": "Custom",
    "url": "https://api.trinitydesk.ai/v1/chat/completions",
    "apiKey": "xh-你的密钥",
    "supportsToolCall": false,
    "supportsImages": true,
    "supportsReasoning": false,
    "useCustomProtocol": true
  }
]
```

| 字段 | 说明 |
| --- | --- |
| `id` | **必填**。与界面 **模型名称** 相同，须为 Trinity [模型广场](https://trinity.ai/models) 中的模型 ID |
| `name` | 列表显示名；可与 `id` 相同，或写成更易识别的文案 |
| `url` | **必填**。同界面 **接口地址**，须为 `…/v1/chat/completions` |
| `apiKey` | **必填**。同界面 **API Key**（`xh-...`） |
| `vendor` | 界面选 **自定义** 时为 `Custom` |
| `supportsToolCall` | 是否支持工具调用；按模型能力填写 |
| `supportsImages` | 是否支持读图；多模态模型填 `true` |
| `supportsReasoning` | 是否支持推理/思考链；按模型能力填写 |
| `useCustomProtocol` | 自定义供应商协议；界面添加自定义模型时多为 `true` |

再追加模型时，在数组中 **追加一个对象** 即可（保持合法 JSON，对象之间用逗号分隔）。

### 步骤 4：重启并验收

1. **完全退出并重启** WorkBuddy（仅关窗口可能不够）。
2. 在 **模型** 下拉中选择刚配置的 **模型名称**（`id`）。
3. 发送一条简单任务（如「用一句话介绍 Trinity API」）验证能正常回复。

若失败，见下文 [故障排除](#故障排除)。

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

- 仅 **OpenAI Chat Completions 兼容** 端点；界面选 **自定义** 或 `vendor: "Custom"` 时，仍须填 Trinity 的 **`/chat/completions`** 完整 URL。
- Agent 能否调用工具、读图，取决于 `supportsToolCall` / `supportsImages` 与实际上游模型能力。
- 桌面 Agent 的合规、网络与本地执行策略以 WorkBuddy 与贵司安全规范为准。

---

## 故障排除

| 现象 | 处理 |
|------|------|
| 模型列表无新项 | 确认已重启 WorkBuddy；`models.json` 为合法 JSON 数组且含对应 `id` |
| 请求失败 / 404 | **接口地址** 是否含 `/chat/completions`；**模型名称** 是否与[模型广场](https://trinity.ai/models) ID 一致 |
| 401 | **API Key** 是否为有效的 `xh-...` |
| 与 CodeBuddy 配置混淆 | CodeBuddy 用 `~/.codebuddy/`，WorkBuddy 用 `~/.workbuddy/` |

---

## 相关资源

- [WorkBuddy 文档](https://www.workbuddy.ai/docs/workbuddy/)
- [CodeBuddy（编程向）](../coding-agents/codebuddy)
- [编程 IDE / CLI 索引](../) · [快速入门](../../quickstart)

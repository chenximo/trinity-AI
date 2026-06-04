# CodeBuddy

对标参考：[CodeBuddy · models.json 配置](https://www.codebuddy.ai/docs/ide/Features/models)（腾讯云代码助手）

## CodeBuddy 是什么？

[CodeBuddy](https://www.codebuddy.ai)（腾讯云代码助手）是面向**编程场景**的 AI IDE / CLI，支持自定义模型。通过 **`models.json`** 配置 **OpenAI 兼容** 接口，可将请求指向 **Trinity 网关**，使用 `xh-...` Key 与 [模型广场](https://trinity.ai/models) 中的模型 ID。

通用桌面 Agent（非编程主线）见同系的 [WorkBuddy](../agent-workbench/workbuddy)。

::: warning URL 须写完整路径
CodeBuddy 自定义模型的 **`url` 必须是完整接口路径**（通常以 **`/chat/completions`** 结尾）。仅填 `https://api.example.com/v1` 这类 Base URL **会失败**。Trinity 应写：`{TRINITY_BASE_URL}/chat/completions`（例如 `https://api.trinity.example/v1/chat/completions`）。
:::

---

## 快速开始

### 步骤 1：获取 Trinity API Key

1. 登录 [Trinity 控制台](https://trinity.ai/account/console)。
2. 创建 API Key（前缀 **`xh-...`**）。
3. 详见 [管理 API 密钥](../../manage-api-keys.md)。

### 步骤 2：准备 `models.json`

配置文件位置（**项目级优先于用户级**）：

| 级别 | 路径 |
| --- | --- |
| 用户级 | `~/.codebuddy/models.json` |
| 项目级 | `.codebuddy/models.json`（仓库根目录） |

将 `TRINITY_BASE_URL` 与 Key 代入下方示例（**勿提交真实 Key 到 Git**）。

```json
{
  "models": [
    {
      "id": "doubao-seed-1-6-thinking-agent-preview",
      "name": "Trinity · 生文示例",
      "vendor": "OpenAI",
      "apiKey": "xh-你的密钥",
      "url": "https://api.trinity.example/v1/chat/completions",
      "maxInputTokens": 200000,
      "maxOutputTokens": 8192,
      "supportsToolCall": true,
      "supportsImages": true,
      "supportsReasoning": false
    }
  ],
  "availableModels": ["doubao-seed-1-6-thinking-agent-preview"]
}
```

| 字段 | 说明 |
| --- | --- |
| `id` | **必填**。与 Trinity **模型 ID** 一致（[模型广场](https://trinity.ai/models)） |
| `apiKey` | Trinity Key 的**实际值**（非环境变量名） |
| `url` | **`{TRINITY_BASE_URL}/chat/completions`**，含 `/chat/completions` |
| `supportsToolCall` / `supportsImages` | 按模型能力设置；看图需 `supportsImages: true` |
| `availableModels` | 可选；限制 UI 中可选模型列表 |

`id` 须与请求体中的 `model` 一致；多模型时在 `models` 数组中追加多项。

### 步骤 3：IDE 中选择模型

1. 重启 CodeBuddy IDE 或重新加载配置（以官方说明为准）。
2. 在模型选择器中选 `availableModels` 中的 ID。
3. 发起一次短对话验收。

### 步骤 4（可选）：CLI 环境变量

[CodeBuddy CLI](https://www.codebuddy.ai/docs/cli/env-vars) 也可通过环境变量指向兼容端点：

```bash
export TRINITY_API_KEY="xh-..."
export CODEBUDDY_API_KEY="$TRINITY_API_KEY"
export CODEBUDDY_BASE_URL="https://api.trinity.example/v1"
codebuddy --model doubao-seed-1-6-thinking-agent-preview
```

CLI 与 `models.json` 并存时，以你当前版本文档的**优先级**为准；推荐 IDE 用户以 **`models.json` + 完整 `url`** 为准。

---

## 为什么用 Trinity + CodeBuddy？

### OpenAI 兼容、与 HTTP API 一致

Trinity 生文走 `POST /v1/chat/completions`，与 CodeBuddy 要求的 OpenAI 接口格式一致（见 [创建对话补全](../../api/chat-completions.md)）。

### 统一模型 ID

在 `models.json` 中配置多个 Trinity 模型 ID，便于在 Agent / 对话间切换，无需改 CodeBuddy 安装包。

### 多轮与多模态

CodeBuddy 多轮历史可能使用 `messages[].content` 的 **string 或 Part 数组**；网关与 OpenAI 兼容行为对齐（含看图 Part），见 [图片输入](../../multimodal/image-input.md)。

---

## 限制

- 自定义模型**仅支持 OpenAI 兼容格式**；勿填 Anthropic / Gemini 原生端点。
- **`url` 必须含 `/chat/completions`**，不能只写 `/v1`。
- `supportsReasoning`、`thinking_*` 等须与模型及 [高级参数 · 生文](../../api/chat-completions-parameters.md) 能力一致。
- 生图、生视频等须直接调 Trinity [API 轨](../../api/overview)，不在 CodeBuddy 默认对话路径内。

---

## 故障排除

| 现象 | 处理 |
|------|------|
| 请求发不出去 / 404 | 检查 `url` 是否为 `.../v1/chat/completions` |
| 401 | 确认 `apiKey` 为 `xh-...` Trinity Key |
| 模型不存在 | `id` 与模型广场一致 |
| 看图失败 | 设 `supportsImages: true` 且模型支持多模态 |
| 工具调用异常 | 设 `supportsToolCall: true` 并核对模型是否支持 `tools` |

---

## 相关资源

- [CodeBuddy · models.json（IDE）](https://www.codebuddy.ai/docs/ide/Features/models)
- [CodeBuddy · models.json（CLI）](https://www.codebuddy.ai/docs/cli/models)
- [CodeBuddy · 环境变量](https://www.codebuddy.ai/docs/cli/env-vars)
- [Cursor](./cursor) · [Codex CLI](./codex-cli)
- [快速入门](../../quickstart) · [错误与调试](../../reference/error-codes.md)

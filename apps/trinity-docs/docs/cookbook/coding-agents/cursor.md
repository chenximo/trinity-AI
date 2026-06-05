# Cursor

对标参考：[OpenRouter · Cursor integration](https://openrouter.ai/docs/cookbook/coding-agents/cursor-integration)

## Cursor 是什么？

[Cursor](https://cursor.com) 是基于 VS Code 的 AI 代码编辑器，支持 Agent 模式、Tab 补全、内联编辑与 CLI。通过 **OpenAI 兼容 Base URL**，可将 Cursor 的 OpenAI 提供方槽位指向 **Trinity 网关**，用自有 `xh-...` Key 调用 [模型广场](https://trinity.ai/models) 中的模型 ID。

---

## 快速开始

Cursor 通过 **Override OpenAI Base URL** 将请求发往 Trinity，而不是 `api.openai.com`。

### 步骤 1：获取 Trinity API Key

1. 打开 [Trinity 控制台 · API 密钥](https://trinitydesk.ai/account/keys)。
2. 创建 API Key（前缀一般为 **`xh-...`**）。
3. 详见 [管理 API 密钥](../../manage-api-keys.md)。

### 步骤 2：配置 Cursor

1. 打开 **Cursor Settings**（`Cmd/Ctrl + ,`）。
2. 进入 **Models**，展开 **API Keys**。
3. 开启 **OpenAI API Key**，然后：
   - 在 **OpenAI API Key** 中粘贴 `TRINITY_API_KEY`（`xh-...`）。
   - 开启 **Override OpenAI Base URL**，设置为：

     ```text
     https://api.trinitydesk.ai/v1
     ```

     （替换为你的 `TRINITY_BASE_URL`，**必须包含 `/v1`**。）

### 步骤 3：添加模型

在 **Models** 中点击 **+ Add model**，填入 [模型广场](https://trinity.ai/models) 中的 **模型 ID**，例如：

- `doubao-seed-1-6-thinking-agent-preview`
- `gpt-4o`

以你账号可见、且支持对话的 ID 为准。

### 步骤 4：选择模型

在 Chat 或 Agent 面板的模型选择器中选刚添加的模型，即可经 Trinity 网关发起请求。

---

## 为什么用 Trinity + Cursor？

### 统一模型目录

在 Cursor 的 OpenAI 兼容槽位中，使用 Trinity **模型 ID** 访问平台已接入的生文等能力，无需为每个上游单独配置多套 Key（以产品开通范围为准）。

### 与 HTTP API 一致

与 [快速入门](../../quickstart)、[创建对话补全](../../api/chat-completions.md) 使用同一 `TRINITY_BASE_URL` 与 Key，便于脚本与 IDE 共用凭证策略。

### 用量与密钥管理

在 Trinity 控制台管理 Key 与权限；团队场景按控制台与商务约定分配额度（详见控制台说明）。

---

## 限制

- **Tab 补全** 可能仍走 Cursor 内置模型，**不受** BYOK / Base URL 覆盖影响（以 [Cursor 文档](https://cursor.com/docs) 为准）。
- **Auto、Composer 等模式** 是否走自有 Key 以 Cursor 当前版本为准，见 [Cursor · API keys 帮助](https://cursor.com/help/models-and-usage/api-keys)。
- 仅 **OpenAI 兼容** `POST /chat/completions` 路径上可用的模型 ID 能在此路径工作；生图、生视频等须走 [API 文档](../../api/overview)，不能假设 Cursor 内一键支持。

---

## 故障排除

| 现象 | 处理 |
|------|------|
| Invalid API key / 401 | 确认填的是 Trinity Key（`xh-...`），不是 OpenAI / 其他平台 Key |
| Model not found / 404 | 模型 ID 须与 [模型广场](https://trinity.ai/models) **完全一致** |
| Base URL 错误 | 须为 `https://.../v1`，勿漏 `/v1` 或误填 `api.openai.com` |
| 无流式 / 一次性出全文 | 见 [流式 SSE](../../guides/streaming-sse.md) 与代理缓冲 |
| 连接超时 | 检查内网、DNS、公司代理与 TLS |

---

## 相关资源

- [Cursor 文档](https://cursor.com/docs)
- [Cursor · BYOK 帮助](https://cursor.com/help/models-and-usage/api-keys)
- [Trinity 模型广场](https://trinity.ai/models)
- [快速入门](../../quickstart) · [错误与调试](../../reference/error-codes.md)

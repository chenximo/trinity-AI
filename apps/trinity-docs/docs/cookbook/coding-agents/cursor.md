# Cursor

在 [Cursor](https://cursor.com) 中将 Trinity 网关配置为 **OpenAI 兼容** 提供方，使用自有 API Key 调用 Trinity 提供的模型。

::: info
截图与菜单文案随 Cursor 版本变化；以下步骤以 **Settings → Models** 路径为准，发布前请产品走查核对。
:::

---

## 1. 适用版本

- Cursor 近期版本（支持 Custom / OpenAI-compatible API Key）
- 需可访问 Trinity 网关 `base_url`（内网部署时确认代理与 TLS）

---

## 2. 前置

1. 已创建 Trinity API Key → [管理 API 密钥](../../manage-api-keys)。
2. 已知 `TRINITY_BASE_URL`（须含 `/v1`，例如 `https://api.trinity.example/v1`）。

```bash
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

---

## 3. 配置步骤

1. 打开 **Cursor Settings** → **Models**（或 **Features → Models**）。
2. 找到 **OpenAI API Key** / **Override OpenAI Base URL**（或「Custom OpenAI-compatible」类选项）。
3. 填写：
   - **API Key**：`TRINITY_API_KEY`（或粘贴 `xh-...`）
   - **Base URL**：`TRINITY_BASE_URL`（完整 `.../v1`，不要漏路径）
4. **模型**：在模型列表中选择 Trinity **模型 ID**；若需手填，与 [模型广场](https://trinity.ai/models) 一致。
5. 保存后在该模型下发起一次 Chat / Composer 请求。

::: tip
勿将 Key 提交到仓库；团队共用建议用环境变量或 Cursor 本地密钥存储。
:::

---

## 4. 推荐模型

- 生文：使用模型广场中当前可用的文本模型 ID。
- 参数细节（`temperature`、`stream` 等）→ [对话补全 · 高级参数](../../api/chat-completions-parameters)。

---

## 5. 验收

- 在 Cursor 中发送：`用一句话介绍 Trinity API 聚合平台`。
- 收到正常回复；控制台用量（若已开通）有对应记录。

---

## 6. 故障排除

| 现象 | 处理 |
|------|------|
| 401 | Key 无效或过期 → 重新创建密钥 |
| 404 / model not found | 模型 ID 不在平台列表或拼写错误 → 对照模型广场 |
| 连接超时 | 检查 `base_url`、内网 DNS、公司代理 |
| 流式中断 | 见 [流式 SSE](../../guides/streaming-sse) 与代理缓冲说明 |

相关：[快速入门](../../quickstart) · [错误与调试](../../reference/error-codes)

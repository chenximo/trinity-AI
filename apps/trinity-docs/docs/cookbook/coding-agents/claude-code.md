# Claude Code

将 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（Anthropic 终端 Agent）指向 Trinity **OpenAI 兼容** 网关，复用同一套 API Key 与模型目录。

::: info
Claude Code 原生以 Anthropic API 为主；通过 **兼容层 / 环境变量** 接入 Trinity 时，以 Anthropic 与 Trinity 网关当前支持的能力为准。配置项名称以官方文档为准，发布前走查。
:::

---

## 1. 适用版本

- 已安装 Claude Code CLI（`claude` 命令可用）
- Trinity 网关已开启对应路由（生文 `POST /v1/chat/completions` 或兼容端点）

---

## 2. 前置

```bash
export TRINITY_API_KEY="xh-..."
export TRINITY_BASE_URL="https://api.trinity.example/v1"
```

密钥管理见 [管理 API 密钥](../../manage-api-keys)。

---

## 3. 配置步骤

按 Claude Code 官方「第三方 / 兼容 API」说明设置（名称可能为 `ANTHROPIC_BASE_URL`、`OPENAI_BASE_URL` 或配置文件中的 `baseUrl`，**以你使用的 Claude Code 版本文档为准**）：

1. 将 **Base URL** 设为 Trinity：`TRINITY_BASE_URL`（OpenAI 兼容路径时通常为 `.../v1`）。
2. 将 **API Key** 设为 Trinity Key：`TRINITY_API_KEY`。
3. 若需指定模型，使用 Trinity **模型广场中的模型 ID**（不要直接填 Anthropic 官网型号，除非该名称在 Trinity 列表中存在）。
4. 在项目目录执行 `claude` 或官方推荐的启动命令，发起一次对话。

::: tip
若 Claude Code 仅支持 Anthropic 消息格式，需确认平台侧是否提供 **Anthropic Messages 兼容** 路由；否则请改用 Cursor / HTTP API 集成路径。
:::

---

## 4. 推荐模型

- 优先选用平台已标注支持「Agent / 长上下文」的文本模型。
- 工具调用、thinking 等字段 → [对话补全 · 高级参数](../../api/chat-completions-parameters)。

---

## 5. 验收

- 终端中完成一轮问答，无 401/404。
- 复杂任务前先用单行 prompt 验证连通性。

---

## 6. 故障排除

| 现象 | 处理 |
|------|------|
| 认证失败 | 确认 Key 前缀与网关鉴权方式 |
| 模型不可用 | 对照模型广场列表；勿使用未在 Trinity 提供的模型 ID |
| 协议不兼容 | 联系平台确认是否需 OpenAI 兼容模式或专用适配 |

相关：[应用场景概述](../) · [快速入门](../../quickstart)

# CC Switch

通过 [CC Switch](https://github.com/farion1231/cc-switch) 将 **Codex CLI** 或 **Claude Code** 接入 Trinity 网关。CC Switch 管理供应商配置并写入各 CLI 配置文件；接入 Trinity 须开启 **本地路由**，由 CC Switch 转发至 `https://api.trinitydesk.ai/v1` 并完成协议转换。

参考：[CC Switch 用户手册](https://github.com/farion1231/cc-switch/tree/main/docs/user-manual/zh) · [应用路由](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/4-proxy/4.2-routing.md)

---

## 前置条件

1. 安装 [CC Switch](https://github.com/farion1231/cc-switch/releases)。
2. 在 [控制台 · API 密钥](https://trinitydesk.ai/account/keys) 创建 Key（`xh-...`）→ [管理 API 密钥](../../manage-api-keys.md)。
3. 已安装目标 CLI（Codex 或 Claude Code 可正常启动）。

---

## 配置项与填写位置

| 配置项 | CC Switch 位置 | Trinity 填写值 |
| --- | --- | --- |
| 路由总开关 | **设置 → 路由 → 本地路由** | 开启（**运行中**） |
| 应用路由 | 同上 → **路由启用** | 勾选 **Codex** 或 **Claude** |
| 本地服务地址 | 同上（界面显示，可复制） | 默认 `http://127.0.0.1:15721`；由 CC Switch 写入 CLI，一般无需手改 |
| 请求地址 / 端点 | **Codex** 或 **Claude** → 编辑供应商 | `https://api.trinitydesk.ai/v1`（勿以 `/` 结尾） |
| API Key | 编辑供应商 | `xh-...` |
| 模型 | 编辑供应商 / 模型映射 | [模型广场](https://trinity.ai/models) **模型 ID** |
| 需要本地路由映射 | 编辑 **Codex** 供应商 | **开启** |
| API 格式 | 编辑 **Claude** 供应商（高级） | **OpenAI Chat Completions** |

::: info 本地路由与「代理」
**本地路由**（如 `http://127.0.0.1:15721`）是 CC Switch 在本机提供的 API 转发服务：CLI 请求先发到该地址，再由 CC Switch 按供应商中的 Trinity 端点（`https://api.trinitydesk.ai/v1`）转发。设置页中的 **代理 / 全局出站代理** 是另一项，用于 CC Switch 自身访问外网时是否走 Clash 等系统代理；接入 Trinity **只需配置本地路由与供应商**，与出站代理无关。
:::

:::: warning 避免环境变量冲突
启用 CC Switch 路由后，通常由 CC Switch 写入 CLI 配置。不要在终端额外 `export OPENAI_BASE_URL` / `ANTHROPIC_BASE_URL` 等与 CC Switch 冲突的环境变量，否则 CLI 可能绕过本地路由或访问错误端点。
::::

---

## 接入流程（Codex）

### 步骤 1：开启本地路由

1. 打开 **设置 → 路由 → 本地路由**。
2. 开启路由总开关，状态为 **运行中**。
3. 在 **路由启用** 中勾选 **Codex**。

### 步骤 2：添加并启用 Trinity 供应商

1. 主界面选择 **Codex** → **添加供应商 → 自定义**。
2. 填写下表并保存，在列表中 **启用** 该供应商。

| 字段 | 填写内容 |
| --- | --- |
| 供应商名称 | 自定义，如 `Trinity` |
| API Key | `xh-...` |
| 请求地址 / 端点 | `https://api.trinitydesk.ai/v1`（勿以 `/` 结尾） |
| 需要本地路由映射 | **开启** |
| 模型 / 模型映射 | [模型广场](https://trinity.ai/models) 中的 **模型 ID** |

### 步骤 3：验收

1. 完全退出 Codex 后重新启动，确保 CC Switch 写入的配置生效。
2. 确认 CC Switch：路由 **运行中**、**Codex** 已勾选路由启用、Trinity 供应商为 **启用**。
3. 在 Codex 执行短任务；若 CLI 正常返回回答，且 Trinity 侧出现 `POST /v1/chat/completions`，`model` 与配置一致，即表示接入成功。

::: tip Codex 模型与配置文件
多模型、`auth.json`、`cc-switch-model-catalog.json`、App 下拉为空等说明见 [CC Switch 对接 Codex（连接与模型选择）](./codex-cc-switch.md)。
:::

---

## 接入流程（Claude Code，可选）

Claude Code 原生使用 Anthropic API；经 CC Switch 接入 Trinity 时，须在供应商中选择 **OpenAI Chat Completions** 格式，并由本地路由完成转发与转换。流程与 Codex 相同，区别仅为路由启用勾选 **Claude**、在主界面 **Claude** 分组下添加供应商。

### 步骤 1：开启本地路由

1. 打开 **设置 → 路由 → 本地路由**。
2. 开启路由总开关，状态为 **运行中**。
3. 在 **路由启用** 中勾选 **Claude**（若同时使用 Codex，可同时勾选 **Codex**）。

### 步骤 2：添加并启用 Trinity 供应商

1. 主界面选择 **Claude** → **添加供应商 → 自定义**。
2. 填写下表并保存，在列表中 **启用** 该供应商。

| 字段 | 填写内容 |
| --- | --- |
| 供应商名称 | 如 `Trinity · Claude` |
| API Key | `xh-...` |
| 请求地址 / 端点 | `https://api.trinitydesk.ai/v1`（勿以 `/` 结尾） |
| API 格式（高级） | **OpenAI Chat Completions**（勿选 Anthropic Native） |
| 模型 | [模型广场](https://trinity.ai/models) 中的 **模型 ID** |

路由开启后，CC Switch 会将 `ANTHROPIC_BASE_URL` 等写入 `~/.claude/settings.json`（以保存后实际文件为准）。若使用 Config JSON，Key 与模型须与上表一致，例如：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "xh-...",
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:15721"
  },
  "model": "doubao-seed-1-6-thinking-agent-preview"
}
```

`ANTHROPIC_BASE_URL` 在路由启用后通常由 CC Switch 自动写入本地服务地址；上例仅供核对字段含义，以界面保存结果为准。注意：这里应指向 CC Switch 本地路由地址，而不是 `https://api.trinitydesk.ai/v1`。

### 步骤 3：验收

1. 完全退出 Claude Code 后重新启动，确保 CC Switch 写入的配置生效。
2. 确认 CC Switch：路由 **运行中**、**Claude** 已勾选路由启用、Trinity 供应商为 **启用**。
3. 在 Claude Code 执行短任务；若 CLI 正常返回回答，且 Trinity 侧出现 `POST /v1/chat/completions`，`model` 与配置一致，即表示接入成功。

---

## 故障排除

| 现象 | 处理 |
| --- | --- |
| 路由已开但无 Trinity 用量 | 确认 **Codex**（或 Claude）已勾选路由启用，且 Trinity 供应商为 **启用**；重启 CLI |
| 本地路由不可用 / 连接被拒绝 | 确认 CC Switch 本地路由状态为 **运行中**，本地服务地址与 CLI 配置一致，且端口未被占用 |
| Codex 无响应 / 协议错误 | 供应商须开启 **需要本地路由映射**；路由须 **运行中** |
| Claude Code 400 | API 格式须为 **OpenAI Chat Completions**；**Claude** 已勾选路由启用；`ANTHROPIC_BASE_URL` 应指向本地路由地址 |
| 404 / 路径错误 | 供应商端点填 `https://api.trinitydesk.ai/v1`，勿只填 `/v1` 或把供应商端点误填成本地路由地址 |
| 401 / Unauthorized | 确认 API Key 为有效的 `xh-...`，且未填错或过期 |
| 模型不存在 / model not found | 确认模型 ID 与 [模型广场](https://trinity.ai/models) 一致 |
| `claude: command not found` | 未安装 [Claude Code CLI](https://code.claude.com/docs/en/setup) |

---

## 与手写配置

启用 CC Switch 并开启路由后，配置由 CC Switch 写入 `~/.codex/config.toml`、`~/.claude/settings.json` 等。勿在终端再 export 与 CC Switch 冲突的 `OPENAI_BASE_URL` / `ANTHROPIC_BASE_URL`。手写方式见 [Codex CLI](./codex-cli.md)、[Claude Code](./claude-code.md)。

---

## 相关资源

- [CC Switch 用户手册 · 路由服务](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/4-proxy/4.1-service.md)
- [Codex CLI](./codex-cli.md) · [Claude Code](./claude-code.md) · [快速入门](../../quickstart.md)

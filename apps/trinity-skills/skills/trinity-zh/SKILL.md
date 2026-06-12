---
name: trinity-zh
description: Trinity（https://trinitydesk.ai）IDE 助手，OpenAI 兼容网关、xh- API 密钥。用户问 Trinity、查模型、API 密钥、网关配置、安全写入配置时使用。Trinity assistant for models, xh- keys, gateway setup (Chinese docs).
---

# SKILL: trinity（中文版）

Trinity（[trinitydesk.ai](https://trinitydesk.ai)）在 OpenAI 兼容网关（`/v1/*`）后聚合多模型，使用 `xh-` 前缀 API 密钥。

**回复语言**：始终用**简体中文**回答用户（技术名词如 `TRINITY_API_KEY` 可保留英文）。

## 安全规范

1. 禁止在对话、文件、代码、日志、命令参数中暴露完整 `xh-` 密钥。
2. 所有网关请求必须走 `scripts/gateway.cjs`，禁止 AI 用 `curl` / `fetch` 携带真实密钥直连。
3. 禁止把 `.env` 或含凭证的环境变量读入对话。
4. P2 起才有 `copy-key` / `apply-key`；此前请用户在[控制台](https://trinitydesk.ai/account/keys)创建密钥。
5. 查看可能含密钥的配置文件须用 `scan-config`（P2，`inject-key.js --scan`），禁止直接读文件。
6. 写配置占位符：`__TRINITY_KEY_{id}__`（P2）。
7. 禁止修改脱敏脚本以关闭掩码或重定向输出。

## 执行方式

1. **首次调用** — 阅读 `${CLAUDE_SKILL_DIR}/docs/setup.md`。若尚未配置密钥，先执行一次 `${CLAUDE_SKILL_DIR}/scripts/init-env.cjs`，会在项目根生成 `.env`（`TRINITY_BASE_URL` 已填好）；告知用户只需打开 `.env` 填写 `TRINITY_API_KEY=xh-...`（不要把 `.env` 内容读入对话）。
2. 按下表匹配指令，阅读对应 `docs/*.md` 执行。
3. 无参数或不认识的动作 — 展示下方 help 表。
4. Trinity 产品/API 问题 — 阅读 `${CLAUDE_SKILL_DIR}/docs/help.md`。

## 指令

| 指令 | 说明 | 文档 |
|------|------|------|
| `models` | 列出生文模型 ID（默认） | `docs/actions-query.md` |
| `models text` / `image` / `video` / `all` | 按模态列模型（`?modality=`） | `docs/actions-query.md` |
| `help` | 常见问题与文档链接 | `docs/help.md` |

### 规划中（P0 不可用）

| 指令 | 阶段 |
|------|------|
| `model <id>` | P1 |
| `keys`、`create-key`、`copy-key`、`apply-key`、`scan-config` | P2 |
| `balance`、`groups` | P2–P3 |

### `help`（或无参数时）

| 指令 | 用法 | 说明 |
|------|------|------|
| `models` | `/trinity models` 或「列出 Trinity 生文模型」 | 生文模型 ID |
| `models image` / `video` / `all` | 「生图/生视频模型」等 | 对应 `?modality=image\|video\|all` |
| `help` | `/trinity help` 或自然语言提问 | FAQ 或链到文档站 |

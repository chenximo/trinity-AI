# 配置说明

## 环境变量

优先级（高覆盖低）：

1. **系统环境变量**（推荐）
2. **Skill 目录下的 `.env`**（与 `SKILL.md` 同级）
3. **项目根目录 `.env`**

P0 必填：

```bash
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
export TRINITY_API_KEY="xh-..."
```

未设置 `TRINITY_BASE_URL` 时默认 `https://api.trinitydesk.ai/v1`，**不要**加尾部 `/`。

在 [控制台 · API 密钥](https://trinitydesk.ai/account/keys) 创建以 `xh-` 开头的密钥。

**安装 Skill 后不会自动创建 `.env`**。首次使用前运行一次（或由 AI 代跑）：

```bash
node "${CLAUDE_SKILL_DIR}/scripts/init-env.cjs"
```

会在**项目根**生成 `.env`：

- `TRINITY_BASE_URL` — 已填 `https://api.trinitydesk.ai/v1`
- `TRINITY_API_KEY` — 留空，**用户只需补这一行**

若 `.env` 已存在则不会覆盖。模板文件：`env.template`（与 `SKILL.md` 同级）。

也可手动：`cp apps/trinity-skills/.env.example .env`

| 方式 | 位置 |
|------|------|
| 推荐 | 项目根 `trinity-AI/.env`（`init-env.cjs` 默认写这里） |
| 或 | shell 里 `export TRINITY_API_KEY=...` |

未配置时运行脚本会输出 `[CONFIG_MISSING]`，AI 应先跑 `init-env.cjs` 再让用户填写 `TRINITY_API_KEY`，**不要反复重试**。

Mac / Windows / Linux **同一套脚本**，装好 Node 18+（或 Bun）即可，例如：`node scripts/gateway.cjs GET /models`。不分平台、不单独维护 Windows 版。

## 脚本分工（P0）

| 脚本 | 作用 |
|------|------|
| `scripts/init-env.cjs` | 从模板生成项目 `.env`（BASE_URL 已填，KEY 留空） |
| `scripts/gateway.cjs` | 用 `xh-` 密钥调用网关 `/v1/*` |
| `scripts/sanitize.js` | 脱敏 `xh-`、`sk-`、`Bearer` 等 |

P2 将增加管理 API 与 `copy-key` / `apply-key` 等脚本。

## 鉴权

```text
Authorization: Bearer <TRINITY_API_KEY>
```

示例：`TRINITY_BASE_URL` = `https://api.trinitydesk.ai/v1`，列模型 = `GET /models`。

## 运行时检测

每个会话检测一次：

```bash
GATEWAY_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/gateway.cjs"

if command -v bun &>/dev/null; then RUNTIME="bun"; \
elif command -v node &>/dev/null; then RUNTIME="node"; \
elif command -v deno &>/dev/null; then RUNTIME="deno run --allow-net --allow-read --allow-env"; \
else echo "ERROR: No JS runtime found (need bun, node, or deno)" >&2; exit 1; fi
```

调用网关：

```bash
$RUNTIME "$GATEWAY_SCRIPT" <METHOD> <PATH> [JSON_BODY]
```

## 错误处理

- HTTP 401/403：提示检查 `TRINITY_API_KEY` 与密钥权限
- `[CONFIG_MISSING]`：**不要重试**，让用户先 `export TRINITY_API_KEY`
- 禁止在对话里用 `curl` 带真实密钥；必须用 `gateway.cjs`

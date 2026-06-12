---
title: Trinity Skill · P0 实施规格
---

# Trinity Skill · P0 实施规格

> **定位**：在 [友商调研与落地方案](./new-api-skill) 与 [设计附录](./new-api-skill-design) 之上，补齐 **研发可直接照着写代码/验收** 的契约。  
> **范围**：P0 仅 `models`、`help`；网关 `GET /v1/models`；**不**依赖管理 API / 访问令牌。

## 1. 与调研文档的分工

| 文档 | 用途 |
|------|------|
| [new-api-skill](./new-api-skill) | 为什么做、P0–P3 路线图、产品验收 |
| [new-api-skill-design](./new-api-skill-design) | 安全铁律、指令映射、环境变量命名 |
| [new-api-skill-model-info](./new-api-skill-model-info) | 列表/详情 API 选型 |
| **本页** | 仓库结构、脚本接口、错误码、手工验收步骤 |

## 2. 仓库

| 项 | 值 |
|----|-----|
| 路径（当前） | `trinity-AI/apps/trinity-skills/`（monorepo 内；发布时可拆为独立 GitHub 仓） |
| Skill 名 | `trinity` |
| 本地调试 | `npx skills add <path-to>/apps/trinity-skills --skill trinity` |
| 发布后安装 | `npx skills add https://github.com/<org>/trinity-skills --skill trinity` |
| 内部中文 Skill | `skills/trinity-zh/`（`--skill trinity-zh`，暂不对外发布，见 `apps/trinity-skills/PUBLISH.md`） |

```
trinity-skills/
├── README.md
├── .gitignore
└── skills/trinity/
    ├── SKILL.md
    ├── docs/
    │   ├── setup.md
    │   ├── help.md
    │   └── actions-query.md    # models（P0）；groups/balance 占位说明 P2+
    └── scripts/
        ├── env.js              # P0：TRINITY_BASE_URL + TRINITY_API_KEY
        ├── gateway.js          # P0：/v1/* 通用调用
        └── sanitize.js         # xh- + Bearer 脱敏
```

P2 再增：`api.js`、`copy-key.js`、`inject-key.js` 等（本规格不展开）。

## 3. 环境变量（P0 必填）

| 变量 | 示例 | 说明 |
|------|------|------|
| `TRINITY_BASE_URL` | `https://api.trinitydesk.ai/v1` | **无**尾部 `/`；脚本请求时拼接 path |
| `TRINITY_API_KEY` | `xh-...` | 调 `/v1/*`；禁止出现在 AI 对话明文 |

加载优先级（与友商一致）：**进程环境变量** > **skill 目录 `.env`** > **项目根 `.env`**。

缺失时：`env.js` 打印 `[CONFIG_MISSING]` + 缺失变量名，`exit(2)`；AI **不得重试**，应提示用户 export。

## 4. 脚本契约

### 4.1 `scripts/gateway.js`

**用法**：

```bash
<runtime> gateway.js <METHOD> <PATH> [JSON_BODY]
```

| 参数 | 说明 |
|------|------|
| `METHOD` | `GET` / `POST` / …（P0 仅用到 `GET`） |
| `PATH` | 以 `/` 开头，相对 `TRINITY_BASE_URL`，如 `/models` |
| `JSON_BODY` | 可选；有 body 时设 `Content-Type: application/json` |

**请求头**：

```http
Authorization: Bearer <TRINITY_API_KEY>
```

**成功**：`stdout` 输出响应 body（JSON 文本）；经 `sanitize()` 后再输出（防御性，即使 P0 响应通常无密钥）。

**失败**：

| 情况 | 行为 |
|------|------|
| HTTP ≥ 400 | `stderr` 打印 `HTTP <status> Error:` + body，`exit(1)` |
| 网络错误 | `stderr` 打印 message，`exit(1)` |
| 参数错误 | Usage 提示，`exit(1)` |

**运行时**：Node ≥ 18 / Bun / Deno（与友商 `setup.md` 检测顺序一致：bun > node > deno）。

### 4.2 `scripts/sanitize.js`

在友商规则基础上 **增加**：

```js
// xh- 前缀 API Key（Trinity）
content.replace(/xh-[A-Za-z0-9_\-]{4,}/g, "xh-<REDACTED>")
```

保留：`Bearer`、敏感字段名、连接串等友商规则。

### 4.3 Action：`models`

**文档**：`docs/actions-query.md`

**执行**（AI 须走脚本，禁止直接 curl）：

```bash
$RUNTIME "$GATEWAY_SCRIPT" GET /models
```

**响应**（OpenAI 兼容）：

```json
{
  "object": "list",
  "data": [
    { "id": "gpt-5.5", "object": "model", "owned_by": "..." }
  ]
}
```

**AI 展示**：表格列 **Model ID**、**Owner**（`owned_by`，无则 `-`）；按 `id` 字母序。

**空列表 / 401**：原样转述脚本错误；401 时提示检查 `TRINITY_API_KEY` 与 `TRINITY_BASE_URL`。

### 4.4 Action：`help`

**文档**：`docs/help.md`

- Skill 用法、FAQ、`[CONFIG_MISSING]` 处理 → 读本文件即可回答。  
- Trinity 产品/API 问题 → 链 [doc.trinitydesk.ai](https://doc.trinitydesk.ai/quickstart?lang=zh)（P1 再抓 `llms.txt`）。

## 5. `SKILL.md` 要点

- Frontmatter：`name: trinity`，description 含 Trinity / 模型 / Key / 安全配置触发词。  
- **Security Guidelines**：7 条（见 [设计附录 §3](./new-api-skill-design#3-安全规范须写入-skillmd)），`xh-` 替代友商 `sk-`。  
- **Actions 表**：P0 仅 `models`、`help`；其余标「即将支持」或链主方案 P2。  
- **How to Execute**：首次读 `docs/setup.md`；`models` → `actions-query.md`；无参数 → help 表。

## 6. 验收清单（P0）

```bash
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
export TRINITY_API_KEY="xh-<your-key>"

# 1. 列表
node skills/trinity/scripts/gateway.js GET /models | head

# 2. 缺配置应 exit 2
env -u TRINITY_API_KEY node skills/trinity/scripts/gateway.js GET /models; echo exit:$?

# 3. 脱敏（单元级）
node -e "const {sanitize}=require('./skills/trinity/scripts/sanitize'); console.log(sanitize('key xh-abcdef1234567890'))"
# 期望含 xh-<REDACTED>，无完整 key
```

IDE 验收：

- [ ] `npx skills add <repo> --skill trinity` 安装成功  
- [ ] `/trinity models` 与控制台 Key 可见模型一致  
- [ ] 对话与终端日志无完整 `xh-` Key  

## 7. 非目标（P0 不做）

- `GET /api/user/models`、pricing、`model <id>`  
- `keys` / `copy-key` / `apply-key` / `scan-config`  
- 修改 Trinity 后端或文档站（除可选 README 安装说明外链）

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 首版：P0 工程契约，配套 trinity-skills 仓库实现 |

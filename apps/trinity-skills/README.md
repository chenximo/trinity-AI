# trinity-skills

Trinity IDE Skills for [Cursor](https://cursor.com), Claude Code, and other agents that support the Skills protocol.

**Monorepo 路径**：`trinity-AI/apps/trinity-skills`（与 `trinity-product`、`trinity-docs` 同级）。

对外发布时可将 **`skills/trinity/`（英文）** 推送到独立 GitHub 仓库；结构与友商 [QuantumNous/skills](https://github.com/QuantumNous/skills) 一致。发布策略见 [PUBLISH.md](./PUBLISH.md)。

## Skills

| 目录 | 语言 | 受众 | 安装 |
|------|------|------|------|
| `skills/trinity/` | 英文 | 对外 GitHub | `--skill trinity` |
| `skills/trinity-zh/` | 中文 | **内部自用**，暂不发布 | `--skill trinity-zh` |

改 `skills/trinity/scripts/` 后请执行：`node scripts/sync-skill-scripts.mjs`

## Install

**对外（英文，发布后）：**

```bash
npx skills add https://github.com/<org>/trinity-skills --skill trinity
```

**内部（中文）：**

```bash
npx skills add /path/to/trinity-AI/apps/trinity-skills --skill trinity-zh
```

**本地开发（英文）：**

```bash
npx skills add /path/to/trinity-AI/apps/trinity-skills --skill trinity
```

## Configure (P0)

安装 Skill **不会**自动写密钥；首次使用前运行（或由 Cursor AI 代跑）：

```bash
cd /path/to/trinity-AI
node .agents/skills/trinity-zh/scripts/init-env.cjs
# 或：npm run init:env -w @trinity/trinity-skills
```

会在项目根生成 `.env`：

```env
TRINITY_BASE_URL=https://api.trinitydesk.ai/v1   # 已填好
TRINITY_API_KEY=                                  # 你只填这一行 xh-...
```

已有 `.env` 不会被覆盖。改完 Skill 源码后请重新 `npx skills add ...` 同步到 `.agents`。

## Usage in IDE

| Command | Description |
|---------|-------------|
| `/trinity models` | List model IDs available to your API key |
| `/trinity help` | Skill FAQ and links to [doc.trinitydesk.ai](https://doc.trinitydesk.ai/quickstart?lang=zh) |

## Development

```bash
cd apps/trinity-skills
export TRINITY_BASE_URL="https://api.trinitydesk.ai/v1"
export TRINITY_API_KEY="xh-..."

node .agents/skills/trinity-zh/scripts/gateway.cjs GET /models
```

## Internal docs

产品手册：`apps/trinity-product` → 友商产品调研 → New API · Skill → [P0 实施规格](../trinity-product/docs/ai-api-platform/competitor-research/new-api-skill-p0-spec.md).

## License

【待补充】

# 发布策略

## 两套 Skill

| Skill 目录 | 语言 | 安装名 | 是否对外发布 |
|------------|------|--------|--------------|
| `skills/trinity/` | 英文 | `trinity` | **是**（GitHub 公开仓） |
| `skills/trinity-zh/` | 中文 | `trinity-zh` | **否**（仅 monorepo 内团队自用） |

## 原则

- **脚本只改一处**：`skills/trinity/scripts/`，改完后执行  
  `node scripts/sync-skill-scripts.mjs`  
  同步到 `trinity-zh`（避免两套 JS 漂移）。
- **文档各维护各的**：英文改 `trinity/docs/`，中文改 `trinity-zh/docs/`；大功能上线时两边一起更新。
- **对外仓库**推送时只包含 `skills/trinity/` + 根 `README.md` + `LICENSE`（可用 subtree 或发布脚本，勿带 `trinity-zh`）。

## 何时发布中文版

有明确客户反馈或渠道需求时，将 `trinity-zh` 加入公开仓，或合并为单 Skill 双语 `docs/zh` + `docs/en`（届时再评估，避免过早双轨）。

## 内部安装（中文）

```bash
npx skills add /path/to/trinity-AI/apps/trinity-skills --skill trinity-zh
```

## 对外安装（英文）

```bash
npx skills add https://github.com/<org>/trinity-skills --skill trinity
```

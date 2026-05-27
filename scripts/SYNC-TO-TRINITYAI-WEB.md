# 同步到 TrinityAI-web

将本仓库 **`apps/`**、**`packages/`** 推送到同级目录 **`TrinityAI-web`** 的 **`apps_ui/`**、**`packages/`**。

| 源（PM / 原型工程） | 目标（工程仓 UI 镜像） |
|---------------------|------------------------|
| `trinity-AI/apps/<app>/` | `TrinityAI-web/apps_ui/<app>/` |
| `trinity-AI/packages/<pkg>/` | `TrinityAI-web/packages/<pkg>/` |

## 策略

| 范围 | 默认 | 说明 |
|------|------|------|
| **packages** | **仅新增** | 新包、新文件会复制；已存在且内容不同 → **不覆盖**，写入冲突报告 |
| **apps** | **仅新增** | 新 app 目录整包复制；已存在文件内容不同 → **不覆盖**（避免盖掉工程侧在 `apps_ui` 的改动） |

需要以本仓库为准覆盖时，显式加 `--apps-overwrite` / `--packages-overwrite`（覆盖前会在目标侧生成 `*.sync-backup-<时间戳>`）。

**不会**删除目标侧多出来的 app（例如仅存在于 `apps_ui` 的旧目录）。

## 命令

在 **`trinity-AI`** 根目录：

```bash
# 预览（不写盘）
npm run sync:web

# 执行同步
npm run sync:web:apply

# 仅 apps 或仅 packages
node scripts/sync-to-trinityai-web.mjs --apps
node scripts/sync-to-trinityai-web.mjs --packages --apply

# apps 冲突时以 trinity-AI 为准（先备份 apps_ui 侧文件）
node scripts/sync-to-trinityai-web.mjs --apply --apps-overwrite
```

报告目录：`scripts/sync-reports/sync-<时间>.md`

## CHANGELOG（工程仓）

每次同步会在目标仓 **自动追加**（文件对比，不依赖 git）：

| 文件 | 内容 |
|------|------|
| `TrinityAI-web/apps_ui/CHANGELOG.md` | 本次 `apps` → `apps_ui` 的新增 / 更新 / 冲突 |
| `TrinityAI-web/packages/CHANGELOG.md` | 本次 `packages` 同步结果 |

- **`npm run sync:web`**：生成 `CHANGELOG.preview.md`（预览，不改动正式 CHANGELOG）
- **`npm run sync:web:apply`**：写入 `CHANGELOG.md`（最新一节在最上，含 **日期** 与具体时间）
- 跳过记录：`--no-changelog`

## 环境变量

```bash
export TRINITY_SYNC_SOURCE=/path/to/trinity-AI
export TRINITY_SYNC_TARGET=/path/to/TrinityAI-web
```

## 提交注意

- 工程仓有 **apps 与 apps_ui 提交互斥** 检查；同步后请在 **TrinityAI-web** 单独提交 `apps_ui/`、`packages/`。
- 冲突列表需人工 `diff` 合并后再 `--apply --*-overwrite` 或手改目标文件。

# trinity-vue-prototype-monorepo · 确认规则

## 须先确认

| 操作 | 说明 |
|------|------|
| **安装/升级依赖** | 根 workspace 或跨 app 的 major 升级 |
| **重构目录** | 移动 `apps/`、`packages/` 结构 |
| **删除文件/模块** | views、packages 导出 |
| **提交** | 含 Mock 契约破坏性变更 |
| **删除静态 HTML** | `TrinityAI/` 等迁移遗留 |

## 不需要确认

- 单页功能迭代（Mock 向后兼容）
- 本地 dev 调试

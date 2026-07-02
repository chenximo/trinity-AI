# trinity-vue-prototype-monorepo · 确认规则

> 通用规则：[`../common/confirmation.md`](../common/confirmation.md)  
> 能力清单：[`./tools.yaml`](./tools.yaml)

## 须先确认再执行（`confirm: required`）

| tool id | 操作 | 说明 |
|---------|------|------|
| `monorepo.deps.install` | 根 workspace 安装/升级依赖 | major 升级 |
| `monorepo.sync.web` | sync 到 TrinityAI-web | 双仓交付 |
| `monorepo.structure.refactor` | 移动 apps/packages 结构 | 影响全员 |
| `monorepo.module.delete` | 删 views、packages、静态 HTML 遗留 | 不可逆 |

## 建议确认（`confirm: optional`）

| tool id | 操作 |
|---------|------|
| `monorepo.packages.edit` | 改 packages/ui、tokens |
| `monorepo.build.apps` / `monorepo.build.all` | 全量构建 |

## 不需要确认

- 各 `monorepo.dev.*` 本地预览
- `monorepo.views.edit` 单页迭代（Mock 向后兼容）

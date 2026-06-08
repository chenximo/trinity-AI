# trinity-tob-marketing-site · 领域边界

## 本 Skill 管什么

- `apps/ai-cloud`、`apps/trinity-ai` 营销首页与 ToB 长页
- Hero、方案矩阵、咨询表单、页脚、COS 子路径部署
- 营销模块规则 ID 与检查清单

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| `account/console` 控制台 | `trinity-user-console` |
| `*-admin` CRUD 列表 | `trinity-admin-ruoyi-list` |
| 仅改 `packages/ui` 原子 | 先 `trinity-design-tokens` |
| Monorepo 脚手架 | `trinity-vue-prototype-monorepo` |

## 叠加

执行顺序：本 Skill → `trinity-design-tokens` → `trinity-vue-prototype-monorepo`

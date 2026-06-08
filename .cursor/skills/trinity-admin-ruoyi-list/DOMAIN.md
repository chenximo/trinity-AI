# trinity-admin-ruoyi-list · 领域边界

## 本 Skill 管什么

- `apps/trinity-ai-admin` 若依式列表页
- `AdminListQuery`、`admin-ep-table-wrap`、列宽 `ADMIN_TABLE_COL`
- `docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md`

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| 用户控制台 `or-shell` | `trinity-user-console` |
| Monorepo 总则 | `trinity-vue-prototype-monorepo` |
| 色板 token | `trinity-design-tokens` |
| 非列表页（表单 wizard、详情） | 模块 README + vue-monorepo |

## 硬约束

列表表格全部左对齐；勿列级 `align` 居中操作列。

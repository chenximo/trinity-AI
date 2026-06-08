# trinity-user-console · 领域边界

## 本 Skill 管什么

- `account/console`、用户中心列表页规则 ID（UC-*）
- 规范页 `/user-console-spec` 样例与附录锚点
- `apps/trinity-design/.../user-console-spec` 规范枢纽

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| 运营后台 `el-table`、若依列表 | `trinity-admin-ruoyi-list` |
| 营销页 Hero/方案矩阵 | `trinity-tob-marketing-site` |
| Monorepo 总则 | `trinity-vue-prototype-monorepo` |
| 全局 token 定义 | `trinity-design-tokens` |

## 规范先行

用户未说「落地工程」→ **仅改规范页 + 本 Skill + docs/03**，不改 `ConsolePage.vue` 等产品工程。

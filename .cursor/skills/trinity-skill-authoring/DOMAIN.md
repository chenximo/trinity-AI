# trinity-skill-authoring · 领域边界

## 本 Skill 管什么

- `.cursor/skills/**` 目录结构、体量门禁、命名约定
- L0 总机与子 Skill 的分工（封发 vs 执行）
- `DOMAIN.md` / `workflows/` / `confirmation.md` 何时必填
- 新建、评审、迁移文档为 Skill 的流程

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| 产品手册正文、roadmap | `trinity-product-handbook` |
| API 验收台、用例、报告 | `trinity-api-acceptance` |
| 对外开发者文档 | `trinity-docs` |
| Vue 工程实现 | `trinity-vue-prototype-monorepo` |
| Cursor 通用 Skill 机制（frontmatter 语法等） | 用户级 `create-skill` |

## 边界真源层级

```
L0 .cursor/skills/SKILL.md（路由封发）
    ↓
各 Skill DOMAIN.md（领域边界真源）
    ↓
README.md（给人查表，从 DOMAIN 摘要）
```

总机封发表与 README「不要混用」须与 `DOMAIN.md` 一致，**不在三处各写一套边界**。

## 双仓说明

- Skill 体系落在 **`trinity-AI/.cursor/skills/`**
- 业务 Vue 代码可能在 **`TrinityAI-web`**；工程类 Skill 的 `references/` 须标明「文档真源 / 代码落点」分支，不写死单仓路径

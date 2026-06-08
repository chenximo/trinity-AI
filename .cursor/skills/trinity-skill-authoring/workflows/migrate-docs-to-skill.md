# 迁移文档为 Skill

## 何时迁移

| 留在 `docs/` | 迁入 Skill |
|--------------|------------|
| 给人看的产品/工程叙事 | Agent 执行分流、门禁、检查清单 |
| 长 PRD、汇报 | 短摘要 + 链到 docs |
| 规范正文真源 | Skill 只写「何时 READ 哪份 md」 |

## 步骤

1. 确定领域 → 新建或扩展现有 Skill 目录
2. 从文档提取：**分流表、硬规则、检查清单、真源路径**（不搬全文）
3. 模板/长脚本 → `references/`；步骤 → `workflows/`
4. 边界从文档「适用范围」→ `DOMAIN.md`
5. 危险操作从文档「注意」→ `confirmation.md`
6. 原文档顶部加一句：`Agent 执行见 .cursor/skills/<name>/SKILL.md`
7. 更新 L0 封发表 + README

## 禁止

- 复制 PRD/飞书全文进 Skill
- 迁移后删除 docs 真源（Skill 是索引层，不是替代层）

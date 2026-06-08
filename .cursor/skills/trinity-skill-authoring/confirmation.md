# trinity-skill-authoring · 确认规则

以下操作 **须先告知用户并获确认**，再执行。

## 修改 L0 总机

- 改 `.cursor/skills/SKILL.md` 封发表或歧义消解表
- 改总机 `description` 触发词（影响自动匹配）

## 删除或合并 Skill

- 删除整个 Skill 目录
- 两个 Skill 合并为一个
- 重命名 Skill 目录（影响 `@` 引用与封发）

## 全局约定变更

- 调整大/中/小体量门禁定义
- 要求所有 Skill 强制五件套（须团队共识）

## 不需要确认

- 新建子 Skill（已按 create-skill workflow 注册 L0）
- 给现有 Skill 补 `workflows/`、`DOMAIN.md`（不改变边界）
- 修正真源路径笔误

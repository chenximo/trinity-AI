# 审计页面视觉规范

## READ

本 Skill + `TrinityAI/design-spec.html` + `docs/01-原型与交付规范/Trinity版式与视觉规范.md`

## 步骤

1. 打开目标页面，对照 `design-spec.html` 的控件形式
2. 检查颜色：是否有硬编码 hex（应为 `var(--*)`）
3. 检查按钮：类名是否与 `design-spec` 一致
4. 检查描边：选中态/弱强调是否用 `--blue-ring` 而非 `--blue`
5. 检查筛选：是否用 `or-app-filter-dd-*` 形式 2
6. 输出审计清单：合规项 / 需修复项

## 注意事项

- 规范未定稿前，只出审计清单，不改业务页
- 定稿后才做项目级同步

# 更新全局 Token

## READ

本 Skill + `assets/trinity-base.css`

## 步骤

1. 确认要改的 token 名称和当前值
2. 在 `trinity-base.css` 的 `:root`（及 `[data-theme="dark"]`）中修改
3. 对照 `TrinityAI/design-tokens.html` 确认视觉一致
4. 检查所有引用该 token 的页面无异常（`var(--*)` 引用点）
5. 如有语义变更，同步更新本 Skill 的 token 简表

## 注意事项

- 新增语义色先在 `:root` 定义变量，再在页面引用
- 不要用硬编码 hex 替代 `var(--*)`
- 暗色主题需同步调整 `[data-theme="dark"]` 下的覆盖值

# trinity-design-tokens · 确认规则

## 须先确认

- 修改 `assets/trinity-base.css` 中 `:root` 全局变量值
- 新增/删除语义 token（如 `--blue-soft`、`--grad` 等）
- 调整 `design-tokens.html` 或 `design-spec.html` 的核心结构
- 变更「规范先行」流程（如允许扩散改业务页）
- 修改品牌主色（`--blue`）、圆角体系（`--radius` / `--radius-lg`）
- 删除旧 token 或合并变量

## 不需要确认

- 本地预览 token 效果
- 对照 design-spec 审计页面 token 使用情况
- 在规范页内迭代控件样式（不涉及全局变量变更）
- 读取 `trinity-base.css` 或色板页

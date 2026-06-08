# 更新首页

## READ

本 Skill 模块索引 + `trinity-design-tokens`

## 步骤

1. 确认修改模块（Hero / 能力栅格 / 咨询区 / 页脚），只动目标区块
2. 颜色：用 `var(--*)`，不写硬编码 hex
3. 顶栏 50px（`--page-gutter`），正文 15%（`padding-inline`），不双层 gutter
4. 按钮：主 CTA `.btn.btn-gradient`，次按钮与 `design-spec` 一致
5. 字体字阶：用 `--home-font-*` 变量，窄屏按规定 breakpoint 降级
6. 浏览器验收 `/ai-cloud` 或 `/trinity-ai`

## 检查

营销页检查清单（本 Skill 文末）：色/字/间距、顶栏版式、按钮类名、未改其它产品线

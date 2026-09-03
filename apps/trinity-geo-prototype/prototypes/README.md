# Trinity GEO 营销首页 · 原型版本

| 版本 | 路径 | 说明 |
|------|------|------|
| **v1.1**（当前默认） | [`../marketing/index.html`](../marketing/index.html) | 对齐 `Trinity版式与视觉规范`：顶/底 50px gutter、main 15%、字号 L1–L6 |
| **官网 · 产品** | [`../marketing/product.html`](../marketing/product.html) | 六环深讲（可选卫星页） |
| **官网 · 定价** | [`../marketing/pricing.html`](../marketing/pricing.html) | 套餐表 + FAQ（可选卫星页） |
| **控制台 · 总览** | [`../marketing/console/dashboard.html`](../marketing/console/dashboard.html) · [解读](../marketing/console/dashboard.md) | 可见性总览 v0.2 |
| **控制台 · 品牌设置** | [`../marketing/console/brand-settings.html`](../marketing/console/brand-settings.html) · [PRD](../marketing/console/brand-settings.md) | ① 策略 · 别名库 v0.1 |
| **控制台 · 问题集** | [`../marketing/console/keywords.html`](../marketing/console/keywords.html) · [PRD](../marketing/console/keywords.md) | ① 策略 · SOA 分母 v0.1 |
| **控制台 · 竞品管理** | [`../marketing/console/competitors-manage.html`](../marketing/console/competitors-manage.html) · [PRD](../marketing/console/competitors-manage.md) | ① 策略 · 对比侧 v0.1 |
| **控制台 · 竞品概览** | [`../marketing/console/competitors.html`](../marketing/console/competitors.html) · [PRD](../marketing/console/competitors.md) | ③ 同题 SOA 对比 v0.1 |
| **控制台 · 竞品详情** | [`../marketing/console/competitor-detail.html`](../marketing/console/competitor-detail.html) · [PRD](../marketing/console/competitor-detail.md) | ③④ 下钻 · OpenRouter 样本 |
| **控制台 · 诊断列表** | [`../marketing/console/diagnosis.html`](../marketing/console/diagnosis.html) · [PRD](../marketing/console/diagnosis.md) | ④ 规则 D1–D5 v0.1 |
| **控制台 · 页面审计** | [`../marketing/console/audit.html`](../marketing/console/audit.html) · [PRD](../marketing/console/audit.md) | ④ S4 可引用性 v0.1 |
| **控制台 · 优化待办** | [`../marketing/console/optimize.html`](../marketing/console/optimize.html) · [PRD](../marketing/console/optimize.md) | ⑤ 诊断→行动 v0.1 |
| **控制台 · 优化详情** | [`../marketing/console/optimize-detail.html`](../marketing/console/optimize-detail.html) · [PRD](../marketing/console/optimize-detail.md) | ⑤ 样本 opt-s1s2 |
| **控制台 · 效果验证** | [`../marketing/console/verify.html`](../marketing/console/verify.html) · [PRD](../marketing/console/verify.md) | ⑥ R1→R2 信源样本 |
| **控制台 · 报告列表** | [`../marketing/console/reports.html`](../marketing/console/reports.html) · [PRD](../marketing/console/reports.md) | ⑥ 周报 / 月报 |
| **控制台 · 报告预览** | [`../marketing/console/report-preview.html`](../marketing/console/report-preview.html) | ⑥ 在线预览样本 |
| **控制台 · 采集日志** | [`monitoring.html?tab=logs`](../marketing/console/monitoring.html?tab=logs) · [Tab PRD](../marketing/console/monitoring-logs.md) | ② 监测页内 Tab |
| **控制台 · 账户套餐** | [`../marketing/console/settings-account.html`](../marketing/console/settings-account.html) · [PRD](../marketing/console/settings-account.md) | ⑧ 用量 / 升级 |
| **控制台 · 通知告警** | [`../marketing/console/settings-notifications.html`](../marketing/console/settings-notifications.html) · [PRD](../marketing/console/settings-notifications.md) | ⑧ 邮件 / 定时 |
| **控制台 · 监测概览** | [`../marketing/console/monitoring.html`](../marketing/console/monitoring.html) · [PRD](../marketing/console/monitoring.md) | ② 采集状态 v0.1 |
| **控制台 · 关键词详情** | [`../marketing/console/keyword-detail.html`](../marketing/console/keyword-detail.html) · [PRD](../marketing/console/keyword-detail.md) | ③ 测量下钻 · Q00 |
| **控制台 · 回答详情** | [`../marketing/console/answer-detail.html`](../marketing/console/answer-detail.html) · [PRD](../marketing/console/answer-detail.md) | ③ 原始证据 · Q00·豆包 |
| **CCR 样本回答** | [`../marketing/console/answer-detail-brand.html`](../marketing/console/answer-detail-brand.html) | Q01·ChatGPT 引用样本 |
| **v1**（冻结） | [`v1/index.html`](./v1/index.html) | 2026-06-12 归档，仅作对照，不随默认入口更新 |

**预览**

- 门户：`http://localhost:5173/__geo_marketing/index.html`（v1.1）
- v1 归档：`http://localhost:5173/__geo_marketing/prototypes/v1/index.html`
- 静态：仓库根目录 `python3 -m http.server`，访问对应路径

**样式与脚本**：各版本共用 `css/home.css`、`js/home.js`；v1.1 新增区块样式在 `home.css` 末尾 `/* v1.1 */` 段。

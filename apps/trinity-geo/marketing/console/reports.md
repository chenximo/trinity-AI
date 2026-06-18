# 用户控制台 · 报告列表 · 产品需求（PRD）

> **配套原型**：[reports.html](./reports.html) · 预览 [report-preview.html](./report-preview.html)  
> **全景**：[原型页面清单](../../../../trinity-product/docs/geo/v1-prototype-pages.md) §2.8

| 字段 | 内容 |
|------|------|
| 路由 | `/console/reports` · 预览 `/console/reports/:id` |
| 六环 | ⑥ 验证与报告 |
| 优先级 | P1 |

## 1. 目标

周期汇总 SOA、竞品、诊断与验证结论，支持外发周会 / 月报；与 [效果验证](./verify.html)（单次 R1→R2）区分。

## 2. 功能

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| 历史列表 | 周报 / 月报 / 验收摘要；状态草稿 / 已生成 | P0 |
| 在线预览 | 执行摘要、平台分布、P0 诊断链 | P0 |
| 定时配置 | 默认周一 09:00 周报 | P1 |
| PDF / 邮件 | 商用占位 | P2 |

## 3. 样本数据

- **2026-W24 周报**：全球 SOA 42% ↑6%，中国 28% ↓3%
- **Q00 验收摘要**：链 [verify.html#verify-q00](./verify.html#verify-q00)

## 4. 关联

- 通知：[settings-notifications.html](./settings-notifications.html)
- 用量：[settings-account.html](./settings-account.html)

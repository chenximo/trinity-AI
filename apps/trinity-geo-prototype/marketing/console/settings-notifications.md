# 用户控制台 · 通知与告警 · 产品需求（PRD）

> **配套原型**：[settings-notifications.html](./settings-notifications.html)  
> **全景**：[原型页面清单](../../../../trinity-product/docs/geo/v1-prototype-pages.md) §2.9

| 字段 | 内容 |
|------|------|
| 路由 | `/console/settings/notifications` |
| 六环 | ⑥（报告定时、SOA 异动） |
| 优先级 | P1 |

## 1. 目标

配置邮件告警与周报定时；与采集失败、试用到期联动。

## 2. 功能

| 通知类型 | 默认 | 优先级 |
|----------|:----:|:------:|
| SOA 周环比下降 ≥10% | 开 | P0 |
| 竞品新覆盖 | 开 | P0 |
| 采集连续失败 | 开 | P0 |
| GEO 周报（周一 09:00） | 开 | P1 |
| 试用到期提醒 | 开 | P1 |
| Webhook / Slack | 关（企业版） | P2 |

## 3. 关联

- [reports.html](./reports.html) 定时摘要
- [monitoring.html?tab=logs](./monitoring.html?tab=logs) 失败明细（采集日志 Tab）

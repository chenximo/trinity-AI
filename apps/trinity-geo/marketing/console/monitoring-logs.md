# 用户控制台 · 采集日志 · 产品需求（PRD）

> **配套原型**：[monitoring-logs.html](./monitoring-logs.html)  
> **全景**：[原型页面清单](../../../../trinity-product/docs/geo/v1-prototype-pages.md) §2.3

| 字段 | 内容 |
|------|------|
| 路由 | `/console/monitoring/logs` |
| 六环 | ② 监测采集 |
| 优先级 | P1 |

## 1. 目标

按平台 × 问题记录日采结果，支持筛选失败任务与单条重试；运维排障用。

## 2. 功能

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| 日志表 | 时间、平台、问题、状态、耗时 | P0 |
| 筛选 | 平台 / 状态 / 日期 | P1 |
| 重试 | 单条失败重采（原型按钮） | P1 |
| 导出 CSV | 商用 | P2 |

## 3. 样本

- 6/15 豆包 Q00、Q01 **超时**（120s）  
- 6/15 ChatGPT / Claude Q00 成功，链 [answer-detail](./answer-detail.html)

## 4. 关联

- 概览 KPI：[monitoring.html](./monitoring.html)  
- 告警：[settings-notifications.html](./settings-notifications.html)

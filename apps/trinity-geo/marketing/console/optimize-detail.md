# 用户控制台 · 优化详情 · 产品需求（PRD）

> **配套原型**：[optimize-detail.html](./optimize-detail.html)（样本 `opt-s1s2`）  
> **全景**：[原型页面清单](../../../../trinity-product/docs/geo/v1-prototype-pages.md) §2.7

| 字段 | 内容 |
|------|------|
| 路由 | `/console/optimize/:id` |
| 六环 | ⑤ 优化 |
| 优先级 | P1 |

## 1. 目标

单条优化任务的说明、执行清单、对标链接与验收标准；从 [优化待办](./optimize.html) 下钻。

## 2. 功能

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| 任务元数据 | 诊断类型、负责人、截止、状态 | P0 |
| 执行清单 | 可勾选步骤（原型静态） | P0 |
| 依据与对标 | 信源盘、竞品 docs URL | P0 |
| 验收标准 | 链 R1→R2 [verify](./verify.html#verify-q00) | P0 |

## 3. 样本主线 · opt-s1s2

- **标题**：doc 建「API 聚合选型」官方文档树  
- **目标**：[Q00](./keyword-detail.html) · 诊断 [D1+S1+S2](./diagnosis.html#diag-q00)  
- **验证**：信源 0/16 → 1/17，SOA 仍 0%

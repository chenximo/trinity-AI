# 用户控制台 · 竞品详情 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/competitors/:id`）功能的产品需求真源。  
> **配套原型**：[competitor-detail.html](./competitor-detail.html)（HTML v0.1，样本 **openrouter**）  
> **样本数据**：[mvp/config/brand.json](../../mvp/config/brand.json) · [Q00 回答](../../mvp/data/r1/annotations.json)  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/competitor-detail.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
| 状态 | 草稿 |
| 路由 | `/console/competitors/:id` |
| 六环 | ③ 测量 · ④ 诊断输入 |
| 优先级 | P0 |
| 顶栏入口 | 竞品概览 / 总览竞品表 |

---

## 1. 页面定位

单竞品 `entity_id` 的 SOA 表现：超越/落后我方的问题列表、分平台对比、含该竞品的最新回答。

**样本**：OpenRouter — Q00 豆包回答中首推占位。

---

## 2. 功能需求

| 区块 | 说明 |
|------|------|
| KPI | 竞品 SOA 7d、超越我方题数、首推率、CCR |
| 领先我方的问题 | 题级 SOA 差值表 |
| 分平台 SOA | 竞品 vs 我方 |
| 最新回答 | 链回答详情 |
| 操作 | 返回概览、编辑别名（竞品管理） |

---

## 3. 路由

| 参数 | 说明 |
|------|------|
| `:id` | `competitor` entity_id，如 `openrouter` |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿 · 批 3 · OpenRouter 样本 |

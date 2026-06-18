# 用户控制台 · 报告列表 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/reports`）功能的产品需求真源。  
> **配套原型**：[reports.html](./reports.html)（HTML v0.2 · 扁平 IA）· 预览 [report-preview.html](./report-preview.html)  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/reports.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.2 |
| 状态 | 草稿 |
| 路由 | `/console/reports` · 预览 `/console/reports/:id` |
| 六环 | ⑥ 验证与报告 |
| 优先级 | P1 |
| 顶栏入口 | **报告 → 报告列表** |

### 文档分工

| 范围 | 真源 |
|------|------|
| 周期汇总 vs 单次验证 | **本文** · [效果验证](./verify.md) |
| 周报正文结构 | [report-preview](./report-preview.html) |
| 通知定时 | [settings-notifications](./settings-notifications.html) |

---

## 1. 目标

周期汇总 SOA、竞品、诊断与验证结论，支持外发周会 / 月报；与 [效果验证](./verify.html)（单次 R1→R2）区分。

---

## 2. 功能

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| 历史列表 | 周报 / 月报 / 验收摘要；类型筛选 + 搜索 | P0 |
| W24 spotlight | 本周周报样本条 | P0 |
| 在线预览 | 执行摘要、平台分布、P0 诊断链 | P0 |
| 定时配置 | 折叠区 · 默认周一 09:00 | P1 |
| PDF / 邮件 | 商用占位 | P2 |

---

## 3. 原型样本

| 报告 | 类型 | 说明 |
|------|------|------|
| GEO 周报 W24 | weekly | 全球 42% ↑6% · 中国 28% ↓3% |
| GEO 月报 | monthly | 草案 · 含 Q00 注记 |
| Q00 验收摘要 | verify | 链 verify-q00-detail |

Mock：页头 **ⓘ** · `geo-help-tpl-reports-mock`

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | v0.2：扁平表格 · W24 spotlight · 筛选 · ⓘ · 定时折叠 |
| 2026-06-12 | 初稿 · 批 6 |

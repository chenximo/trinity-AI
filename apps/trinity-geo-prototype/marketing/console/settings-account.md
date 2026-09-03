# 用户控制台 · 账户与套餐 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/settings/account`）功能的产品需求真源。  
> **配套原型**：[settings-account.html](./settings-account.html)（HTML v0.2 · 扁平 IA）  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/settings-account.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.2 |
| 状态 | 草稿 |
| 路由 | `/console/settings/account` |
| 六环 | ⑧ 设置 |
| 优先级 | P1 |
| 顶栏入口 | **设置 → 账户与套餐** |

---

## 1. 目标

展示 GEO 订阅套餐、用量配额与升级入口；登录身份复用 Trinity 门户。

---

## 2. 功能

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| 套餐 KPI | 专业版 · 试用天数 · 关键配额摘要 | P0 |
| 配额表 | 各维度已用/上限 + 用量条 + 管理链 | P0 |
| 账户信息 | 邮箱、组织、时区 | P1 |
| 账单 | Stripe 托管，链门户 | P2 |
| 权益速查 | 折叠区 | P1 |

---

## 3. 原型样本

专业版 $79/月 · 试用 12 天 · 问题 10/100 · 平台 **10/10 满额** · 竞品 6/10。

Mock：页头 **ⓘ** · `geo-help-tpl-account-mock`

---

## 4. 关联

- 升级 → [../pricing.html](../pricing.html)
- 侧栏与 [brand-settings.html](./brand-settings.html) 共用设置导航
- 通知 → [settings-notifications.html](./settings-notifications.html)

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | v0.2：扁平 IA · 配额表 · KPI · ⓘ · 侧栏关联 |
| 2026-06-12 | 初稿 · 批 6 |

# 用户控制台 · 账户与套餐 · 产品需求（PRD）

> **配套原型**：[settings-account.html](./settings-account.html)  
> **全景**：[原型页面清单](../../../../trinity-product/docs/geo/v1-prototype-pages.md) §2.9

| 字段 | 内容 |
|------|------|
| 路由 | `/console/settings/account` |
| 优先级 | P1 |

## 1. 目标

展示 GEO 订阅套餐、用量配额与升级入口；登录身份复用 Trinity 门户。

## 2. 功能

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| 当前套餐 | 专业版 $79/月、试用剩余天数 | P0 |
| 用量看板 | 品牌 / 问题 / 平台 / 竞品配额 | P0 |
| 账户信息 | 邮箱、组织、时区 | P1 |
| 账单历史 | Stripe 托管，链门户账单中心 | P2 |

## 3. 样本

专业版：1/3 品牌 · 10/100 问题 · 10/10 平台 · 5/10 竞品。

## 4. 关联

- 升级 CTA → [../pricing.html](../pricing.html)
- 侧栏与 [brand-settings.html](./brand-settings.html) 共用设置导航

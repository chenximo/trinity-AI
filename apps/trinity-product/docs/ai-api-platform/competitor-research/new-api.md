---
title: New API（开源）
---

# New API · 友商调研（开源）

> **说明**：[New API](https://github.com/QuantumNous/new-api) 为开源的统一 AI 模型聚合与分发枢纽，与 Trinity **AI API 聚合产品**同类（网关 + 多渠道 + 管理面），可作产品与工程参考；**非**对外宣传用语。

## 官方入口

| 项 | 链接 |
|----|------|
| GitHub | [QuantumNous/new-api](https://github.com/QuantumNous/new-api) |
| 定位（README） | A unified AI model hub for **aggregation & distribution** |

## 产品摘要（来自项目说明）

- 统一模型枢纽：聚合上游、对外分发。
- 协议转换：可将多种 LLM 上游转为 **OpenAI 兼容**、**Claude 兼容**或 **Gemini 兼容**格式。
- 集中网关：面向个人与企业场景的模型与 Key 管理。

## 与 Trinity 分层对照（初稿）

| New API（开源） | Trinity 手册入口 | 备注 |
|-----------------|------------------|------|
| 统一网关 / 协议转换 | [统一 API 基座](../platform/unified-api) · [路由与 Fallback](../platform/routing-fallback) | 同类「一条出口、多上游」 |
| 渠道 / 模型配置 | [模型上架与供应线路](../operations/models-routes) · [供应商管理](../operations/suppliers) | 开源自带管理后台；Trinity 为 `trinity-ai-admin` |
| 用户 / Key / 配额 | [用户控制台](../user/account-console) · [鉴权 · 限流 · 配额](../platform/auth-rate-quota) | |
| 计量与计费 | [计量与计费](../platform/metering-billing) · [用量与计费](../operations/billing) | 【待补充：对比粒度】 |
| 对用户文档 | [开发者文档](../user/developer-docs) · 对外 [trinity-docs](http://127.0.0.1:5205/docs/quickstart) | Trinity 独立文档站 |

与 **OpenRouter**（SaaS、偏用户面 + API）不同，New API 更接近 **自建聚合平台全栈**，运营后台能力更值得对照。

## Skill 层（IDE 用户侧）

友商已发布 [newapi Skill](https://docs.newapi.pro/zh/docs/skills/newapi)（[QuantumNous/skills](https://github.com/QuantumNous/skills)），Trinity 对标与 **P0–P3 落地方案** 见专页：

→ **[New API · newapi Skill 友商调研与 Trinity 落地方案](./new-api-skill)**

附录：[设计要点](./new-api-skill-design) · [模型列表与详情 API](./new-api-skill-model-info)

## 调研备忘

| 主题 | 结论 / 状态 |
|------|-------------|
| IDE Skill（newapi） | 见 [new-api-skill](./new-api-skill)；Trinity 当前主要缺口 |
| 开源协议与二次开发 | 【待补充：License、能否借鉴模块】 |
| 部署与运维 | 【待补充：Docker / 配置形态】 |
| 多模态 / 生图 / 生视频 | 【待补充：与 Trinity 能力边界 diff】 |
| 【待补充：飞书深度调研】 | 【待补充】 |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 增加 Skill 层入口，链至 new-api-skill 专页 |
| 2026-06-05 | 首版：收录 GitHub 项目说明与 Trinity 对照表 |

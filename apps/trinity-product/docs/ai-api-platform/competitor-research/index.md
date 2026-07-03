---
title: 友商产品调研
---

# 友商产品调研 · 总览

> **说明**：内部竞品与对标产品的调研索引；分友商专页沉淀结论，不写入对外 `trinity-docs`。
>
> **维护**：新开友商调研时在本目录增页并注册侧栏；深度分析可链飞书，专页保留入口与一句话结论。

## 调研一览

| 友商 | 专页 | 一句话 |
|------|------|--------|
| OpenRouter | [OpenRouter](./openrouter) | 统一 API + Models + Docs；Trinity 用户/平台侧主要对标（SaaS） |
| New API | [New API（开源）](./new-api) | 开源聚合与分发枢纽；协议转换 + 集中网关；全栈对照参考 |
| New API · Skill | [newapi Skill 对标与 Trinity 落地方案](./new-api-skill) | IDE 用户侧 Skill；**当前 Trinity 主要缺口**；含 P0–P3 执行表 |
| 【待补充】 | — | 新友商在此增行并建子页 |

## 调研维度（写结论时用）

| 维度 | 看什么 | Trinity 备注 |
|------|--------|--------------|
| 信息架构 | 顶栏、文档 / API / Cookbook 分工 | `trinity-docs` 三轨；维护规范 `docs/04-工程与迁移/Trinity对外文档站-基本规范.md` |
| 模型发现 | 列表、筛选、排行、详情 | [模型广场 · 列表](../user/models/list) · [模型排名](../user/models/rankings) · [模型详情](../user/models/model-detail-requirements) |
| 统一 API | 路径、鉴权、流式、多模态 | [统一 API 基座](../platform/unified-api) · [多模态 API](../platform/multimodal-api) |
| 计费展示 | 刊例、按 token / 张 / 秒 | [计量与计费](../platform/metering-billing) · 采购成本见 [模型价格真源](../pricing-sources/) |
| 工具接入 | Cursor、CLI、SDK 叙事 | [开发者文档](../user/developer-docs) · 对外 Cookbook · [newapi Skill 落地方案](./new-api-skill) |
| 运营能力 | 上架、路由、供应商 | [运营后台总览](../operations/)（B2B 自建，友商多为 SaaS 无对等后台） |

## 和本手册其他页的关系

| 主题 | 入口 |
|------|------|
| 上游厂商文档与采购价 | [模型价格真源](../pricing-sources/) · [上游资料索引](../upstream-references) |
| 对客户能力说明 | 对外 [trinity-docs](http://127.0.0.1:5205/docs/quickstart) |
| 模块进度与节点 | [产品总览 · 周计划](../#周计划与验收看板) |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | Skill dogfood：`GET /v1/models/{id}` 401 → [产品待办池](../#产品待办池) · [模型 API 附录](./new-api-skill-model-info) |
| 2026-06-12 | 新增 [newapi Skill 对标与落地方案](./new-api-skill)、[P0 实施规格](./new-api-skill-p0-spec)；代码见 `apps/trinity-skills` |
| 2026-06-05 | 新增 [New API（开源）](./new-api) 专页 |
| 2026-06-05 | 改为目录总览 + 二级侧栏；OpenRouter 拆专页 |
| 2026-06-05 | 首版单页索引 |

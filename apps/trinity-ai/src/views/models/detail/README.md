# 模型详情子模块（规划）

> **需求真源（产品手册）**：`apps/trinity-product/docs/ai-api-platform/user/models/model-detail-requirements.md` · `detail-roadmap.yml`（列表见 `list.md`）  
> **列表模块**：`../README.md` · `ModelsPage.vue` · `/models`

## 1. 一句话

单模型说明页：展示与列表一致的 catalog 字段，并闭环到 **Chat 试玩** 与 **API 文档**；6.30 做轻量一屏，不对标 OpenRouter 全 Tab。

## 2. 规划路由

| 路径（独立 `trinity-ai`） | 路由 name | 说明 |
|---------------------------|-----------|------|
| `/models/:modelId` | `tai-model-detail`（待建） | `modelId` = 网关 slug，如 `openai/gpt-5.5` |

门户嵌套：`/trinity-ai/models/:modelId`。

## 3. 目录约定（实现时）

| 文件 | 职责 |
|------|------|
| `ModelDetailPage.vue` | 路由入口：概览、CTA、返回列表 |
| `model-detail.css` | 详情页样式（或复用 `models.css` 前缀） |
| `README.md` | 本说明 |

数据层：**禁止**新建独立 mock 表；复用列表 catalog API / 共享 `mock.ts` 查询函数。

## 4. 6.30 实现顺序（建议）

1. 路由 + 从 `ModelsPage` 卡片链入 slug  
2. 概览区（名、id、描述、模态、价、上下文）  
3. CTA：Chat（带 model query）、文档链接  
4. 接 live API 后与运营上架联调  
5. 404 / 下架态  

Providers、Performance、Benchmarks 等见需求文档 **§5 后期**。

## 5. 参考

- 对标页：https://openrouter.ai/openai/gpt-5.5  
- Roadmap C6：`docs/05-产品与PRD/roadmap/用户面-03-模型广场.md`

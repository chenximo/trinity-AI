# trinity-product-handbook · 领域边界

## 本 Skill 管什么

| 范围 | 路径 |
|------|------|
| 产品手册正文 | `apps/trinity-product/docs/**`（VitePress） |
| 进度真源 | 叶子 `roadmap.yml`、`ai-api-platform/week-progress.yml` |
| 侧栏 IA | `apps/trinity-product/.vitepress/config.ts` |
| 手册组件 | `ProductRoadmap`、`ProductWeekProgress` |
| 页型模板 | 站点总览、产品总览、子总览、标准叶子 |

规范真源：`产品手册文档规范.md`、`产品手册更新规范.md`。

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| API 验收台、用例 JSON、Chat API Test 数据 | `trinity-api-acceptance` |
| 对外开发者文档 `apps/trinity-docs` | `trinity-docs` |
| Vue 业务实现、`apps/trinity-ai` 等 | `trinity-vue-prototype-monorepo`（须用户说「落地工程」） |
| 用户控制台 / 运营后台 UI | `trinity-user-console` / `trinity-admin-ruoyi-list` |
| 已废止 `docs/05-产品与PRD/roadmap/` | **禁止维护** |

## 与 api-test 的关系

- 手册 **可链** `api-test/` 入口（侧栏、week-progress focus）
- **不维护** `acceptance/cases/*.json`、`chat-api-test.data.json`
- api-test 页的验收流程叙事若在 `api-test/*.md`，改验收逻辑封发 `trinity-api-acceptance`

## 默认边界

未说「落地工程」时，**只改** `apps/trinity-product/docs` 与相关 yml/config，不改其它 `apps/*` 业务代码。

# trinity-api-acceptance · 领域边界

## 本 Skill 管什么

| 范围 | 路径 / 入口 |
|------|-------------|
| 验收台 UI 与 runner | `apps/trinity-product/acceptance/**`、`.vitepress/theme/ApiAcceptanceConsole.vue`、`ApiValidationReportHub.vue` |
| 内测文档站（api-test） | `apps/trinity-product/docs/ai-api-platform/api-test/**` |
| 用例、模型配置 | `acceptance/cases/`、`acceptance/config/` |
| 汇总报告 | `api-test/reports/chat-api-test*` |
| 实行计划 | `docs/00-协作与工作流/工程师/API生文验收台-实行计划.md` |

核心流程：**选模型 → 运行全部 → 导出 Chat API Test**。

## 本 Skill 不管什么

| 不归本 Skill | 交给 |
|--------------|------|
| 产品手册页型、roadmap/week-progress 叙事 | `trinity-product-handbook` |
| 对外开发者文档 `apps/trinity-docs` | `trinity-docs` |
| 网关服务实现、生产部署 | 工程团队 / 后端仓库 |
| 用户控制台、运营后台 UI | `trinity-user-console` / `trinity-admin-ruoyi-list` |
| 全局 design token | `trinity-design-tokens` |

## 与 handbook / docs 的防火墙

- **handbook**：可链到 api-test 入口，但不维护用例 JSON 与报告数据
- **docs**：对外参数以工程师 md 为准发布；验收台读内测镜像，不反向改对外 md
- **本 Skill**：可改内测文档 `internal-api-doc`、用例、报告；改工程师参数 md 时须同步考虑 docs 发布（封发 `trinity-docs`）

## 双仓

- 验收台当前落在 **`trinity-AI/apps/trinity-product`**
- 若 UI 迁到 `TrinityAI-web`，更新 `./references/source-paths.md` 代码落点，DOMAIN 边界不变

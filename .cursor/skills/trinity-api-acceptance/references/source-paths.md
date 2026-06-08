# API 验收 · 真源路径表

## 文档（给人看 + Agent READ）

| 资产 | 路径 |
|------|------|
| 实行计划 | `docs/00-协作与工作流/工程师/API生文验收台-实行计划.md` |
| 参数契约（工程师真源） | `docs/00-协作与工作流/工程师/API对外接口支持参数.md` |
| API 测试总览 | `apps/trinity-product/docs/ai-api-platform/api-test/index.md` |
| 生文验收台页 | `apps/trinity-product/docs/ai-api-platform/api-test/chat-completions.md` |
| 内测参数镜像 | `apps/trinity-product/docs/ai-api-platform/api-test/internal-api-doc.md` |
| 验收路线图 | `apps/trinity-product/docs/ai-api-platform/api-test/roadmap.md` |
| Chat API Test 页 | `apps/trinity-product/docs/ai-api-platform/api-test/reports/chat-api-test.md` |

## 数据与配置

| 资产 | 路径 |
|------|------|
| 用例 JSON | `apps/trinity-product/acceptance/cases/chat-completions.json` |
| MVP 模型列表 | `apps/trinity-product/acceptance/config/models.mvp.json` |
| 参数悬停 | `apps/trinity-product/acceptance/config/chatParamHints.ts` |
| 环境示例 | `apps/trinity-product/acceptance/config/env.example.json` |
| 汇总数据（git） | `apps/trinity-product/docs/ai-api-platform/api-test/reports/chat-api-test.data.json` |
| 运行缓存（本地） | `apps/trinity-product/acceptance/runs/`（gitignore） |

## 代码

| 资产 | 路径 |
|------|------|
| 验收台组件 | `apps/trinity-product/.vitepress/theme/ApiAcceptanceConsole.vue` |
| 报告 Hub | `apps/trinity-product/.vitepress/theme/ApiValidationReportHub.vue` |
| 报告样式 | `apps/trinity-product/.vitepress/theme/chat-api-test-hub.css` |
| 主题注册 | `apps/trinity-product/.vitepress/theme/index.ts` |
| 侧栏 | `apps/trinity-product/.vitepress/config.ts`（「API 测试」分组） |
| Runner | `apps/trinity-product/acceptance/runner/*.ts` |

## 关联（只链不改）

| 资产 | Skill |
|------|-------|
| 周计划 focus 叶子 | `weekProgressFocusLeaves.ts` → handbook 维护 focus 文案 |
| 对外 API 文档 | `apps/trinity-docs` → `trinity-docs` |

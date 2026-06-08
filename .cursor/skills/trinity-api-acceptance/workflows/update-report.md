# 更新 Chat API Test 报告

## 目标

将当前模型的测试结果写入 git 真源：

`apps/trinity-product/docs/ai-api-platform/api-test/reports/chat-api-test.data.json`

报告页：`reports/chat-api-test.md`（`ApiValidationReportHub.vue` 渲染）

## 步骤

1. 在 dev 验收台完成 **运行全部** + 人工确认
2. 点 **导出测试汇总**
3. 确认 JSON 中该模型一节已更新（每模型覆盖一节）
4. 浏览器打开 `/product/ai-api-platform/api-test/reports/chat-api-test` 验证筛选
5. 提交 `chat-api-test.data.json`（见 `confirmation.md`）

## 多模型

每个模型重复：选模型 → 运行全部 → 导出。汇总页汇集所有已导出模型。

## 禁止

- 手改 JSON 结构破坏 `chatApiTestReport.ts` 契约（除非同步改 runner）
- 在静态 build 站写入报告（一期仅 dev + git）

# 更新 Chat API Test 报告

> 能力清单：[`../tools.yaml`](../tools.yaml) · 确认：[`../confirmation.md`](../confirmation.md)

## 能力引用

| 步骤 | tool id |
|------|---------|
| 前置 | `acceptance.run.all` |
| **主步骤** | `acceptance.report.export` |

## 目标

写入 git 真源：

`apps/trinity-product/docs/ai-api-platform/api-test/reports/chat-api-test.data.json`

报告页：`reports/chat-api-test.md`（`ApiValidationReportHub.vue`）

## 步骤

1. dev 验收台完成 **运行全部** + 人工确认
2. UI：**导出测试汇总**（须 **confirmation**）
3. 确认 JSON 中该模型一节已更新
4. 打开 `/product/ai-api-platform/api-test/reports/chat-api-test` 验证
5. 提交 `chat-api-test.data.json`

## 多模型

每个模型：选模型 → 运行全部 → 导出。

## 禁止

- 手改 JSON 结构破坏 `chatApiTestReport.ts` 契约（除非同步改 runner）
- 在静态 build 站写入报告（一期仅 dev + git）

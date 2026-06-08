# 验收台 · 预览与数据格式

## 本地预览

```bash
npm run dev -w @trinity/app-trinity-product
```

| 页面 | URL |
|------|-----|
| 生文验收台 | http://127.0.0.1:5206/product/ai-api-platform/api-test/chat-completions |
| Chat API Test | http://127.0.0.1:5206/product/ai-api-platform/api-test/reports/chat-api-test |
| API 测试总览 | http://127.0.0.1:5206/product/ai-api-platform/api-test/ |

## 环境

| 项 | 说明 |
|----|------|
| API Key | 顶栏或 `TRINITY_API_KEY`；格式 `xh-…` |
| BASE_URL | 顶栏可改；默认内测网关 |
| 工作区缓存 | `localStorage`，24h；清缓存可重测 |

## 导出数据格式

- 写入：`reports/chat-api-test.data.json`
- 生成逻辑：`acceptance/runner/chatApiTestReport.ts`、`formatAcceptanceReport.ts`
- 每模型一节：用例结果、人工确认、时间戳

## Runner 模块（改逻辑时 READ）

| 文件 | 职责 |
|------|------|
| `executeCase.ts` | HTTP 执行 |
| `formatChatRequest.ts` | 请求体构造 |
| `resolveCaseExpect.ts` | 断言 |
| `acceptanceRunCache.ts` | 本地缓存 |

`tools/` 本目录为**说明文档**；可执行脚本二期放 `acceptance/scripts/`。

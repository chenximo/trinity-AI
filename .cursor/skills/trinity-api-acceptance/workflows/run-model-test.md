# 跑模型测试

## 前置

1. `npm run dev -w @trinity/app-trinity-product`（端口 **5206**）
2. 打开 `/product/ai-api-platform/api-test/chat-completions`
3. 顶栏填 **API Key**（`xh-…`，勿带 `Bearer`）与 **BASE_URL**（默认内测网关）

环境变量可选：`TRINITY_API_KEY`

## 步骤

1. READ `acceptance/config/models.mvp.json` 或顶栏 **新增** 临时模型
2. 选择 **测试模型**
3. 点 **运行全部** — 8 条通用用例 × 当前模型
4. 查看表格：机器断言、耗时、响应摘要、人工确认列
5. 逐条或批量标记人工 **通过 / 不通过**（可选备注）

## 注意

- 重跑会清空该模型的人工确认状态
- `acceptance/runs/` 为本地缓存，不进 git
- 失败排查：鉴权、BASE_URL、`executeCase.ts` 请求构造

## 收尾

- 满意后 → [`update-report.md`](./update-report.md) 导出汇总
- 改用例逻辑 → [`maintain-cases.md`](./maintain-cases.md)

# 跑模型测试

> 能力清单：[`../tools.yaml`](../tools.yaml)

## 能力引用

| 步骤 | tool id |
|------|---------|
| 1 | `acceptance.dev.product` |
| 2 | `acceptance.run.all` |
| 3（可选） | `acceptance.report.export` |

## 前置

1. 执行 `acceptance.dev.product`（端口 **5206**）
2. 打开 `/product/ai-api-platform/api-test/chat-completions`
3. 顶栏填 **API Key**（`xh-…`）与 **BASE_URL**

环境变量可选：`TRINITY_API_KEY` · 详见 [`../tools/preview-and-export.md`](../tools/preview-and-export.md)

## 步骤

1. READ `acceptance/config/models.mvp.json` 或顶栏临时新增
2. 选择 **测试模型**
3. UI：**运行全部**（`acceptance.run.all`）
4. 查看表格：机器断言、耗时、响应摘要、人工确认
5. 逐条或批量标记 **通过 / 不通过**

## 注意

- 重跑会清空该模型的人工确认状态
- `acceptance/runs/` 为本地缓存，不进 git
- 失败排查：鉴权、BASE_URL、`executeCase.ts`

## 收尾

- 满意后 → [`update-report.md`](./update-report.md) · `acceptance.report.export`
- 改用例 → [`maintain-cases.md`](./maintain-cases.md)

# trinity-api-acceptance · 确认规则

> 通用规则：[`../common/confirmation.md`](../common/confirmation.md)  
> 能力清单：[`./tools.yaml`](./tools.yaml)

## 须先确认再执行（`confirm: required`）

| tool id | 操作 | 说明 |
|---------|------|------|
| `acceptance.report.export` | 导出测试汇总 | 覆盖 `chat-api-test.data.json` 中该模型节 |
| `acceptance.models.edit` | 改 `models.mvp.json` | 持久 MVP 模型列表 |
| `acceptance.cases.edit` | 删/改 `chat-completions.json` | 中断历史对比 |
| `acceptance.engineer-params.edit` | 改工程师参数 md | 须评估 `trinity-docs` |
| `acceptance.cache.clear` | 清 runs / localStorage | 丢失人工确认 |

## 建议确认（`confirm: optional`）

| tool id | 操作 |
|---------|------|
| `acceptance.param-hints.edit` | 改 `chatParamHints.ts` |
| `acceptance.roadmap.edit` | 改 `roadmap.md` 用例表 |

## 不需要确认

- `acceptance.dev.product` · `acceptance.run.all`（dev 本地跑，不写 git）
- 验收台顶栏 **临时新增** 模型（未改 `models.mvp.json`）

## 确认话术模板

```text
将覆盖 Chat API Test 中模型 <id> 的汇总数据并提交 git，是否继续？
```

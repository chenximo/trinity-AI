# trinity-api-acceptance · 确认规则

## 须先确认再执行

| 操作 | 说明 |
|------|------|
| **覆盖报告** | 导出 `chat-api-test.data.json` 覆盖已有模型结果 |
| **入库模型** | 改 `models.mvp.json` 并提交 |
| **删改用例** | 删/改 `chat-completions.json` 中断历史对比 |
| **提交验收数据** | git commit `*.data.json`、`cases/*.json` |
| **删本地缓存** | 清 `acceptance/runs/` 或用户 localStorage（告知会丢人工确认） |
| **改工程师参数 md** | 影响 docs 发布，须同步评估 `trinity-docs` |

## 不需要确认

- dev 本地跑测试（不写 git）
- 顶栏临时新增模型（未改 `models.mvp.json`）
- 修 typos、注释、悬停文案（不改变断言）

## 确认话术模板

```text
将覆盖 Chat API Test 中模型 <id> 的汇总数据并提交 git，是否继续？
```

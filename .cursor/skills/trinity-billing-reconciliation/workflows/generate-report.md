# 生成月度核对报告（默认主流程）

## 输入

| 来源 | 内容 |
|------|------|
| **平台（后台导出，系统算）** | 上游编码/名称、账单月、统计起止、**平台成本 USD**、**平台 Token**（入+出+缓） |
| **上游（人手工拉）** | **实付 CNY**、实付 USD（或只给 CNY 由本流程 ÷6.5）、**上游 Token**、账单文件名/截图说明 |

用户可只贴：「上游编码 + ¥ + $ + Token + 月份」；平台侧从导出 CSV / 已有 notes 读。

## 步骤

1. READ [`../references/report-template.md`](../references/report-template.md)、[`./monthly-l0.md`](./monthly-l0.md)。
2. 对齐账单月与统计窗口；未完成月写明截止日。
3. 上游 USD：优先用户给的 $；否则 `现金 CNY ÷ 6.5`。赠金单列。
4. 算金额差、量差（有 Token 时）；套阈值 → MATCHED / 关注 / 下钻。
5. 按模板写报告段落；归因要点（测试未入账 / 刊例未校验 / 窗口等——有证据才写）。
6. 写入 `pricing/billing-reconciliation/<supplier>/YYYY-MM/`：  
   - `recon-report.md`（或合并进 `notes.md` 的「核对报告」节）  
7. 收尾明确：  
   - **结论是否建议回填后台**  
   - **应填实付**：CNY / USD  
   - **本轮未改管理后台**

## 差大时

提示并可选进入 [`./daily-standard.md`](./daily-standard.md)；未下钻前结论标「待下钻」。

## 输出给用户的最低结构

```text
<供应商> 账单核对：
<月>：
上游官方实际 … $X（¥Y），Token …
Trinity 平台成本 … $Z，Token …
差异 … / 结论 …
（确认后可回填后台实付：¥Y / $X）
```

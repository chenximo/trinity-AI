# 供应商：腾讯云 AIGC

## 路径

`pricing/billing-reconciliation/tencent-aigc/YYYY-MM/`

## 平台

- 后台/导出：供应商含 `腾讯云AIGC`，编码常见 `tecent_aigc`  
- 成本 USD + Token（入+出+缓）

## 上游（人工）

- L2 资源账单·按计费周期：现金支付、赠金  
- 完整月未出齐时在报告标明窗口  

## 流程

1. [`./generate-report.md`](./generate-report.md)  
2. 差大 → [`./daily-standard.md`](./daily-standard.md)  
3. 刊例抽样 → `trinity-official-pricing`

## 坑

| 坑 | 处理 |
|----|------|
| ¥ 写到平台侧 | 禁止；上游才有 ¥1417 这类 |
| L2 描述百万 token 全量 | 不作对外「上游 Token」除非声明可比口径 |
| 月桶 | 日表平台高可能因费在月桶 |

# trinity-billing-reconciliation · 边界

## 本 Skill 负责

- 根据 **平台导出** + **人工上游账单数字** 生成/更新核对报告与 `notes.md`
- L0：成本金额 + Token 闸门；差大时标准日结 / 月桶 / 疑似测试
- 报告模板与对外结论防呆（左右勿反）
- `pricing/billing-reconciliation/**` 目录约定

## 不负责

| 领域 | 归谁 |
|------|------|
| 管理后台「上游实付」写入 | **人工**确认报告后操作；本 Skill 不写后台 |
| 后台加「平台 Token」等导出列的工程实现 | 产品/前后端工程（字段口径见 references） |
| 挂牌价 / 官方价 / 刊例发布 | `trinity-official-pricing` |
| 产品手册叙事 | `trinity-product-handbook` |
| 改库内 cost 单价 | 人工；可链 official-pricing 核查 |

## 易混

| 用户说 | 本 Skill | 不要误判 |
|--------|----------|----------|
| 对月账单 / 出核对报告 | ✅ | official-pricing |
| 核对刊例 / DeepSeek 缓价 | ❌ → official-pricing | |
| 帮我改后台实付金额 | ❌ 只提示确认后人工回填 | 代操作后台 |
